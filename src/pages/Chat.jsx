import { useEffect, useMemo, useState } from 'react';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { createChatId, getAllProfiles, getInterestsForUser } from '../services/firestoreService';

const Chat = () => {
  const { user } = useAuth();
  const [acceptedInterests, setAcceptedInterests] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [selectedUid, setSelectedUid] = useState('');

  useEffect(() => {
    const loadChatContext = async () => {
      if (!user?.uid) return;

      const interestsData = await getInterestsForUser(user.uid);
      const accepted = [...interestsData.received, ...interestsData.sent].filter(
        (interest) => interest.status === 'accepted',
      );
      setAcceptedInterests(accepted);

      const allProfiles = await getAllProfiles();
      const map = allProfiles.reduce((acc, profile) => {
        acc[profile.uid] = profile;
        return acc;
      }, {});
      setProfilesMap(map);
    };

    loadChatContext();
  }, [user?.uid]);

  const chatPartners = useMemo(() => {
    return acceptedInterests
      .map((interest) => (interest.fromUid === user?.uid ? interest.toUid : interest.fromUid))
      .filter((uid, index, arr) => arr.indexOf(uid) === index);
  }, [acceptedInterests, user?.uid]);

  const chatId = selectedUid ? createChatId(user.uid, selectedUid) : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-3 md:p-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">Accepted Interests</h1>
          <p className="mt-1 text-xs text-slate-500">Chat unlocks only after accepted interest.</p>

          <div className="mt-3 space-y-2">
            {chatPartners.length === 0 && (
              <p className="text-sm text-slate-500">No accepted interests yet.</p>
            )}

            {chatPartners.map((uid) => (
              <button
                key={uid}
                type="button"
                onClick={() => setSelectedUid(uid)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedUid === uid ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {profilesMap[uid]?.name || uid}
              </button>
            ))}
          </div>
        </aside>

        <section className="md:col-span-2">
          {chatId ? (
            <ChatBox chatId={chatId} currentUserId={user.uid} peerName={profilesMap[selectedUid]?.name} />
          ) : (
            <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              Select a match to start chatting.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Chat;
