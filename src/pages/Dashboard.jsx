import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileModal from '../components/ProfileModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  calculateMatchScore,
  getAllProfiles,
  getChatsForUser,
  getInterestsForUser,
  getSuggestedMatches,
  blockUser,
  incrementProfileViews,
  likeUser,
  reportUser,
  respondToInterest,
  sendInterest,
} from '../services/firestoreService';
import MatchProfileCard from '../components/ProfileCard';

const EyeIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HeartIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.4-9.2-8.5A5.6 5.6 0 0 1 12 5.6a5.6 5.6 0 0 1 9.2 5.9C19 15.6 12 20 12 20Z" />
  </svg>
);

const ChatIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 19.5 4 22v-3.6A8.5 8.5 0 1 1 7 19.5Z" />
  </svg>
);

const SparkIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.8 13.8 8.2 19.2 10 13.8 11.8 12 17.2 10.2 11.8 4.8 10l5.4-1.8L12 2.8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 20.5 16.5 23.5 17.5 20.5 18.5 19.5 21.5 18.5 18.5 15.5 17.5 18.5 16.5 19.5 13.5Z" />
  </svg>
);

const getRecentViewsKey = (uid) => `matchmitra_recent_views_${uid}`;

const getRecentViewedIds = (uid) => {
  if (!uid) return [];

  try {
    return JSON.parse(localStorage.getItem(getRecentViewsKey(uid)) || '[]');
  } catch {
    return [];
  }
};

const storeRecentViewedProfile = (currentUid, viewedUid) => {
  if (!currentUid || !viewedUid || currentUid === viewedUid) return;

  const existing = getRecentViewedIds(currentUid);
  const next = [viewedUid, ...existing.filter((uid) => uid !== viewedUid)].slice(0, 10);
  localStorage.setItem(getRecentViewsKey(currentUid), JSON.stringify(next));
};

