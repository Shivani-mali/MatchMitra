import { Router } from 'express';
import { adminDb } from '../firebaseAdmin.js';

const reportsRouter = Router();

reportsRouter.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    const reference = await adminDb.collection('reports').add(payload);
    const saved = await reference.get();
    return res.status(201).json({ id: saved.id, ...saved.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
});

reportsRouter.get('/', async (_req, res) => {
  try {
    const snapshot = await adminDb.collection('reports').orderBy('createdAt', 'desc').get();
    const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

export default reportsRouter;
