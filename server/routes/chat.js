import { Router } from 'express';
import { adminDb } from '../firebaseAdmin.js';

const chatRouter = Router();

chatRouter.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const snapshot = await adminDb
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

chatRouter.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const payload = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    const reference = await adminDb.collection('chats').doc(chatId).collection('messages').add(payload);
    const saved = await reference.get();
    return res.status(201).json({ id: saved.id, ...saved.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

export default chatRouter;
