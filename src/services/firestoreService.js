import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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

const usersCollection = collection(db, 'users');
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
  const profileDoc = await getDoc(doc(db, 'users', uid));
  return profileDoc.exists() ? profileDoc.data() : null;
};

export const upsertProfile = async (uid, profileData) => {
  const completionPercent = calculateProfileCompletion(profileData);
  const payload = {
    uid,
    name: profileData.name,
    age: profileData.age,
    gender: profileData.gender,
    location: profileData.location,
    religion: profileData.religion,
    caste: profileData.caste,
    profession: profileData.profession,
    education: profileData.education,
    hobbies: profileData.hobbies ? profileData.hobbies.split(',').map((h) => h.trim()) : [],
    bio: profileData.bio,
    photo: profileData.photoURL,
    profileComplete: completionPercent,
    trustScore: profileData.trustScore ?? 80,
    isVerified: profileData.isVerified ?? false,
    email: profileData.email,
    createdAt: profileData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid), payload, { merge: true });
  } catch (error) {
    console.error('Firestore save failed:', error);
    throw error;
  }
};

export const uploadProfilePhoto = async (uid, file) => {
  const imageRef = ref(storage, `profiles/${uid}/${Date.now()}-${file.name}`);
  try {
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  } catch (error) {
    console.error('Storage upload failed:', error);
    throw error;
  }
};

export const getAllProfiles = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
};

export const sendInterest = async ({ fromUid, toUid }) => {
  const interestPayload = {
    fromUser: fromUid,
    toUser: toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
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
  const receivedQuery = query(interestsCollection, where('toUser', '==', uid));
  const sentQuery = query(interestsCollection, where('fromUser', '==', uid));

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
  const chatRef = doc(db, 'chats', chatId);
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  // Create or update chat document
  await setDoc(chatRef, {
    users: chatId.split('_'),
    lastMessage: text,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Add the message
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
  const profileRef = doc(db, 'users', uid);
  const existing = await getDoc(profileRef);
  if (existing.exists()) {
    const currentViews = existing.data().profileViews || 0;
    await updateDoc(profileRef, { profileViews: currentViews + 1 });
  }
};

export const getChatsForUser = async (uid) => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('users', 'array-contains', uid),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(chatsQuery);
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
};

export const getSuggestedMatches = async (currentUid, limit = 5) => {
  const allProfiles = await getAllProfiles();
  const filtered = allProfiles
    .filter((profile) => profile.uid !== currentUid)
    .slice(0, limit);
  return filtered;
};
