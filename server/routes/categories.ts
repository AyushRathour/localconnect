import { Router, type Request, type Response } from 'express';
import { db } from '../db/store.ts';

const router = Router();

// GET /categories
router.get('/', (_req: Request, res: Response) => {
  const categories = db.categories.find({ active: true });
  // Dynamic service counts
  const enriched = categories.map((cat) => {
    const count = db.services.count({ categoryId: cat._id, active: true });
    return { ...cat, serviceCount: count };
  });

  res.json({
    success: true,
    data: enriched,
  });
});

// GET /categories/:slug
router.get('/:slug', (req: Request, res: Response) => {
  const category = db.categories.findOne({ slug: req.params.slug, active: true });
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }

  const count = db.services.count({ categoryId: category._id, active: true });
  res.json({
    success: true,
    data: { ...category, serviceCount: count },
  });
});

export default router;
