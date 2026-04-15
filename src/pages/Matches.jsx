import { useEffect, useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '../context/AuthContext';
import {
  blockUser,
  calculateMatchScore,
  getAllProfiles,
  likeUser,
  reportUser,
  sendInterest,
  skipUser,
  unlikeUser,
  unblockUser,
} from '../services/firestoreService';

const Matches = () => {
  const { user, profile: userProfile } = useAuth();
  const userUid = user?.uid;
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: '',
    profession: '',
    education: '',
    religion: '',
    language: '',
    height: '',
    maritalStatus: '',
    interests: '',
  });
  const [sortBy, setSortBy] = useState('compatibility');
  const [profiles, setProfiles] = useState([]);
  const [matchScores, setMatchScores] = useState({});
  const [status, setStatus] = useState('');
  const [modalProfile, setModalProfile] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [newMatchesCount, setNewMatchesCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadProfiles = async () => {
      const allProfiles = await getAllProfiles();
      const filtered = allProfiles.filter((profile) => profile.uid !== userUid);
      setProfiles(filtered);

      // Calculate match scores
      const scores = {};
      if (userProfile) {
        filtered.forEach((p) => {
          scores[p.uid] = calculateMatchScore(userProfile, p);
        });
      }
      setMatchScores(scores);

      // Load recently viewed from localStorage
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed);

      // Load liked profiles
      const liked = filtered.filter((p) => userProfile?.likedUsers?.includes(p.uid));
      setLikedProfiles(liked);

      // Load shortlisted
      if (userProfile?.shortlistedUsers) {
        const shortlistedProfiles = filtered.filter((p) => userProfile.shortlistedUsers.includes(p.uid));
        setShortlisted(shortlistedProfiles);
      }

      // Mock new matches count
      setNewMatchesCount(Math.max(0, Math.min(9, Math.floor(Math.random() * 10))));
    };

    if (userUid) loadProfiles();
  }, [userUid, userProfile]);

  const filteredProfiles = useMemo(() => {
    let filtered = profiles.filter((profile) => {
      const age = Number(profile.age);
      const minAge = Number(filters.minAge) || 0;
      const maxAge = Number(filters.maxAge) || 200;
      const height = Number(filters.height) || 0;

      const ageMatch = age >= minAge && age <= maxAge;
      const locationMatch = !filters.location || (profile.location || '').toLowerCase().includes(filters.location.toLowerCase());
      const professionMatch = !filters.profession || (profile.profession || '').toLowerCase().includes(filters.profession.toLowerCase());
      const educationMatch = !filters.education || (profile.education || '').toLowerCase().includes(filters.education.toLowerCase());
      const religionMatch = !filters.religion || (profile.religion || '').toLowerCase().includes(filters.religion.toLowerCase());
      const languageMatch = !filters.language || (profile.language || '').toLowerCase().includes(filters.language.toLowerCase());
      const heightMatch = !height || (profile.height >= height - 10 && profile.height <= height + 10);
      const maritalMatch = !filters.maritalStatus || profile.maritalStatus === filters.maritalStatus;
      const interestsMatch = !filters.interests || profile.interests?.some(i => filters.interests.toLowerCase().includes(i.toLowerCase()));

      return ageMatch && locationMatch && professionMatch && educationMatch && religionMatch && languageMatch && heightMatch && maritalMatch && interestsMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return (matchScores[b.uid]?.score || 0) - (matchScores[a.uid]?.score || 0);
        case 'newest':
          return new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate());
        case 'distance':
          // Mock distance - use location similarity
          return (a.location || '').length - (b.location || '').length;
        case 'completeness':
          return b.profileComplete - a.profileComplete;
        case 'active':
          return new Date(b.lastActive?.toDate()) - new Date(a.lastActive?.toDate());
        default:
          return 0;
      }
    });

    return filtered;
  }, [profiles, filters, sortBy, matchScores]);

  const tabProfiles = useMemo(() => {
    switch (activeTab) {
      case 'liked':
        return likedProfiles;
      case 'shortlisted':
        return shortlisted;
      case 'viewed':
        return recentlyViewed;
      default:
        return filteredProfiles;
    }
  }, [activeTab, filteredProfiles, likedProfiles, shortlisted, recentlyViewed]);

  const activeTabLabel = {
    all: 'All Matches',
    liked: 'Liked Profiles',
    shortlisted: 'Shortlisted',
    viewed: 'Recently Viewed',
  }[activeTab];

  const noResultsMessage = 'No profiles yet';

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setStatus('');
  };

  const handleSendInterest = async (profile) => {
    if (!user?.uid) return;
    try {
      await sendInterest({ fromUid: user.uid, toUid: profile.uid });
      setStatus(`Interest sent to ${profile.name}!`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error sending interest:', error);
      setStatus('Failed to send interest. Try again.');
    }
  };

  const handleLike = async (profile) => {
    if (!user?.uid) return;
    try {
      const isMatch = await likeUser(user.uid, profile.uid);
      const alreadyLiked = likedProfiles.some((item) => item.uid === profile.uid);
      if (!alreadyLiked) {
        setLikedProfiles((prev) => [...prev, profile]);
      }

      if (isMatch) {
        setStatus(`💕 It's a match with ${profile.name}!`);
      } else {
        setStatus(`You liked ${profile.name}!`);
      }
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error liking user:', error);
      setStatus('Failed to like. Try again.');
    }
  };

  const handleUnlike = async (profile) => {
    if (!user?.uid) return;
    try {
      await unlikeUser(user.uid, profile.uid);
      setLikedProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));
      setStatus(`Removed ${profile.name} from likes.`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error unliking user:', error);
      setStatus('Failed to unlike. Try again.');
    }
  };

  const handleSkip = async (profile) => {
    if (!user?.uid) return;
    try {
      await skipUser(user.uid, profile.uid);
      setProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));
      setLikedProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));
      setShortlisted((prev) => prev.filter((item) => item.uid !== profile.uid));
      setRecentlyViewed((prev) => prev.filter((item) => item.uid !== profile.uid));
      setStatus(`Skipped ${profile.name}`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error skipping user:', error);
      setStatus('Failed to skip. Try again.');
    }
  };

  const handleUnblock = async (profile) => {
    if (!user?.uid) return;
    try {
      await unblockUser(user.uid, profile.uid);
      setStatus(`${profile.name} has been unblocked.`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error unblocking user:', error);
      setStatus('Failed to unblock. Try again.');
    }
  };

  const handleBlock = async (profile) => {
    if (!user?.uid) return;
    try {
      await blockUser(user.uid, profile.uid);
      setProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));
      setLikedProfiles((prev) => prev.filter((item) => item.uid !== profile.uid));
      setShortlisted((prev) => prev.filter((item) => item.uid !== profile.uid));
      setRecentlyViewed((prev) => prev.filter((item) => item.uid !== profile.uid));
      setStatus(`${profile.name} blocked.`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error blocking user:', error);
      setStatus('Failed to block. Try again.');
    }
  };

  const handleReportUser = async (profile) => {
    if (!user?.uid) return;
    try {
      await reportUser({ reporterUid: user.uid, reportedUid: profile.uid, reason: 'Suspicious behavior' });
      setStatus(`Reported ${profile.name}. Our team will review.`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error reporting user:', error);
      setStatus('Failed to report. Try again.');
    }
  };

  const handleViewDetails = (profile) => {
    setStatus(`Viewing ${profile.name}'s profile.`);
    setModalProfile(profile);
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-slate-900">Matches</h2>
        </div>
      </div>
      <main className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-800">Find Matches</h1>
        <div className="grid gap-4 md:grid-cols-4">
          <button
            type="button"
            onClick={() => handleTabClick('all')}
            className={`rounded-3xl border p-4 text-left transition ${activeTab === 'all' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profiles</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{filteredProfiles.length}</p>
            <p className="mt-2 text-sm text-slate-500">Available matches</p>
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('liked')}
            className={`rounded-3xl border p-4 text-left transition ${activeTab === 'liked' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Liked</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{likedProfiles.length}</p>
            <p className="mt-2 text-sm text-slate-500">Profiles you liked</p>
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('shortlisted')}
            className={`rounded-3xl border p-4 text-left transition ${activeTab === 'shortlisted' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Shortlisted</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{shortlisted.length}</p>
            <p className="mt-2 text-sm text-slate-500">Saved favorites</p>
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('viewed')}
            className={`rounded-3xl border p-4 text-left transition ${activeTab === 'viewed' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Viewed</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{recentlyViewed.length}</p>
            <p className="mt-2 text-sm text-slate-500">Recently viewed</p>
          </button>
        </div>

        <FilterBar filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} />

        {status && <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{status}</p>}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{activeTabLabel}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{tabProfiles.length} profiles</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {activeTab === 'all'
                  ? 'Browse all recommended matches or switch to curated lists for Liked, Shortlisted and Viewed profiles.'
                  : noResultsMessage}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === 'all' && newMatchesCount > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">{newMatchesCount} new</span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Sorted by {sortBy === 'compatibility' ? 'Compatibility' : sortBy === 'newest' ? 'Newest' : sortBy === 'distance' ? 'Distance' : sortBy === 'completeness' ? 'Completeness' : 'Recently active'}</span>
            </div>
          </div>

          {tabProfiles.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tabProfiles.map((profile) => (
                <ProfileCard
                  key={profile.uid}
                  profile={profile}
                  matchScore={matchScores[profile.uid]}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onSkip={handleSkip}
                  onViewDetails={handleViewDetails}
                  onSendInterest={handleSendInterest}
                  onReport={handleReportUser}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  isLiked={userProfile?.likedUsers?.includes(profile.uid)}
                  isBlocked={userProfile?.blockedUsers?.includes(profile.uid)}
                  showUnlike={activeTab === 'liked'}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-lg font-semibold text-slate-800">{noResultsMessage}</p>
            </div>
          )}
        </section>

        <ProfileModal
          profile={modalProfile}
          isOpen={!!modalProfile}
          onClose={() => setModalProfile(null)}
        />
      </main>
    </div>
  );
};

export default Matches;
