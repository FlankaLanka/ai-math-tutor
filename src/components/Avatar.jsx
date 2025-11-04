import { useState, useEffect } from 'react';

/**
 * Avatar Component
 * 2D sketch/cartoon style avatar with speaking and yay animations
 * Animation is synced to actual audio output level
 */
function Avatar({ 
  animation = 'idle', // 'idle' | 'speaking' | 'yay'
  audioLevel = 0, // 0-1, audio volume level for mouth animation
  size = 80 
}) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Animate when speaking or yay
  useEffect(() => {
    if (animation === 'idle') {
      setCurrentFrame(0);
      return;
    }

    // Frame rate for animations
    const frameRate = animation === 'yay' ? 20 : 30; // Faster for yay animation
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 4); // Cycle through 4 frames
    }, frameRate);

    return () => clearInterval(interval);
  }, [animation]);

  // Get animation-specific styles
  const getAnimationStyle = () => {
    if (animation === 'speaking') {
      // Subtle scale animation synced with mouth
      const scale = 1 + Math.sin(currentFrame * 2) * 0.03;
      return {
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-in-out',
      };
    } else if (animation === 'yay') {
      // Excited bouncing and rotation for celebration
      const bounce = Math.sin(currentFrame * 1.5) * 5; // Vertical bounce
      const rotate = Math.sin(currentFrame) * 10; // Slight rotation
      const scale = 1 + Math.sin(currentFrame * 2) * 0.15; // Scale pulsing
      return {
        transform: `translateY(${-bounce}px) rotate(${rotate}deg) scale(${scale})`,
        transition: 'transform 0.15s ease-in-out',
      };
    }
    return {};
  };

  return (
    <div 
      className="flex-shrink-0 flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={getAnimationStyle()}
        className="sketch-border-sm"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#FFE5B4"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Body/Robot torso */}
        <rect
          x="25"
          y="45"
          width="50"
          height="40"
          fill="#4A90E2"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          rx="5"
        />
        
        {/* Control panel buttons */}
        <circle cx="35" cy="60" r="3" fill="#333" />
        <circle cx="45" cy="60" r="3" fill="#333" />
        <circle cx="55" cy="60" r="3" fill="#333" />
        <circle cx="65" cy="60" r="3" fill="#333" />

        {/* Head */}
        <circle
          cx="50"
          cy="35"
          r="25"
          fill="#FFE5B4"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glasses (nerdy style) */}
        <rect
          x="30"
          y="28"
          width="18"
          height="12"
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          rx="2"
        />
        <rect
          x="52"
          y="28"
          width="18"
          height="12"
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          rx="2"
        />
        <line
          x1="48"
          y1="34"
          x2="52"
          y2="34"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Eyes - different for yay animation */}
        {animation === 'yay' ? (
          <g>
            {/* Sparkling eyes for yay */}
            <circle cx="38" cy="34" r="5" fill="#FFD700" opacity={0.8 + Math.sin(currentFrame * 2) * 0.2} />
            <circle cx="62" cy="34" r="5" fill="#FFD700" opacity={0.8 + Math.sin(currentFrame * 2) * 0.2} />
            <circle cx="38" cy="34" r="2.5" fill="#333" />
            <circle cx="62" cy="34" r="2.5" fill="#333" />
            {/* Sparkle effects */}
            <circle cx="38" cy="34" r="1" fill="#FFF" opacity={Math.sin(currentFrame * 3)} />
            <circle cx="62" cy="34" r="1" fill="#FFF" opacity={Math.sin(currentFrame * 3)} />
          </g>
        ) : (
          <g>
            <circle cx="38" cy="34" r="3" fill="#333" />
            <circle cx="62" cy="34" r="3" fill="#333" />
          </g>
        )}

        {/* Mouth - animated when speaking, big smile for yay, static otherwise */}
        {animation === 'speaking' ? (
          <ellipse
            cx="50"
            cy="45"
            rx={6 + Math.sin(currentFrame * 2) * 1.5 * Math.max(0.3, audioLevel)}
            ry={4 + Math.sin(currentFrame * 2) * 2 * Math.max(0.3, audioLevel)}
            fill="#333"
          />
        ) : animation === 'yay' ? (
          <path
            d="M 38 42 Q 50 52 62 42"
            fill="none"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 42 42 Q 50 46 58 42"
            fill="none"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Celebration elements for yay animation */}
        {animation === 'yay' && (
          <g>
            {/* Confetti/Stars around the avatar */}
            <circle
              cx={30 + Math.sin(currentFrame) * 10}
              cy={20 + Math.cos(currentFrame * 1.2) * 8}
              r="2"
              fill="#FF6B6B"
              opacity={0.7 + Math.sin(currentFrame * 2) * 0.3}
            />
            <circle
              cx={70 + Math.sin(currentFrame * 1.3) * 10}
              cy={20 + Math.cos(currentFrame * 0.9) * 8}
              r="2"
              fill="#4ECDC4"
              opacity={0.7 + Math.sin(currentFrame * 2.1) * 0.3}
            />
            <circle
              cx={25 + Math.sin(currentFrame * 0.8) * 8}
              cy={70 + Math.cos(currentFrame * 1.1) * 10}
              r="2"
              fill="#FFE66D"
              opacity={0.7 + Math.sin(currentFrame * 1.8) * 0.3}
            />
            <circle
              cx={75 + Math.sin(currentFrame * 1.2) * 8}
              cy={70 + Math.cos(currentFrame * 0.7) * 10}
              r="2"
              fill="#A8E6CF"
              opacity={0.7 + Math.sin(currentFrame * 2.2) * 0.3}
            />
          </g>
        )}

        {/* Antenna (robot style) */}
        <line
          x1="50"
          y1="10"
          x2="50"
          y2="15"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="10"
          r="2"
          fill="#FF6B6B"
        />
      </svg>
    </div>
  );
}

export default Avatar;

