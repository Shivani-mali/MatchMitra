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

const usersCollection = collection(db, 'users');
const interestsCollection = collection(db, 'interests');
const reportsCollection = collection(db, 'reports');
const chatsCollection = collection(db, 'chats');

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

export const createChatForUsers = async (currentUid, otherUid) => {
  const chatId = createChatId(currentUid, otherUid);
  const chatRef = doc(db, 'chats', chatId);
  const chatSnapshot = await getDoc(chatRef);

  if (!chatSnapshot.exists()) {
    await setDoc(chatRef, {
      users: [currentUid, otherUid],
      lastMessage: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(chatRef, {
      users: [currentUid, otherUid],
      updatedAt: serverTimestamp(),
    });
  }

  return chatId;
};

export const respondToInterest = async ({ interestId, status, currentUid, otherUid }) => {
  await updateInterestStatus(interestId, status);

  if (status === 'accepted') {
    await createChatForUsers(currentUid, otherUid);
  }
};

export const getInterestsForUser = async (uid) => {
  try {
    const receivedQuery = query(interestsCollection, where('toUser', '==', uid));
    const sentQuery = query(interestsCollection, where('fromUser', '==', uid));

    const [received, sent] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery),
    ]);

    const receivedData = received.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    const sentData = sent.docs.map((entry) => ({ id: entry.id, ...entry.data() }));

    return {
      received: receivedData,
      sent: sentData,
    };
  } catch (error) {
    console.error('Error fetching interests:', error);
    return { received: [], sent: [] };
  }
};

export const createChatId = (uidA, uidB) => [uidA, uidB].sort().join('_');

const getChatLastMessagePreview = ({ messageType, text, fileName }) => {
  if (messageType === 'image') {
    return `📷 ${fileName || 'Photo'}`;
  }

  if (messageType === 'voice') {
    return '🎤 Voice message';
  }

  return text || 'New message';
};

export const uploadChatMedia = async ({ chatId, senderId, file, folder }) => {
  const safeName = `${Date.now()}-${file.name}`;
  const mediaRef = ref(storage, `chats/${chatId}/${folder}/${senderId}/${safeName}`);

  await uploadBytes(mediaRef, file);
  return getDownloadURL(mediaRef);
};

export const sendMessage = async ({
  chatId,
  senderId,
  text = '',
  messageType = 'text',
  mediaUrl = '',
  fileName = '',
}) => {
  const chatRef = doc(db, 'chats', chatId);
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  const lastMessage = getChatLastMessagePreview({ messageType, text, fileName });

  // Create or update chat document
  await setDoc(chatRef, {
    users: chatId.split('_'),
    lastMessage,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Add the message
  await addDoc(messagesRef, {
    senderId,
    text,
    messageType,
    mediaUrl,
    fileName,
    createdAt: serverTimestamp(),
  });
};

export const sendImageMessage = async ({ chatId, senderId, imageFile, caption = '' }) => {
  const mediaUrl = await uploadChatMedia({
    chatId,
    senderId,
    file: imageFile,
    folder: 'images',
  });

  await sendMessage({
    chatId,
    senderId,
    text: caption,
    messageType: 'image',
    mediaUrl,
    fileName: imageFile.name,
  });
};

export const sendVoiceMessage = async ({ chatId, senderId, audioFile }) => {
  const mediaUrl = await uploadChatMedia({
    chatId,
    senderId,
    file: audioFile,
    folder: 'voice',
  });

  await sendMessage({
    chatId,
    senderId,
    text: '',
    messageType: 'voice',
    mediaUrl,
    fileName: audioFile.name,
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

export const getSuggestedMatches = async (currentUid, limit = 5) => {
  const allProfiles = await getAllProfiles();
  const filtered = allProfiles
    .filter((profile) => profile.uid !== currentUid)
    .slice(0, limit);
  return filtered;
};

export const getChatsForUser = async (uid) => {
  const chatsQuery = query(chatsCollection, where('users', 'array-contains', uid));
  const chatsSnapshot = await getDocs(chatsQuery);

  const chatPromises = chatsSnapshot.docs.map(async (entry) => {
    const data = entry.data();
    const users = data.users || [];
    const otherUid = users.find((memberUid) => memberUid !== uid);
    const otherProfile = otherUid ? await getProfileByUid(otherUid) : null;

    return {
      id: entry.id,
      chatId: entry.id,
      users,
      otherUid,
      otherProfile,
      lastMessage: data.lastMessage || '',
      updatedAt: data.updatedAt || null,
    };
  });

  const chats = await Promise.all(chatPromises);

  return chats.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() || 0;
    const bTime = b.updatedAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};
