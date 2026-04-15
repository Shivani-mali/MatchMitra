import { Router } from 'express';
import { adminDb } from '../firebaseAdmin.js';

const usersRouter = Router();

usersRouter.get('/', async (_req, res) => {
  try {
    const snapshot = await adminDb.collection('profiles').get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

usersRouter.get('/:uid', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('profiles').doc(req.params.uid).get();
    if (!snapshot.exists) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

usersRouter.put('/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    await adminDb.collection('profiles').doc(uid).set(
      {
        ...req.body,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const updated = await adminDb.collection('profiles').doc(uid).get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

export default usersRouter;
