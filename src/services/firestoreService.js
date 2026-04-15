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
    height: profileData.height,
    maritalStatus: profileData.maritalStatus,
    language: profileData.language,
    interests: profileData.interests ? profileData.interests.split(',').map((i) => i.trim()) : [],
    willingToRelocate: profileData.willingToRelocate ?? false,
    likedUsers: profileData.likedUsers ?? [],
    viewedUsers: profileData.viewedUsers ?? [],
    shortlistedUsers: profileData.shortlistedUsers ?? [],
    blockedUsers: profileData.blockedUsers ?? [],
    profileViews: profileData.profileViews ?? 0,
    lastActive: serverTimestamp(),
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

    const pickLatest = (existing, candidate) => {
      const getMillis = (value) => value?.toMillis?.() || 0;
      const existingTime = Math.max(getMillis(existing.createdAt), getMillis(existing.updatedAt));
      const candidateTime = Math.max(getMillis(candidate.createdAt), getMillis(candidate.updatedAt));
      return candidateTime >= existingTime ? candidate : existing;
    };

    const dedupeInterests = (items, keySelector) => {
      const map = new Map();

      items.forEach((item) => {
        const key = keySelector(item);
        const existing = map.get(key);
        map.set(key, existing ? pickLatest(existing, item) : item);
      });

      return Array.from(map.values());
    };

    const receivedData = dedupeInterests(
      received.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
      (item) => `${item.fromUser}_${item.toUser}`,
    );

    const sentData = dedupeInterests(
      sent.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
      (item) => `${item.fromUser}_${item.toUser}`,
    );

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

export const incrementProfileViews = async (uid, viewerUid) => {
  const profileRef = doc(db, 'users', uid);
  const existing = await getDoc(profileRef);
  if (!existing.exists()) return;

  const currentViews = existing.data()?.profileViews ?? 0;
  const viewedUsers = existing.data()?.viewedUsers ?? [];
  if (!viewedUsers.includes(viewerUid)) {
    viewedUsers.push(viewerUid);
  }
  await updateDoc(profileRef, { profileViews: currentViews + 1, viewedUsers, lastActive: serverTimestamp() });
};

export const calculateMatchScore = (userProfile, candidateProfile) => {
  let score = 0;
  let reasons = [];

  // Interests match (hobbies/interests)
  const userInterests = userProfile.interests || [];
  const candidateInterests = candidateProfile.interests || [];
  const commonInterests = userInterests.filter(i => candidateInterests.includes(i));
  if (commonInterests.length > 0) {
    score += 30;
    reasons.push(`Shared interests: ${commonInterests.join(', ')}`);
  }

  // Location match
  if (userProfile.location && candidateProfile.location &&
      userProfile.location.toLowerCase() === candidateProfile.location.toLowerCase()) {
    score += 20;
    reasons.push('Same location');
  }

  // Age preference match
  const userMinAge = userProfile.partnerPreferences?.minAge || 18;
  const userMaxAge = userProfile.partnerPreferences?.maxAge || 99;
  const candidateAge = candidateProfile.age;
  if (candidateAge >= userMinAge && candidateAge <= userMaxAge) {
    score += 15;
    reasons.push('Age matches your preferences');
  }

  // Religion match
  if (userProfile.partnerPreferences?.religion &&
      userProfile.partnerPreferences.religion.toLowerCase() === candidateProfile.religion?.toLowerCase()) {
    score += 10;
    reasons.push('Religion matches');
  }

  // Education match
  if (userProfile.education && candidateProfile.education &&
      userProfile.education.toLowerCase() === candidateProfile.education.toLowerCase()) {
    score += 10;
    reasons.push('Education level matches');
  }

  // Profession match
  if (userProfile.profession && candidateProfile.profession &&
      userProfile.profession.toLowerCase() === candidateProfile.profession.toLowerCase()) {
    score += 10;
    reasons.push('Profession matches');
  }

  // Willing to relocate
  if (candidateProfile.willingToRelocate) {
    score += 5;
    reasons.push('Willing to relocate');
  }

  return { score: Math.min(score, 100), reasons };
};

export const likeUser = async (likerUid, likedUid) => {
  const likerRef = doc(db, 'users', likerUid);
  const likedRef = doc(db, 'users', likedUid);

  const likerDoc = await getDoc(likerRef);
  const likedDoc = await getDoc(likedRef);

  if (!likerDoc.exists() || !likedDoc.exists()) return false;

  const likerLiked = likerDoc.data().likedUsers || [];
  const likedLiked = likedDoc.data().likedUsers || [];

  if (!likerLiked.includes(likedUid)) {
    likerLiked.push(likedUid);
    await updateDoc(likerRef, { likedUsers: likerLiked });
  }

  // Check for mutual like
  if (likedLiked.includes(likerUid)) {
    return true; // It's a match!
  }
  return false;
};

export const shortlistUser = async (userUid, shortlistedUid) => {
  const userRef = doc(db, 'users', userUid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return;

  const shortlisted = userDoc.data().shortlistedUsers || [];
  if (!shortlisted.includes(shortlistedUid)) {
    shortlisted.push(shortlistedUid);
    await updateDoc(userRef, { shortlistedUsers: shortlisted });
  }
};

export const blockUser = async (blockerUid, blockedUid) => {
  const blockerRef = doc(db, 'users', blockerUid);
  const blockerDoc = await getDoc(blockerRef);
  if (!blockerDoc.exists()) return;

  const blocked = blockerDoc.data().blockedUsers || [];
  if (!blocked.includes(blockedUid)) {
    blocked.push(blockedUid);
    await updateDoc(blockerRef, { blockedUsers: blocked });
  }
};

export const unblockUser = async (blockerUid, blockedUid) => {
  const blockerRef = doc(db, 'users', blockerUid);
  const blockerDoc = await getDoc(blockerRef);
  if (!blockerDoc.exists()) return;

  const blocked = blockerDoc.data().blockedUsers || [];
  const updated = blocked.filter((uid) => uid !== blockedUid);
  await updateDoc(blockerRef, { blockedUsers: updated });
};

export const unlikeUser = async (likerUid, likedUid) => {
  const likerRef = doc(db, 'users', likerUid);
  const likerDoc = await getDoc(likerRef);
  if (!likerDoc.exists()) return;

  const likerLiked = likerDoc.data().likedUsers || [];
  const updated = likerLiked.filter((uid) => uid !== likedUid);
  await updateDoc(likerRef, { likedUsers: updated });
};

export const skipUser = async (userUid, skippedUid) => {
  const userRef = doc(db, 'users', userUid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return;

  const skipped = userDoc.data().skippedUsers || [];
  if (!skipped.includes(skippedUid)) {
    skipped.push(skippedUid);
    await updateDoc(userRef, { skippedUsers: skipped });
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
