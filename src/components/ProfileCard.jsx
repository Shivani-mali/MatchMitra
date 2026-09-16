import { useState } from 'react';
import { Heart, ShieldCheck, Sparkles, MoreVertical, Eye, Ban, Flag, Send } from 'lucide-react';

const ProfileCard = ({
  profile,
  matchScore,
  labels = {},
  onLike,
  onUnlike,
  onSkip,
  onViewDetails,
  onSendInterest,
  onReport,
  onBlock,
  onUnblock,
  isLiked,
  isBlocked,
  showUnlike,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionLabel = showUnlike ? labels.unlikeLabel || '💔 Unlike' : labels.likeLabel || '❤️ Like';
  const canLike = typeof onLike === 'function' || typeof onUnlike === 'function';
  const canSendInterest = typeof onSendInterest === 'function';
  const canViewDetails = typeof onViewDetails === 'function';
  const canSkip = typeof onSkip === 'function';
  const canBlock = typeof onBlock === 'function' || typeof onUnblock === 'function';
  const canReport = typeof onReport === 'function';

  const scoreVal = matchScore?.score ?? 85;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      role={canViewDetails ? 'button' : undefined}
      tabIndex={canViewDetails ? 0 : undefined}
      onClick={(event) => {
        if (!canViewDetails) return;
        if (event.target.closest('button')) return;
        onViewDetails?.(profile);
      }}
      onKeyDown={(event) => {
        if (!canViewDetails) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewDetails?.(profile);
        }
      }}
    >
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500" />

      <div className="flex flex-col gap-4 p-5 pr-14 sm:flex-row sm:pr-16">
        {/* Avatar with gradient ring */}
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <img
            src={profile.photo || profile.photoURL || '/default-avatar.png'}
            alt={profile.name || 'User'}
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-rose-500/30 shadow-md sm:h-24 sm:w-24"
          />
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white" title="Verified Profile">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">{profile.name || 'Unknown'}</h3>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs font-semibold text-slate-500 truncate">
                {profile.age ? `${profile.age} yrs` : 'Age N/A'} • {profile.location || 'Location unknown'}
              </p>

              {/* Match & Trust Indicators */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-extrabold text-white shadow-sm shadow-rose-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  {labels.matchLabel ? labels.matchLabel.replace('{score}', scoreVal) : `${scoreVal}% Match`}
                </span>

                <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1">
                  <span className="text-[11px] font-semibold text-slate-600">Trust: {profile.trustScore || 80}%</span>
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${profile.trustScore || 80}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs font-bold text-slate-800 truncate">
                💼 {profile.profession || 'Profession not specified'}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                {profile.bio || 'No bio available.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className={`grid gap-2.5 ${canLike && canSendInterest ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {canLike && (
            <button
              type="button"
              onClick={() => (showUnlike ? onUnlike?.(profile) : onLike?.(profile))}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:from-rose-500 hover:to-pink-500 active:scale-95 cursor-pointer"
            >
              <span>{actionLabel}</span>
            </button>
          )}
          {canSendInterest && (
            <button
              type="button"
              onClick={() => onSendInterest(profile)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800 active:scale-95 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-rose-400" />
              <span>{labels.sendInterestLabel || 'Send Interest'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Menu dropdown */}
      <div className="absolute right-3 top-4 flex items-start gap-2">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl backdrop-blur-md">
            {canViewDetails && (
              <button
                type="button"
                onClick={() => {
                  onViewDetails(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>{labels.viewDetailsLabel || 'View details'}</span>
              </button>
            )}
            {canLike && !showUnlike && (
              <button
                type="button"
                onClick={() => {
                  onLike?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                <span>{labels.likeLabel || 'Like'}</span>
              </button>
            )}
            {canSkip && (
              <button
                type="button"
                onClick={() => {
                  onSkip(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span>{labels.skipLabel || 'Skip'}</span>
              </button>
            )}
            {showUnlike && isLiked && (
              <button
                type="button"
                onClick={() => {
                  onUnlike(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span>{labels.unlikeLabel || 'Unlike'}</span>
              </button>
            )}
            {canBlock && (isBlocked ? (
              <button
                type="button"
                onClick={() => {
                  onUnblock?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Ban className="h-3.5 w-3.5 text-slate-400" />
                <span>{labels.unblockLabel || 'Unblock'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onBlock?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Ban className="h-3.5 w-3.5 text-amber-500" />
                <span>{labels.blockLabel || 'Block'}</span>
              </button>
            ))}
            {canReport && (
              <button
                type="button"
                onClick={() => {
                  onReport(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{labels.reportLabel || 'Report'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProfileCard;
