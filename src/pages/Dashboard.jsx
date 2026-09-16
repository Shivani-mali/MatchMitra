import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, Sparkles, ShieldCheck, ArrowRight, Star, Clock } from 'lucide-react';
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

const StatCard = ({ label, value, icon, gradient = 'from-rose-500 to-pink-600', onClick }) => (
  <motion.article
    whileHover={{ y: -3, scale: 1.01 }}
    className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md ${
      onClick ? 'cursor-pointer' : ''
    }`}
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
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-md shadow-rose-500/20`}>
        {icon}
      </div>
    </div>
  </motion.article>
);

const InterestCard = ({ interest, profiles, onAction, labels = {} }) => {
  const senderProfile = profiles.find((p) => p.uid === interest.fromUser);
  const isPending = interest.status === 'pending';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={senderProfile?.photo || senderProfile?.photoURL || '/default-avatar.png'}
          alt={senderProfile?.name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-200"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {senderProfile?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-slate-500">{labels.sentYouInterestLabel || 'Sent you an interest request'}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
            interest.status === 'pending'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : interest.status === 'accepted'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}
        >
          {interest.status}
        </span>
      </div>

      {isPending && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onAction(interest, 'accepted')}
            className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm cursor-pointer"
          >
            {labels.acceptLabel || 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => onAction(interest, 'rejected')}
            className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white transition hover:bg-rose-700 shadow-sm cursor-pointer"
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
          <p className="truncate text-sm font-bold text-slate-900">
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
        <p className="truncate text-sm font-bold text-slate-900">{profile?.name || 'Unknown User'}</p>
        <p className="truncate text-xs text-slate-500">{profile?.profession || 'Recently viewed profile'}</p>
      </div>
      <button
        type="button"
        onClick={() => onOpen(profile)}
        className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:from-rose-500 hover:to-pink-500 cursor-pointer shadow-sm"
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
  const acceptedMatchesCount = [...interests.received, ...interests.sent].filter(
    (item) => item.status === 'accepted'
  ).length;
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
      toast.success(
        isMatch ? t('matches.matchWith', { name: candidate.name }) : t('matches.liked', { name: candidate.name })
      );
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
          {/* Hero Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-rose-950 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/20 px-3.5 py-1 text-xs font-bold text-rose-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                  <span>MatchMitra AI Dashboard</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {t('dashboard.title')}
                </h1>
                <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                  {t('dashboard.subtitle')}
                </p>
              </div>

              {/* Profile Card Summary inside Hero */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 backdrop-blur-md min-w-[240px]">
                <div className="flex items-center gap-3">
                  <img
                    src={profile?.photo || profile?.photoURL || '/default-avatar.png'}
                    alt="User Avatar"
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-rose-500/40"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{profile?.name || 'Your Profile'}</p>
                    <p className="text-xs text-slate-400">{profile?.location || 'Set your location'}</p>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">{t('dashboard.trustScore')}</span>
                    <span className="text-emerald-400 font-bold">{profile?.trustScore || 80}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${profile?.trustScore || 80}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('dashboard.profileViews')}
              value={genuineProfileViews}
              icon={<Eye className="h-6 w-6" />}
              gradient="from-indigo-500 to-purple-600"
            />
            <StatCard
              label={t('dashboard.pendingInterests')}
              value={pendingInterestsCount}
              icon={<Heart className="h-6 w-6 fill-white" />}
              gradient="from-rose-500 to-pink-600"
              onClick={() => navigate('/matches')}
            />
            <StatCard
              label={t('dashboard.acceptedMatches')}
              value={acceptedMatchesCount}
              icon={<Sparkles className="h-6 w-6" />}
              gradient="from-emerald-500 to-teal-600"
              onClick={() => navigate('/matches')}
            />
            <StatCard
              label={t('dashboard.activeChats')}
              value={chats.length}
              icon={<MessageSquare className="h-6 w-6" />}
              gradient="from-sky-500 to-blue-600"
              onClick={() => navigate('/chat')}
            />
          </section>

          {/* Detailed Sections Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Interests Received */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                    {t('dashboard.interestsReceived')}
                  </h2>
                  <p className="text-xs text-slate-500">{t('dashboard.interestsSubtitle')}</p>
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
                      labels={{
                        acceptLabel: t('matches.accept'),
                        rejectLabel: t('matches.reject'),
                        sentYouInterestLabel: t('matches.sentYouInterest'),
                      }}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <Heart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-500">{t('dashboard.noInterests')}</p>
                  </div>
                )}
              </div>
              {interests.received.length > 3 && (
                <Link
                  to="/matches"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  <span>{t('dashboard.viewAllInterests')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>

            {/* Suggested Matches */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    {t('dashboard.suggestedMatches')}
                  </h2>
                  <p className="text-xs text-slate-500">{t('dashboard.suggestedSubtitle')}</p>
                </div>
                <Link
                  to="/matches"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {suggestedMatches.length > 0 ? (
                  suggestedMatches.slice(0, 2).map((match) => (
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
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-500">{t('dashboard.noMatches')}</p>
                  </div>
                )}
              </div>
              {suggestedMatches.length > 2 && (
                <Link
                  to="/matches"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>{t('dashboard.viewAllMatches')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>

            {/* Recently Viewed Profiles */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  {t('dashboard.recentlyViewed')}
                </h2>
                <p className="text-xs text-slate-500">{t('dashboard.recentlyViewedSubtitle')}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {recentViewedProfiles.length > 0 ? (
                  recentViewedProfiles.map((entry) => (
                    <RecentViewedCard
                      key={entry.uid}
                      profile={entry}
                      onOpen={handleViewDetails}
                      labels={{ viewLabel: t('dashboard.openRecentlyViewed') }}
                    />
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-500">{t('dashboard.noRecentlyViewed')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Recent Messages */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  {t('dashboard.recentMessages')}
                </h2>
                <p className="text-xs text-slate-500">{t('dashboard.recentMessagesSubtitle')}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {chats.length > 0 ? (
                  chats.slice(0, 4).map((chat) => <ChatCard key={chat.id} chat={chat} />)
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-500">{t('dashboard.noActiveChats')}</p>
                  </div>
                )}
              </div>
              {chats.length > 4 && (
                <Link
                  to="/chat"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  <span>{t('dashboard.viewAllChats')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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
