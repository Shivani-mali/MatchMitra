import { Router } from 'express';
import { adminDb } from '../firebaseAdmin.js';

const interestsRouter = Router();

interestsRouter.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reference = await adminDb.collection('interests').add(payload);
    const saved = await reference.get();
    return res.status(201).json({ id: saved.id, ...saved.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send interest', error: error.message });
  }
});

interestsRouter.patch('/:interestId/status', async (req, res) => {
  try {
    const { interestId } = req.params;
    const { status } = req.body;

    await adminDb.collection('interests').doc(interestId).set(
      {
        status,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const updated = await adminDb.collection('interests').doc(interestId).get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update interest', error: error.message });
  }
});

interestsRouter.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      adminDb.collection('interests').where('toUid', '==', uid).get(),
      adminDb.collection('interests').where('fromUid', '==', uid).get(),
    ]);

    const received = receivedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const sent = sentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ received, sent });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch interests', error: error.message });
  }
});

export default interestsRouter;
