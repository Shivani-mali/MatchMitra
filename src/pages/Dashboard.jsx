import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatbotWidget from '../components/ChatbotWidget';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getAllProfiles,
  getChatsForUser,
  getInterestsForUser,
  getSuggestedMatches,
  sendInterest,
} from '../services/firestoreService';

const StatCard = ({ label, value, icon }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="text-2xl text-indigo-600">{icon}</div>
    </div>
  </article>
);

const ProfileCard = ({ profile, onInterest }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start space-x-3">
      <img
        src={profile.photo || '/default-avatar.png'}
        alt={profile.name}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-slate-800">{profile.name}</h3>
        <p className="text-sm text-slate-500">{profile.age} • {profile.location}</p>
        <p className="text-sm text-slate-600">{profile.profession}</p>
        <button
          onClick={() => onInterest(profile.uid)}
          className="mt-2 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Send Interest
        </button>
      </div>
    </div>
  </article>
);

const InterestCard = ({ interest, profiles }) => {
  const senderProfile = profiles.find(p => p.uid === interest.fromUser);
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center space-x-3">
        <img
          src={senderProfile?.photo || '/default-avatar.png'}
          alt={senderProfile?.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">
            {senderProfile?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-slate-500">Sent you an interest</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
          interest.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : interest.status === 'accepted'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {interest.status}
        </span>
      </div>
    </article>
  );
};

const ChatCard = ({ chat, profiles }) => {
  const otherUserId = chat.users.find(uid => uid !== chat.users[0]); // Assuming current user is first
  const otherProfile = profiles.find(p => p.uid === otherUserId);
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center space-x-3">
        <img
          src={otherProfile?.photo || '/default-avatar.png'}
          alt={otherProfile?.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">
            {otherProfile?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-slate-500">{chat.lastMessage || 'No messages yet'}</p>
        </div>
      </div>
    </article>
  );
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [interests, setInterests] = useState({ received: [], sent: [] });
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [chats, setChats] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      const [interestsData, matches, userChats, profiles] = await Promise.all([
        getInterestsForUser(user.uid),
        getSuggestedMatches(user.uid, 5),
        getChatsForUser(user.uid),
        getAllProfiles(),
      ]);

      setInterests(interestsData);
      setSuggestedMatches(matches);
      setChats(userChats);
      setAllProfiles(profiles);
    };

    loadData();
  }, [user?.uid]);

  const handleSendInterest = async (toUid) => {
    if (!user?.uid) return;
    try {
      await sendInterest({ fromUid: user.uid, toUid });
      // Refresh interests data
      const interestsData = await getInterestsForUser(user.uid);
      setInterests(interestsData);
    } catch (error) {
      console.error('Error sending interest:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b-4 border-blue-600 bg-blue-50 px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-blue-900">📊 DASHBOARD PAGE</h2>
        </div>
      </div>
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Track your journey to meaningful matches.</p>
        </section>

        {/* Navigation */}
        <section className="flex space-x-4 overflow-x-auto">
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/matches"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Matches
          </Link>
          <Link
            to="/profile"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Profile
          </Link>
          <Link
            to="/chat"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Chat
          </Link>
        </section>

        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Profile Views" value={profile?.profileViews ?? 0} icon="👁️" />
          <StatCard label="Interests Received" value={interests.received.length} icon="💌" />
          <StatCard label="Matches Suggested" value={suggestedMatches.length} icon="💕" />
          <StatCard label="Active Chats" value={chats.length} icon="💬" />
        </section>

        {/* Detailed Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Interests Received */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Interests Received</h2>
            <div className="space-y-3">
              {interests.received.length > 0 ? (
                interests.received.slice(0, 3).map((interest) => (
                  <InterestCard key={interest.id} interest={interest} profiles={allProfiles} />
                ))
              ) : (
                <p className="text-sm text-slate-500">No interests received yet.</p>
              )}
            </div>
            {interests.received.length > 3 && (
              <Link
                to="/matches"
                className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all interests →
              </Link>
            )}
          </section>

          {/* Suggested Matches */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Suggested Matches</h2>
            <div className="space-y-3">
              {suggestedMatches.length > 0 ? (
                suggestedMatches.map((match) => (
                  <ProfileCard key={match.uid} profile={match} onInterest={handleSendInterest} />
                ))
              ) : (
                <p className="text-sm text-slate-500">No matches available.</p>
              )}
            </div>
            <Link
              to="/matches"
              className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all matches →
            </Link>
          </section>

          {/* Recent Messages */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Recent Messages</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {chats.length > 0 ? (
                chats.slice(0, 4).map((chat) => (
                  <ChatCard key={chat.id} chat={chat} profiles={allProfiles} />
                ))
              ) : (
                <p className="text-sm text-slate-500 col-span-2">No active chats yet.</p>
              )}
            </div>
            {chats.length > 4 && (
              <Link
                to="/chat"
                className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all chats →
              </Link>
            )}
          </section>
        </div>

        <ChatbotWidget />
      </main>
    </div>
  );
};

export default Dashboard;
