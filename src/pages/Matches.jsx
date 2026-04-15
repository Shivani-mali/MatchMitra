import { useEffect, useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../context/AuthContext';
import {
  getAllProfiles,
  incrementProfileViews,
  reportUser,
  sendInterest,
} from '../services/firestoreService';

const Matches = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: '',
    profession: '',
    religionOrCaste: '',
  });
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadProfiles = async () => {
      const allProfiles = await getAllProfiles();
      const filtered = allProfiles.filter((profile) => profile.uid !== user?.uid);
      setProfiles(filtered);

      await Promise.all(filtered.slice(0, 5).map((item) => incrementProfileViews(item.uid)));
    };

    loadProfiles();
  }, [user?.uid]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const age = Number(profile.age);
      const minAge = Number(filters.minAge) || 0;
      const maxAge = Number(filters.maxAge) || 200;
      const religionOrCaste = filters.religionOrCaste.toLowerCase();

      const ageMatch = age >= minAge && age <= maxAge;
      const locationMatch = !filters.location || (profile.location || '').toLowerCase().includes(filters.location.toLowerCase());
      const professionMatch = !filters.profession || (profile.profession || '').toLowerCase().includes(filters.profession.toLowerCase());
      const religionCasteMatch =
        !religionOrCaste ||
        (profile.religion || '').toLowerCase().includes(religionOrCaste) ||
        (profile.caste || '').toLowerCase().includes(religionOrCaste);

      return ageMatch && locationMatch && professionMatch && religionCasteMatch;
    });
  }, [profiles, filters]);

  const handleSendInterest = async (profile) => {
    if (!user?.uid) return;
    await sendInterest({ fromUid: user.uid, toUid: profile.uid });
    setStatus(`Interest sent to ${profile.name}`);
  };

  const handleReportUser = async (profile) => {
    if (!user?.uid) return;
    await reportUser({ reporterUid: user.uid, reportedUid: profile.uid, reason: 'Suspicious behavior' });
    setStatus(`Reported ${profile.name}. Our moderation team will review.`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-800">Find Matches</h1>
        <FilterBar filters={filters} setFilters={setFilters} />

        {status && <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{status}</p>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.uid}
              profile={profile}
              onSendInterest={handleSendInterest}
              onReport={handleReportUser}
            />
          ))}
        </section>
      </main>
    </div>
  );
};

export default Matches;
