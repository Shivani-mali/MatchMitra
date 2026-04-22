import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import ProfileCard from '../components/ProfileCard';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  blockUser,
  calculateMatchScore,
  getAllProfiles,
  getProfileByUid,
  getInterestsForUser,
  getReportsByReporter,
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

const getRecentViewsKey = (uid) => `matchmitra_recent_views_${uid}`;

const storeRecentViewedProfile = (currentUid, viewedUid) => {
  if (!currentUid || !viewedUid || currentUid === viewedUid) return;

  const storageKey = getRecentViewsKey(currentUid);
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const next = [viewedUid, ...existing.filter((uid) => uid !== viewedUid)].slice(0, 10);
  localStorage.setItem(storageKey, JSON.stringify(next));
};

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

const InterestRequestCard = ({ interest, senderProfile, onAction, labels = {} }) => {
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
          <p className="text-xs text-slate-500">{senderProfile?.profession || labels.receivedLabel || 'Match request received'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${interest.status === 'pending'
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
            {labels.acceptLabel || 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => onAction(interest, 'rejected')}
            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            {labels.rejectLabel || 'Reject'}
          </button>
        </div>
      )}
    </article>
  );
};

const ActivityProfileCard = ({ profile, label, tone = 'slate', labels = {} }) => {
  const toneClasses = tone === 'rose'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-indigo-100 text-indigo-700';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={profile?.photo || profile?.photoURL || '/default-avatar.png'}
          alt={profile?.name || 'Unknown User'}
          className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{profile?.name || 'Unknown User'}</p>
          <p className="truncate text-xs text-slate-500">{profile?.profession || labels.activityLabel || 'Profile activity'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${toneClasses}`}>
          {label}
        </span>
      </div>
    </article>
  );
};

const Matches = () => {
  const { user, profile: currentProfile } = useAuth();
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: '',
    profession: '',
    religionOrCaste: '',
    gender: '',
    maritalStatus: '',
    language: '',
    education: '',
    minHeight: '',
  });
  const [profiles, setProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [interests, setInterests] = useState({ received: [], sent: [] });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [likedUsers, setLikedUsers] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfiles = async () => {
      if (!user?.uid) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) setLoading(true);

      try {
        const [profilesResult, interestsResult, profileResult, reportsResult] = await Promise.allSettled([
          getAllProfiles(),
          getInterestsForUser(user.uid),
          getProfileByUid(user.uid),
          getReportsByReporter(user.uid),
        ]);

        const profilesData = profilesResult.status === 'fulfilled' ? profilesResult.value : [];
        const interestsData = interestsResult.status === 'fulfilled'
          ? interestsResult.value
          : { received: [], sent: [] };
        const loadedProfile = profileResult.status === 'fulfilled' ? profileResult.value : null;
        const reportsData = reportsResult.status === 'fulfilled' ? reportsResult.value : [];

        const blocked = Array.isArray(loadedProfile?.blockedUsers) ? loadedProfile.blockedUsers : [];
        const filtered = profilesData.filter(
          (profile) => profile.uid !== user?.uid && !blocked.includes(profile.uid)
        );

        if (!isMounted) return;

        setAllProfiles(profilesData);
        setProfiles(filtered);
        setInterests(interestsData);
        setBlockedUsers(blocked);
        setLikedUsers(Array.isArray(loadedProfile?.likedUsers) ? loadedProfile.likedUsers : []);
        setReportedUsers([...new Set((reportsData || []).map((item) => item.reportedUid).filter(Boolean))]);

        const hasCriticalLoadError = profilesResult.status === 'rejected' || profileResult.status === 'rejected';
        if (hasCriticalLoadError) {
          console.error('Matches partial load failure:', {
            profilesError: profilesResult.status === 'rejected' ? profilesResult.reason : null,
            profileError: profileResult.status === 'rejected' ? profileResult.reason : null,
          });
          toast.error(t('matches.partialLoadError'), { id: 'matches-load-error' });
        }

      } catch (error) {
        console.error('Error loading matches data:', error);
        toast.error(t('matches.loadingError'), { id: 'matches-load-error' });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const age = Number(profile.age);
      const minAge = Number(filters.minAge) || 0;
      const maxAge = Number(filters.maxAge) || 200;
      const height = Number(profile.height) || 0;
      const minHeight = Number(filters.minHeight) || 0;
      const religionOrCaste = filters.religionOrCaste.toLowerCase();

      const ageMatch = age >= minAge && age <= maxAge;
      const heightMatch = height >= minHeight;
      const locationMatch = !filters.location || (profile.location || '').toLowerCase().includes(filters.location.toLowerCase());
      const professionMatch = !filters.profession || (profile.profession || '').toLowerCase().includes(filters.profession.toLowerCase());
      const educationMatch = !filters.education || (profile.education || '').toLowerCase().includes(filters.education.toLowerCase());
      const languageMatch = !filters.language || (profile.language || '').toLowerCase().includes(filters.language.toLowerCase());
      const maritalStatusMatch = !filters.maritalStatus || profile.maritalStatus === filters.maritalStatus;
      const genderMatch = !filters.gender || (profile.gender || '').toLowerCase() === filters.gender.toLowerCase();

      const religionCasteMatch =
        !religionOrCaste ||
        (profile.religion || '').toLowerCase().includes(religionOrCaste) ||
        (profile.caste || '').toLowerCase().includes(religionOrCaste);

      return ageMatch && heightMatch && locationMatch && professionMatch && educationMatch && languageMatch && maritalStatusMatch && genderMatch && religionCasteMatch;
    });
  }, [profiles, filters]);

  const likedProfiles = useMemo(() => {
    if (!likedUsers.length) return [];
    return likedUsers
      .map((uid) => allProfiles.find((item) => item.uid === uid))
      .filter(Boolean);
  }, [likedUsers, allProfiles]);

  const reportedProfiles = useMemo(() => {
    if (!reportedUsers.length) return [];
    return reportedUsers
      .map((uid) => allProfiles.find((item) => item.uid === uid))
      .filter(Boolean);
  }, [reportedUsers, allProfiles]);

  const handleSendInterest = async (profile) => {
    if (!user?.uid) return;
    try {
      await sendInterest({ fromUid: user.uid, toUid: profile.uid });
      setStatus(t('matches.interestSent', { name: profile.name }));
      toast.success(t('matches.interestSent', { name: profile.name }));
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error sending interest:', error);
      toast.error(t('matches.failedInterest'));
      setStatus(t('matches.failedInterest'));
    }
  };

  const handleLikeUser = async (profile) => {
    if (!user?.uid) return;

    try {
      const isMatch = await likeUser(user.uid, profile.uid);
      const message = isMatch ? t('matches.matchWith', { name: profile.name }) : t('matches.liked', { name: profile.name });
      setStatus(message);
      toast.success(message);
      setLikedUsers((prev) => (prev.includes(profile.uid) ? prev : [profile.uid, ...prev]));
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error liking user:', error);
      toast.error(t('matches.failedLike'));
      setStatus(t('matches.failedLike'));
    }
  };

  const handleReportUser = async (profile) => {
    if (!user?.uid) return;
    try {
      await reportUser({ reporterUid: user.uid, reportedUid: profile.uid, reason: 'Suspicious behavior' });
      const reportMessage = t('matches.reportedByTeam', { name: profile.name });
      setStatus(reportMessage);
      toast.success(reportMessage);
      setReportedUsers((prev) => (prev.includes(profile.uid) ? prev : [profile.uid, ...prev]));
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error(t('matches.failedReport'));
      setStatus(t('matches.failedReport'));
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

      setStatus(t('matches.userBlocked'));
      toast.success(t('matches.userBlocked'));
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error(t('matches.failedBlock'));
      setStatus(t('matches.failedBlock'));
    }
  };

  const handleViewDetails = async (profile) => {
    if (user?.uid) {
      await incrementProfileViews(profile.uid, user.uid);
      storeRecentViewedProfile(user.uid, profile.uid);
    }
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
      setStatus(nextStatus === 'accepted' ? t('matches.interestAccepted') : t('matches.interestRejected'));
      toast.success(nextStatus === 'accepted' ? t('matches.interestAccepted') : t('matches.interestRejected'));
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error handling interest action:', error);
      toast.error(t('matches.failedUpdateInterest'));
      setStatus(t('matches.failedUpdateInterest'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <MatchIcon className="h-5 w-5 text-indigo-600" />
            {t('matches.title')}
          </h2>
        </div>
      </div>
      {loading ? (
        <MatchesSkeleton />
      ) : (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 md:py-12">
          <section className="relative">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:px-10 md:py-12">
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                  {t('matches.title')}
                </h1>
                <p className="text-base font-medium text-slate-500 md:text-lg">
                  {t('matches.subtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`group flex items-center gap-3 rounded-2xl px-7 py-4 text-sm font-bold transition-all active:scale-95 ${showFilters
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'
                  }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4Z" />
                </svg>
                {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
            </div>

            {showFilters && (
              <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40 transition-all animate-in fade-in slide-in-from-top-8 duration-700">
                <div className="border-b border-slate-50 bg-slate-50/20 px-10 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-10 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Personalize Your Search</h2>
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <FilterBar filters={filters} setFilters={setFilters} />
                </div>
              </div>
            )}
          </section>

          {status && <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{status}</p>}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{t('matches.interestsReceived')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('matches.interestsHelp')}</p>

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
                      labels={{ acceptLabel: t('matches.accept'), rejectLabel: t('matches.reject'), receivedLabel: t('matches.sentYouInterest') }}
                    />
                  );
                })
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('matches.noInterests')}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{t('matches.likedProfiles')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('matches.likedHelp')}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {likedProfiles.length > 0 ? (
                likedProfiles.map((profile) => (
                  <ActivityProfileCard key={profile.uid} profile={profile} label={t('matches.likedProfiles')} tone="indigo" labels={{ activityLabel: t('matches.unknownUser') }} />
                ))
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('matches.noLiked')}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{t('matches.reportedProfiles')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('matches.reportedHelp')}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {reportedProfiles.length > 0 ? (
                reportedProfiles.map((profile) => (
                  <ActivityProfileCard key={profile.uid} profile={profile} label={t('matches.reportedProfiles')} tone="rose" labels={{ activityLabel: t('matches.unknownUser') }} />
                ))
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('matches.noReported')}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('matches.recommendedProfiles')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('matches.recommendedHelp')}</p>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.uid}
                    profile={profile}
                    matchScore={calculateMatchScore(currentProfile || {}, profile)}
                    labels={{
                      matchLabel: t('matches.matchPercent', { score: calculateMatchScore(currentProfile || {}, profile).score }),
                      sendInterestLabel: t('matches.sendInterest'),
                      likeLabel: t('matches.like'),
                      unlikeLabel: t('matches.unlike'),
                      viewDetailsLabel: t('matches.viewDetails'),
                      skipLabel: t('matches.skip'),
                      blockLabel: t('matches.block'),
                      unblockLabel: t('matches.unblock'),
                      reportLabel: t('matches.report'),
                    }}
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
                <p className="text-sm text-slate-500">{t('matches.noMatches')}</p>
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
      <Footer />
    </div>
  );
};

export default Matches;
