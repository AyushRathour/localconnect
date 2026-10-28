import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { seedDatabase } from './server/db/seed';

// Import route modules
import authRoutes from './server/routes/auth';
import categoriesRoutes from './server/routes/categories';
import servicesRoutes from './server/routes/services';
import providersRoutes from './server/routes/providers';
import bookingsRoutes from './server/routes/bookings';
import reviewsRoutes from './server/routes/reviews';
import customerRoutes from './server/routes/customer';
import notificationsRoutes from './server/routes/notifications';
import contactRoutes from './server/routes/contact';
import adminRoutes from './server/routes/admin';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Seed initial demonstration data if empty
  await seedDatabase(false);

  // Core Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'LocalConnect Full-Stack API',
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
    });
  });

  // Safe idempotent seed endpoint for demo / testing
  app.post('/api/v1/seed', async (req: Request, res: Response) => {
    const force = Boolean(req.body && req.body.force);
    const result = await seedDatabase(force);
    res.json({ success: true, ...result });
  });

  // Mount API routers
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/categories', categoriesRoutes);
  apiRouter.use('/services', servicesRoutes);
  apiRouter.use('/providers', providersRoutes);
  apiRouter.use('/bookings', bookingsRoutes);
  apiRouter.use('/reviews', reviewsRoutes);
  apiRouter.use('/customer', customerRoutes);
  apiRouter.use('/notifications', notificationsRoutes);
  apiRouter.use('/contact', contactRoutes);
  apiRouter.use('/admin', adminRoutes);

  app.use('/api/v1', apiRouter);

  // Global API Error Handler
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected server error occurred.',
    });
  });

  // Frontend Serving
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LocalConnect] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL] Failed to start LocalConnect server:', err);
  process.exit(1);
});
