import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import visionRoutes from './routes/vision.js';
import validateRoutes from './routes/validate.js';
import ttsRoutes from './routes/tts.js';

// Load environment variables (only needed for local development)
// Vercel provides env vars automatically, so this is optional
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// Increase body size limit for large images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Math Tutor API is running' });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', visionRoutes);
app.use('/api', validateRoutes);
app.use('/api', ttsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel serverless function
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`📸 Vision endpoint: http://localhost:${PORT}/api/vision`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`✅ Validation endpoint: http://localhost:${PORT}/api/validate`);
    console.log(`🔊 TTS endpoint: http://localhost:${PORT}/api/tts`);
  });
}

