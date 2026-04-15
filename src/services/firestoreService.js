import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

const profilesCollection = collection(db, 'profiles');
const interestsCollection = collection(db, 'interests');
const reportsCollection = collection(db, 'reports');

const requiredProfileFields = [
  'name',
  'age',
  'gender',
  'location',
  'profession',
  'education',
  'hobbies',
  'bio',
  'photoURL',
];

export const calculateProfileCompletion = (profile) => {
  const completed = requiredProfileFields.filter((field) => {
    const value = profile?.[field];
    if (typeof value === 'number') return value > 0;
    return Boolean(value && String(value).trim());
  }).length;

  return Math.round((completed / requiredProfileFields.length) * 100);
};

export const getProfileByUid = async (uid) => {
  const profileDoc = await getDoc(doc(db, 'profiles', uid));
  return profileDoc.exists() ? profileDoc.data() : null;
};

export const upsertProfile = async (uid, profileData) => {
  const completionPercent = calculateProfileCompletion(profileData);
  const payload = {
    ...profileData,
    completionPercent,
    isProfileComplete: completionPercent >= 90,
    trustScore: profileData.trustScore ?? 50,
    verified: profileData.verified ?? false,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
};

export const uploadProfilePhoto = async (uid, file) => {
  const imageRef = ref(storage, `profiles/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

export const getAllProfiles = async () => {
  const snapshot = await getDocs(profilesCollection);
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
};

export const sendInterest = async ({ fromUid, toUid }) => {
  const interestPayload = {
    fromUid,
    toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(interestsCollection, interestPayload);
};

export const updateInterestStatus = async (interestId, status) => {
  await updateDoc(doc(db, 'interests', interestId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getInterestsForUser = async (uid) => {
  const receivedQuery = query(interestsCollection, where('toUid', '==', uid));
  const sentQuery = query(interestsCollection, where('fromUid', '==', uid));

  const [received, sent] = await Promise.all([
    getDocs(receivedQuery),
    getDocs(sentQuery),
  ]);

  return {
    received: received.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
    sent: sent.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
  };
};

export const createChatId = (uidA, uidB) => [uidA, uidB].sort().join('_');

export const sendMessage = async ({ chatId, senderId, text }) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  });
};

export const reportUser = async ({ reporterUid, reportedUid, reason }) => {
  return addDoc(reportsCollection, {
    reporterUid,
    reportedUid,
    reason,
    status: 'open',
    createdAt: serverTimestamp(),
  });
};

export const incrementProfileViews = async (uid) => {
  const profileRef = doc(db, 'profiles', uid);
  const existing = await getDoc(profileRef);
  if (!existing.exists()) return;

  const currentViews = existing.data()?.profileViews ?? 0;
  await updateDoc(profileRef, { profileViews: currentViews + 1 });
};

export const getChatsForUser = async (uid) => {
  const interestsQuerySent = query(interestsCollection, where('status', '==', 'accepted'), where('fromUid', '==', uid));
  const interestsQueryReceived = query(interestsCollection, where('status', '==', 'accepted'), where('toUid', '==', uid));

  const [sent, received] = await Promise.all([getDocs(interestsQuerySent), getDocs(interestsQueryReceived)]);

  const allInterests = [...sent.docs, ...received.docs].map(doc => ({ id: doc.id, ...doc.data() }));

  const chatPromises = allInterests.map(async (interest) => {
    const otherUid = interest.fromUid === uid ? interest.toUid : interest.fromUid;
    const chatId = createChatId(uid, otherUid);

    // Get last message
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const lastMessageSnap = await getDocs(lastMessageQuery);
    const lastMessage = lastMessageSnap.docs[0]?.data();

    // Get other user's profile
    const otherProfile = await getProfileByUid(otherUid);

    return {
      chatId,
      otherUid,
      otherProfile,
      lastMessage: lastMessage ? { ...lastMessage, id: lastMessageSnap.docs[0].id } : null,
    };
  });

  return Promise.all(chatPromises);
};
