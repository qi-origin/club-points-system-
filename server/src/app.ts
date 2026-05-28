import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middlewares/errorHandler';
import { upload } from './middlewares/upload';
import { authMiddleware, roleMiddleware, AuthRequest } from './middlewares/auth';
import authRoutes from './routes/auth';
import studentRoutes from './routes/student';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// File upload endpoint
app.post(
  '/api/upload',
  authMiddleware,
  roleMiddleware('student'),
  upload.single('file'),
  (req: AuthRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: '文件上传失败' });
      return;
    }
    if (isVercel && req.file.buffer) {
      // On Vercel, return base64 data URL (filesystem is read-only)
      const b64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
      res.json({ url: dataUrl, filename: req.file.originalname });
    } else {
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.originalname });
    }
  }
);

// Serve frontend static files in production (standalone mode, not Vercel)
const isVercel = !!process.env.VERCEL;
if (isProduction && !isVercel) {
  const clientDist = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('Serving frontend from', clientDist);
  }
}

// Error handler
app.use(errorHandler);

// Only listen when not running on Vercel (serverless)
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

export default app;
