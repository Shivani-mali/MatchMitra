import { useEffect, useMemo, useState } from 'react';
import ChatbotWidget from '../components/ChatbotWidget';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getAllProfiles, getInterestsForUser } from '../services/firestoreService';

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

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      const interestsData = await getInterestsForUser(user.uid);
      const allProfiles = await getAllProfiles();
      setInterests(interestsData);
      setProfiles(allProfiles.filter((entry) => entry.uid !== user.uid));
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

  const acceptedInterestsCount = [...interests.received, ...interests.sent].filter(
    (entry) => entry.status === 'accepted',
  ).length;

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
          <StatCard label="Messages (Accepted Chats)" value={acceptedInterestsCount} />
        </section>

        <ChatbotWidget />
      </main>
    </div>
  );
};

export default Dashboard;
