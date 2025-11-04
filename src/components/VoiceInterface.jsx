import { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, SpeakerOnIcon, SpeakerOffIcon } from './Icons';
import { API_ENDPOINTS } from '../config/api.js';

/**
 * Voice Interface Component
 * Handles text-to-speech (TTS) using OpenAI TTS API
 * Handles speech-to-text (STT) using Web Speech API
 */
function VoiceInterface({ 
  tutorMessage, 
  onTranscript, 
  isVoiceEnabled = true,
  onSpeakingChange,
  onAudioLevelChange 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false); // Muted by default
  const [volume, setVolume] = useState(1.0); // Volume from 0 to 1
  const [voice, setVoice] = useState('alloy'); // OpenAI voice: alloy, echo, fable, onyx, nova, shimmer
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null); // Audio element for OpenAI TTS
  const lastSpokenMessageRef = useRef(null); // Track last spoken message to prevent duplicates
  const isPlayingRef = useRef(false); // Track if audio is currently playing to prevent duplicates
  const [audioLevel, setAudioLevel] = useState(0); // Audio level for animation (0-1)
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Speech Recognition (STT - still using Web Speech API)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Don't pause audio here - audio is managed separately by the TTS useEffect
    };
  }, [onTranscript]);

  // Handle text-to-speech for tutor messages using OpenAI TTS
  // NOTE: TTS is controlled ONLY by voiceOutputEnabled toggle and volume - no other dependencies
  useEffect(() => {
    console.log('🔍 VoiceInterface TTS useEffect triggered:', {
      hasTutorMessage: !!tutorMessage,
      tutorMessageLength: tutorMessage?.length,
      tutorMessagePreview: tutorMessage?.substring(0, 50),
      voiceOutputEnabled,
      volume,
      isPlaying: isPlayingRef.current
    });

    // Only depend on toggle and volume - no browser API needed
    if (tutorMessage && tutorMessage.trim() && voiceOutputEnabled && volume > 0) {
      // Only speak if this is a NEW message (not the same one we already spoke)
      if (lastSpokenMessageRef.current === tutorMessage) {
        console.log('🔍 Skipping - already spoke this message');
        return;
      }
      
      // If already playing, stop the current audio first
      if (isPlayingRef.current && audioRef.current) {
        console.log('🔍 Stopping current audio to play new message');
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        audioRef.current = null;
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
        setAudioLevel(0);
        if (onAudioLevelChange) onAudioLevelChange(0);
      }
      
      console.log('🔍 All conditions met - proceeding to speak with OpenAI TTS');
      lastSpokenMessageRef.current = tutorMessage; // Mark as spoken
      
      // Small delay to ensure UI is ready and previous audio is stopped
      const timer = setTimeout(() => {
        speakWithOpenAI(tutorMessage);
      }, 100);

      return () => {
        clearTimeout(timer);
        // Don't stop audio here - let it finish naturally or be stopped explicitly
      };
    } else {
      console.log('🔍 TTS conditions not met:', {
        hasTutorMessage: !!tutorMessage,
        tutorMessageTrimmed: tutorMessage?.trim(),
        voiceOutputEnabled,
        volume,
        reason: !tutorMessage ? 'no message' : 
                !tutorMessage.trim() ? 'empty message' :
                !voiceOutputEnabled ? 'voice output disabled' :
                volume === 0 ? 'volume is 0' : 'unknown'
      });
    }
  }, [tutorMessage, voiceOutputEnabled, volume, voice]);

  // Function to speak using OpenAI TTS
  const speakWithOpenAI = async (message) => {
    // Prevent duplicate calls
    if (isPlayingRef.current) {
      console.log('🔍 Already playing - stopping previous audio first');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      isPlayingRef.current = false;
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
    }

    try {
      console.log('🔍 Starting OpenAI TTS...');
      isPlayingRef.current = true;
      setIsSpeaking(true);
      if (onSpeakingChange) onSpeakingChange(true);

      // Convert LaTeX math to natural speech
      const latexToSpeech = (text) => {
        let result = text;
        
        // First, handle block math: $$...$$ or \[...\]
        result = result.replace(/\$\$(.*?)\$\$/g, (match, math) => convertMathToSpeech(math));
        result = result.replace(/\\\[(.*?)\\\]/g, (match, math) => convertMathToSpeech(math));
        
        // Then handle inline math: $...$ or \(...\)
        result = result.replace(/\$([^$]+)\$/g, (match, math) => convertMathToSpeech(math));
        result = result.replace(/\\\((.*?)\\\)/g, (match, math) => convertMathToSpeech(math));
        
        // Also convert math expressions in regular text (like "x = -4" not in LaTeX delimiters)
        // Handle equations in text: x = -4, x = 0, x = 6
        result = result.replace(/([a-zA-Z])\s*=\s*(-?\d+)/g, (match, variable, num) => {
          const numStr = numberToWords(parseInt(num));
          return `${variable} equals ${numStr}`;
        });
        
        // Convert standalone negative numbers in text
        result = result.replace(/\s+(-\d+)\b/g, (match, num) => {
          return ` ${numberToWords(parseInt(num))}`;
        });
        
        // Remove LaTeX command markers that might remain
        result = result.replace(/\\\[/g, '');
        result = result.replace(/\\\]/g, '');
        result = result.replace(/\\\(/g, '');
        result = result.replace(/\\\)/g, '');
        
        // Remove markdown formatting
        result = result.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
        result = result.replace(/\*(.*?)\*/g, '$1'); // Italic
        
        // Clean up extra spaces
        result = result.replace(/\s+/g, ' ').trim();
        
        return result;
      };

      // Convert LaTeX math expression to natural speech
      const convertMathToSpeech = (mathExpr) => {
        if (!mathExpr) return '';
        
        let expr = mathExpr.trim();
        
        // Handle fractions first (before other conversions): \frac{a}{b} -> "a over b"
        expr = expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, num, den) => {
          return `${convertMathToSpeech(num)} over ${convertMathToSpeech(den)}`;
        });
        
        // Handle square roots: \sqrt{x} -> "square root of x"
        expr = expr.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
          return `square root of ${convertMathToSpeech(content)}`;
        });
        
        // Handle exponents: x^2 -> "x squared", x^3 -> "x cubed", x^n -> "x to the n"
        expr = expr.replace(/([a-zA-Z0-9]+)\^(\d+)/g, (match, base, exp) => {
          const expNum = parseInt(exp);
          if (expNum === 2) return `${base} squared`;
          if (expNum === 3) return `${base} cubed`;
          return `${base} to the ${numberToWords(expNum)}`;
        });
        
        // Handle equations: x = -4, x = 0, x = 6 -> "x equals negative four", etc.
        // This handles both standalone and inline math
        expr = expr.replace(/([a-zA-Z])\s*=\s*(-?\d+)/g, (match, variable, num) => {
          const numStr = numberToWords(parseInt(num));
          return `${variable} equals ${numStr}`;
        });
        
        // Handle standalone negative numbers: -4 -> "negative four"
        expr = expr.replace(/\b-(\d+)\b/g, (match, num) => {
          return `negative ${numberToWords(parseInt(num))}`;
        });
        
        // Handle standalone positive numbers: convert digits to words
        expr = expr.replace(/\b(\d+)\b/g, (match, num) => {
          return numberToWords(parseInt(num));
        });
        
        // Clean up extra spaces and normalize
        expr = expr.replace(/\s+/g, ' ').trim();
        
        return expr;
      };

      // Convert number to words (0-100)
      const numberToWords = (num) => {
        if (num < 0) return `negative ${numberToWords(-num)}`;
        if (num === 0) return 'zero';
        if (num <= 20) {
          const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
            'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
          return words[num];
        }
        if (num < 100) {
          const tens = Math.floor(num / 10);
          const ones = num % 10;
          const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
          if (ones === 0) return tensWords[tens];
          return `${tensWords[tens]} ${numberToWords(ones)}`;
        }
        // For numbers > 100, just return the number as digits
        return num.toString();
      };

      // Clean up LaTeX and markdown for better speech
      const cleanText = latexToSpeech(message);

      console.log('🔍 Cleaned text:', {
        originalLength: message.length,
        cleanedLength: cleanText.length,
        cleanedPreview: cleanText.substring(0, 100)
      });

      if (!cleanText) {
        console.warn('🔍 Clean text is empty - aborting speech');
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
        return;
      }

      // Calculate speed based on volume (optional - can keep at 1.0)
      const speed = 1.0;

      // Fetch audio from backend
      const response = await fetch(API_ENDPOINTS.tts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          voice: voice,
          speed: speed
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element and play
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.volume = volume;

      // Set up Web Audio API for audio level analysis
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        
        // Start monitoring audio levels
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const monitorAudio = () => {
          if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
            analyser.getByteFrequencyData(dataArray);
            // Get average volume level (normalize to 0-1)
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
            setAudioLevel(normalizedLevel);
            if (onAudioLevelChange) onAudioLevelChange(normalizedLevel);
            animationFrameRef.current = requestAnimationFrame(monitorAudio);
          } else {
            setAudioLevel(0);
            if (onAudioLevelChange) onAudioLevelChange(0);
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        };
        monitorAudio();
      } catch (error) {
        console.warn('🔍 Web Audio API not available, using fallback animation');
        // Fallback: use simple animation without audio level
        setAudioLevel(0.5);
      }

      audio.onplay = () => {
        console.log('🔍 ✅ OpenAI TTS audio started playing!');
        setIsSpeaking(true);
        if (onSpeakingChange) onSpeakingChange(true);
      };

      audio.onpause = () => {
        console.log('🔍 Audio paused');
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
      };

      audio.onended = () => {
        console.log('🔍 OpenAI TTS audio ended');
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setAudioLevel(0);
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
        // Clean up
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error('🔍 ❌ Audio playback error:', error);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setAudioLevel(0);
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      // Play audio
      await audio.play();
      console.log('🔍 Audio play() called successfully');

    } catch (error) {
      console.error('🔍 ❌ OpenAI TTS error:', error);
      isPlayingRef.current = false;
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceInputEnabled(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceInputEnabled(true);
    }
  };

  const toggleVoiceOutput = () => {
    const newState = !voiceOutputEnabled;
    setVoiceOutputEnabled(newState);
    console.log('🔍 Voice output toggled to:', newState);
    
    if (!newState) {
      // Stop current audio if disabling
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioLevel(0);
      if (onAudioLevelChange) onAudioLevelChange(0);
      isPlayingRef.current = false;
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
    } else if (newState && tutorMessage && tutorMessage.trim() && volume > 0) {
      // If enabling AND there's a message waiting, speak it
      // But first, stop any existing audio to prevent duplicates
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      isPlayingRef.current = false;
      console.log('🔍 Speaking message with OpenAI TTS (after stopping previous)');
      lastSpokenMessageRef.current = null; // Reset to allow re-speaking
      speakWithOpenAI(tutorMessage);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Update volume of currently playing audio
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Voice Input Toggle */}
      {isSpeechRecognitionSupported && (
        <button
          onClick={toggleVoiceInput}
          className={`p-2 rounded-full sketch-border-sm sketch-shadow-sm transition-colors ${
            isListening
              ? 'bg-red-200 hover:bg-red-300 animate-pulse'
              : voiceInputEnabled
              ? 'bg-blue-200 hover:bg-blue-300'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={isListening ? 'Listening... Click to stop' : 'Toggle voice input'}
        >
          <MicrophoneIcon className="w-5 h-5" />
          {isListening && (
            <span className="ml-1 text-xs">...</span>
          )}
        </button>
      )}

      {/* Voice Output Toggle and Volume Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleVoiceOutput}
          className={`p-2 rounded-full sketch-border-sm sketch-shadow-sm transition-colors ${
            isSpeaking
              ? 'bg-green-200 hover:bg-green-300'
              : voiceOutputEnabled
              ? 'bg-blue-200 hover:bg-blue-300'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={voiceOutputEnabled ? 'Voice output enabled' : 'Voice output disabled'}
        >
          {isSpeaking || voiceOutputEnabled ? (
            <SpeakerOnIcon className="w-5 h-5" />
          ) : (
            <SpeakerOffIcon className="w-5 h-5" />
          )}
        </button>
        
        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!voiceOutputEnabled}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer sketch-border-sm volume-slider"
            style={{
              background: `linear-gradient(to right, #4A90E2 0%, #4A90E2 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
            }}
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="text-xs text-gray-600 min-w-[2.5rem] text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      {isListening && (
        <span className="text-xs text-gray-600 italic">Listening...</span>
      )}
      {isSpeaking && (
        <span className="text-xs text-gray-600 italic">Speaking...</span>
      )}
    </div>
  );
}

export default VoiceInterface;
