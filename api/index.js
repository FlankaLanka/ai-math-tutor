/**
 * Vercel Serverless Function Entry Point
 * This file imports the Express app from backend/server.js
 * and exports it for Vercel's serverless function system
 */
import app from '../backend/server.js';

export default app;

