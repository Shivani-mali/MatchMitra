import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../context/AuthContext';
import {
  blockUser,
  getAllProfiles,
  getProfileByUid,
  getInterestsForUser,
  incrementProfileViews,
  likeUser,
  reportUser,
  respondToInterest,
  sendInterest,
} from '../services/firestoreService';

const MatchIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.4-9.2-8.5A5.6 5.6 0 0 1 12 5.6a5.6 5.6 0 0 1 9.2 5.9C19 15.6 12 20 12 20Z" />
  </svg>
);

const MatchesSkeleton = () => (
  <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="h-7 w-44 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </section>
  </main>
);

const InterestRequestCard = ({ interest, senderProfile, onAction }) => {
  const isPending = interest.status === 'pending';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={senderProfile?.photo || '/default-avatar.png'}
          alt={senderProfile?.name || 'Unknown User'}
          className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{senderProfile?.name || 'Unknown User'}</p>
          <p className="text-xs text-slate-500">{senderProfile?.profession || 'Match request received'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
          interest.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : interest.status === 'accepted'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {interest.status}
        </span>
      </div>

      {isPending && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onAction(interest, 'accepted')}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => onAction(interest, 'rejected')}
            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
};

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
  const [allProfiles, setAllProfiles] = useState([]);
  const [interests, setInterests] = useState({ received: [], sent: [] });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [profilesData, interestsData, currentProfile] = await Promise.all([
          getAllProfiles(),
          getInterestsForUser(user.uid),
          getProfileByUid(user.uid),
        ]);

        const blocked = currentProfile?.blockedUsers || [];
        const filtered = profilesData.filter(
          (profile) => profile.uid !== user?.uid && !blocked.includes(profile.uid)
        );

        setAllProfiles(profilesData);
        setProfiles(filtered);
        setInterests(interestsData);
        setBlockedUsers(blocked);

        await Promise.all(filtered.slice(0, 5).map((item) => incrementProfileViews(item.uid)));
      } catch (error) {
        console.error('Error loading matches data:', error);
        toast.error('Unable to load matches right now.');
      } finally {
        setLoading(false);
      }
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
    try {
      await sendInterest({ fromUid: user.uid, toUid: profile.uid });
      setStatus(`Interest sent to ${profile.name}!`);
      toast.success(`Interest sent to ${profile.name}`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error sending interest:', error);
      toast.error('Failed to send interest. Try again.');
      setStatus('Failed to send interest. Try again.');
    }
  };

  const handleLikeUser = async (profile) => {
    if (!user?.uid) return;

    try {
      const isMatch = await likeUser(user.uid, profile.uid);
      const message = isMatch ? `It's a match with ${profile.name}!` : `Liked ${profile.name}`;
      setStatus(message);
      toast.success(message);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error liking user:', error);
      toast.error('Failed to like profile. Try again.');
      setStatus('Failed to like profile. Try again.');
    }
  };

  const handleReportUser = async (profile) => {
    if (!user?.uid) return;
    try {
      await reportUser({ reporterUid: user.uid, reportedUid: profile.uid, reason: 'Suspicious behavior' });
      setStatus(`Reported ${profile.name}. Our team will review.`);
      toast.success(`Reported ${profile.name}`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Failed to report. Try again.');
      setStatus('Failed to report. Try again.');
    }
  };

  const handleBlockUser = async (profile) => {
    if (!user?.uid) return;

    try {
      await blockUser(user.uid, profile.uid);

      setBlockedUsers((prev) => {
        if (prev.includes(profile.uid)) return prev;
        return [...prev, profile.uid];
      });

      setProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));

      setStatus('User blocked.');
      toast.success('User blocked');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user. Try again.');
      setStatus('Failed to block user. Try again.');
    }
  };

  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
  };

  const handleInterestAction = async (interest, nextStatus) => {
    if (!user?.uid) return;

    try {
      await respondToInterest({
        interestId: interest.id,
        status: nextStatus,
        currentUid: user.uid,
        otherUid: interest.fromUser,
      });

      const interestsData = await getInterestsForUser(user.uid);
      setInterests(interestsData);
      setStatus(nextStatus === 'accepted' ? 'Interest accepted. Chat created.' : 'Interest rejected.');
      toast.success(nextStatus === 'accepted' ? 'Interest accepted. Chat created.' : 'Interest rejected.');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error handling interest action:', error);
      toast.error('Could not update interest. Try again.');
      setStatus('Could not update interest. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <MatchIcon className="h-5 w-5 text-indigo-600" />
            Matches
          </h2>
        </div>
      </div>
      {loading ? (
        <MatchesSkeleton />
      ) : (
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Find Matches</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse compatible profiles, apply filters, and manage incoming interest requests.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filter Profiles</h2>
          <div className="mt-3">
            <FilterBar filters={filters} setFilters={setFilters} />
          </div>
        </section>

        {status && <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{status}</p>}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Interests Received</h2>
          <p className="mt-1 text-sm text-slate-500">Accept to unlock chat, or reject to decline.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {interests.received.length > 0 ? (
              interests.received.map((interest) => {
                const senderProfile = allProfiles.find((profile) => profile.uid === interest.fromUser);
                return (
                  <InterestRequestCard
                    key={interest.id}
                    interest={interest}
                    senderProfile={senderProfile}
                    onAction={handleInterestAction}
                  />
                );
              })
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">No interests received yet.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recommended Profiles</h2>
            <p className="mt-1 text-sm text-slate-500">Based on your current filters and profile preferences.</p>
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProfiles.map((profile) => (
                <ProfileCard
                  key={profile.uid}
                  profile={profile}
                  onLike={handleLikeUser}
                  onSendInterest={handleSendInterest}
                  onViewDetails={handleViewDetails}
                  onReport={handleReportUser}
                  onBlock={handleBlockUser}
                  isBlocked={blockedUsers.includes(profile.uid)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">No matches found.</p>
            </div>
          )}
        </section>
      </main>
      )}

      <ProfileModal
        profile={selectedProfile}
        isOpen={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
};

export default Matches;