const StatCard = ({ label, value, icon, tone = 'text-indigo-600', onClick }) => (
  <article
    className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(event) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
  >
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 ${tone}`}>
        {icon}
      </div>
    </div>
  </article>
);

const ProfileCard = ({ profile, onInterest, labels = {} }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
    <div className="flex items-start gap-3">
      <img
        src={profile.photo || '/default-avatar.png'}
        alt={profile.name}
        className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{profile.name}</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {profile.age} • {profile.location}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                  ✔️ Verified
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-slate-600">{profile.trustScore ?? 80}%</span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${profile.trustScore ?? 80}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {labels.matchLabel || 'Match'}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600">{profile.profession}</p>

        <button
          type="button"
          onClick={() => onInterest(profile.uid)}
          className="mt-4 inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          {labels.sendInterestLabel || 'Send Interest'}
        </button>
      </div>
    </div>
  </article>
);

const InterestCard = ({ interest, profiles, onAction, labels = {} }) => {
  const senderProfile = profiles.find(p => p.uid === interest.fromUser);
  const isPending = interest.status === 'pending';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={senderProfile?.photo || '/default-avatar.png'}
          alt={senderProfile?.name}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {senderProfile?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-slate-500">{labels.sentYouInterestLabel || 'Sent you an interest request'}</p>
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

const ChatCard = ({ chat }) => {
  const otherProfile = chat.otherProfile;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={otherProfile?.photo || '/default-avatar.png'}
          alt={otherProfile?.name}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {otherProfile?.name || 'Unknown User'}
          </p>
          <p className="truncate text-xs text-slate-500">{chat.lastMessage || 'No messages yet'}</p>
        </div>
      </div>
    </article>
  );
};

const RecentViewedCard = ({ profile, onOpen, labels = {} }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
    <div className="flex items-center gap-3">
      <img
        src={profile?.photo || profile?.photoURL || '/default-avatar.png'}
        alt={profile?.name || 'Unknown User'}
        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{profile?.name || 'Unknown User'}</p>
        <p className="truncate text-xs text-slate-500">{profile?.profession || 'Recently viewed profile'}</p>
      </div>
      <button
        type="button"
        onClick={() => onOpen(profile)}
        className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
      >
        {labels.viewLabel || 'View'}
      </button>
    </div>
  </article>
);

const DashboardSkeleton = () => (
  <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </section>
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
      <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
    </section>
  </main>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [interests, setInterests] = useState({ received: [], sent: [] });
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [chats, setChats] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [recentViewedProfiles, setRecentViewedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const pendingInterestsCount = interests.received.filter((item) => item.status === 'pending').length;
  const acceptedMatchesCount = [...interests.received, ...interests.sent].filter((item) => item.status === 'accepted').length;
  const genuineProfileViews = Array.isArray(profile?.viewedUsers)
    ? profile.viewedUsers.filter(Boolean).length
    : profile?.profileViews ?? 0;

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
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

        const recentIds = getRecentViewedIds(user.uid);
        const recentProfiles = recentIds
          .map((uid) => profiles.find((entry) => entry.uid === uid))
          .filter(Boolean)
          .slice(0, 4);
        setRecentViewedProfiles(recentProfiles);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error(t('matches.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  const handleSendInterest = async (toUid) => {
    if (!user?.uid) return;
    try {
      await sendInterest({ fromUid: user.uid, toUid });
      const interestsData = await getInterestsForUser(user.uid);
      setInterests(interestsData);
      const targetName = allProfiles.find((item) => item.uid === toUid)?.name || '';
      toast.success(t('matches.interestSent', { name: targetName }));
    } catch (error) {
      console.error('Error sending interest:', error);
      toast.error(t('matches.failedInterest'));
    }
  };

  const handleLikeUser = async (candidate) => {
    if (!user?.uid) return;

    try {
      const isMatch = await likeUser(user.uid, candidate.uid);
      toast.success(isMatch ? t('matches.matchWith', { name: candidate.name }) : t('matches.liked', { name: candidate.name }));
    } catch (error) {
      console.error('Error liking user:', error);
      toast.error(t('matches.failedLike'));
    }
  };

  const handleViewDetails = async (candidate) => {
    if (user?.uid) {
      await incrementProfileViews(candidate.uid, user.uid);
      storeRecentViewedProfile(user.uid, candidate.uid);
      setRecentViewedProfiles((prev) => {
        const next = [candidate, ...prev.filter((item) => item.uid !== candidate.uid)].slice(0, 4);
        return next;
      });
    }
    setSelectedProfile(candidate);
  };

  const handleBlockUser = async (candidate) => {
    if (!user?.uid) return;

    try {
      await blockUser(user.uid, candidate.uid);
      setSuggestedMatches((prev) => prev.filter((item) => item.uid !== candidate.uid));
      toast.success(t('matches.userBlocked'));
    } catch (error) {
      console.error('Error blocking suggested user:', error);
      toast.error(t('matches.failedBlock'));
    }
  };

  const handleReportUser = async (candidate) => {
    if (!user?.uid) return;

    try {
      await reportUser({ reporterUid: user.uid, reportedUid: candidate.uid, reason: 'Suspicious behavior' });
      toast.success(t('matches.reportedByTeam', { name: candidate.name }));
    } catch (error) {
      console.error('Error reporting suggested user:', error);
      toast.error(t('matches.failedReport'));
    }
  };

  const handleInterestAction = async (interest, status) => {
    if (!user?.uid) return;

    try {
      await respondToInterest({
        interestId: interest.id,
        status,
        currentUid: user.uid,
        otherUid: interest.fromUser,
      });

      const [interestsData, userChats] = await Promise.all([
        getInterestsForUser(user.uid),
        getChatsForUser(user.uid),
      ]);

      setInterests(interestsData);
      setChats(userChats);
      toast.success(status === 'accepted' ? t('matches.interestAccepted') : t('matches.interestRejected'));
    } catch (error) {
      console.error(`Error updating interest to ${status}:`, error);
      toast.error(t('matches.failedUpdateInterest'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <SparkIcon className="h-5 w-5 text-indigo-600" />
            {t('dashboard.title')}
          </h2>
        </div>
      </div>
      {loading ? (
        <DashboardSkeleton />
      ) : (
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.subtitle')}</p>
           {/* Trust Score & Verified Badge */}
           <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
             <div className="flex items-center gap-2">
               <span className="text-sm font-semibold text-slate-600">{t('dashboard.yourProfile')}:</span>
               {profile?.isVerified && (
                 <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                   ✔️ Verified
                 </span>
               )}
             </div>
             <div className="flex items-center gap-3">
               <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-600">{t('dashboard.trustScore')}</span>
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-900">{profile?.trustScore || 80}%</span>
                   <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                     <div 
                       className="h-full bg-indigo-600"
                       style={{ width: `${profile?.trustScore || 80}%` }}
                     />
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('dashboard.profileViews')} value={genuineProfileViews} icon={<EyeIcon className="h-5 w-5" />} />
          <StatCard
            label={t('dashboard.pendingInterests')}
            value={pendingInterestsCount}
            icon={<HeartIcon className="h-5 w-5" />}
            tone="text-rose-600"
            onClick={() => navigate('/matches')}
          />
          <StatCard
            label={t('dashboard.acceptedMatches')}
            value={acceptedMatchesCount}
            icon={<SparkIcon className="h-5 w-5" />}
            tone="text-violet-600"
            onClick={() => navigate('/matches')}
          />
          <StatCard
            label={t('dashboard.activeChats')}
            value={chats.length}
            icon={<ChatIcon className="h-5 w-5" />}
            tone="text-sky-600"
            onClick={() => navigate('/chat')}
          />
        </section>

        {/* Detailed Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Interests Received */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.interestsReceived')}</h2>
                <p className="text-sm text-slate-500">{t('dashboard.interestsSubtitle')}</p>
              </div>
            </div>
            <div className="space-y-3">
              {interests.received.length > 0 ? (
                interests.received.slice(0, 3).map((interest) => (
                  <InterestCard
                    key={interest.id}
                    interest={interest}
                    profiles={allProfiles}
                    onAction={handleInterestAction}
                    labels={{ acceptLabel: t('matches.accept'), rejectLabel: t('matches.reject'), sentYouInterestLabel: t('matches.sentYouInterest') }}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('dashboard.noInterests')}</p>
                </div>
              )}
            </div>
            {interests.received.length > 3 && (
              <Link
                to="/matches"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t('dashboard.viewAllInterests')}
              </Link>
            )}
          </section>

          {/* Suggested Matches */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.suggestedMatches')}</h2>
              <p className="text-sm text-slate-500">{t('dashboard.suggestedSubtitle')}</p>
              <Link to="/matches" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                {t('dashboard.openMatches')}
              </Link>
            </div>
            <div className="space-y-3">
              {suggestedMatches.length > 0 ? (
                suggestedMatches.map((match) => (
                  <MatchProfileCard
                    key={match.uid}
                    profile={match}
                    matchScore={calculateMatchScore(profile || {}, match)}
                    labels={{
                      matchLabel: t('matches.matchPercent', { score: calculateMatchScore(profile || {}, match).score }),
                      sendInterestLabel: t('dashboard.sendInterest'),
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
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('dashboard.noMatches')}</p>
                </div>
              )}
            </div>
            <Link
              to="/matches"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {t('dashboard.viewAllMatches')}
            </Link>
          </section>

          {/* Recent Messages */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recentlyViewed')}</h2>
              <p className="text-sm text-slate-500">{t('dashboard.recentlyViewedSubtitle')}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {recentViewedProfiles.length > 0 ? (
                recentViewedProfiles.map((entry) => (
                  <RecentViewedCard key={entry.uid} profile={entry} onOpen={handleViewDetails} labels={{ viewLabel: t('dashboard.openRecentlyViewed') }} />
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('dashboard.noRecentlyViewed')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Messages */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recentMessages')}</h2>
              <p className="text-sm text-slate-500">{t('dashboard.recentMessagesSubtitle')}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {chats.length > 0 ? (
                chats.slice(0, 4).map((chat) => (
                  <ChatCard key={chat.id} chat={chat} />
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">{t('dashboard.noActiveChats')}</p>
                </div>
              )}
            </div>
            {chats.length > 4 && (
              <Link
                to="/chat"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t('dashboard.viewAllChats')}
              </Link>
            )}
          </section>
        </div>

        <ProfileModal
          profile={selectedProfile}
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
        />

      </main>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
