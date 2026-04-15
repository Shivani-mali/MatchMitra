import { useEffect, useMemo, useState } from 'react';
import ChatbotWidget from '../components/ChatbotWidget';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../context/AuthContext';
import { getAllProfiles, getChatsForUser, getInterestsForUser } from '../services/firestoreService';

const StatCard = ({ label, value }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
  </article>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [interests, setInterests] = useState({ received: [], sent: [] });
  const [profiles, setProfiles] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      const interestsData = await getInterestsForUser(user.uid);
      const allProfiles = await getAllProfiles();
      const chatsData = await getChatsForUser(user.uid);
      setInterests(interestsData);
      setProfiles(allProfiles.filter((entry) => entry.uid !== user.uid));
      setChats(chatsData);
    };

    loadData();
  }, [user?.uid]);

  const suggestedMatches = useMemo(() => {
    const minAge = profile?.partnerPreferences?.minAge || 18;
    const maxAge = profile?.partnerPreferences?.maxAge || 99;

    return profiles.filter((candidate) => {
      const age = Number(candidate.age);
      const locationPref = (profile?.partnerPreferences?.location || '').toLowerCase();
      const locationMatch = !locationPref || (candidate.location || '').toLowerCase().includes(locationPref);

      return age >= minAge && age <= maxAge && locationMatch;
    });
  }, [profiles, profile?.partnerPreferences]);

  const acceptedInterestsCount = chats.length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to MatchMitra</h1>
          <p className="text-sm text-slate-500">Track your journey to meaningful matches.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Profile Views" value={profile?.profileViews ?? 0} />
          <StatCard label="Interests Received" value={interests.received.length} />
          <StatCard label="Matches Suggested" value={suggestedMatches.length} />
          <StatCard label="Messages" value={acceptedInterestsCount} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Interests Received */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Interests Received</h2>
            <p className="mt-1 text-sm text-slate-500">People who have shown interest in you.</p>
            <div className="mt-4 space-y-3">
              {interests.received.length > 0 ? (
                interests.received.map((interest) => {
                  const senderProfile = profiles.find((p) => p.uid === interest.fromUid);
                  return (
                    <div key={interest.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <img
                        src={senderProfile?.photoURL || 'https://placehold.co/40x40?text=U'}
                        alt={senderProfile?.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{senderProfile?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{senderProfile?.profession || ''}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        interest.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        interest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {interest.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No interests received yet.</p>
              )}
            </div>
          </section>

          {/* Matches Suggested */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Matches Suggested</h2>
            <p className="mt-1 text-sm text-slate-500">Potential matches based on your preferences.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {suggestedMatches.slice(0, 5).map((match) => (
                <ProfileCard
                  key={match.uid}
                  profile={match}
                  onSendInterest={() => {}}
                  onReport={() => {}}
                />
              ))}
            </div>
          </section>

          {/* Messages */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-800">Recent Chats</h2>
            <p className="mt-1 text-sm text-slate-500">Your ongoing conversations.</p>
            <div className="mt-4 space-y-3">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div key={chat.chatId} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <img
                      src={chat.otherProfile?.photoURL || 'https://placehold.co/40x40?text=U'}
                      alt={chat.otherProfile?.name || 'User'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{chat.otherProfile?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">
                        {chat.lastMessage ? chat.lastMessage.text : 'No messages yet'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {chat.lastMessage ? new Date(chat.lastMessage.createdAt?.toDate()).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No chats yet. Start a conversation!</p>
              )}
            </div>
          </section>
        </div>

        <ChatbotWidget />
      </main>
    </div>
  );
};

export default Dashboard;
