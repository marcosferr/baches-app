import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

// CORS configuration options
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXTAUTH_URL || 'https://your-production-domain.com'] // Restrict to your domain in production
    : ['http://localhost:3000'], // Allow localhost in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
};

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function initMiddleware(middleware: any) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

// Initialize the CORS middleware
export const cors = initMiddleware(Cors(corsOptions));
