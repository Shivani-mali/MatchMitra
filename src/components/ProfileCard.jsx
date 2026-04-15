import { useState } from 'react';

const ProfileCard = ({
  profile,
  matchScore,
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
  const actionLabel = showUnlike ? '💔 Unlike' : '❤️ Like';
  const canLike = typeof onLike === 'function' || typeof onUnlike === 'function';
  const canSendInterest = typeof onSendInterest === 'function';
  const canViewDetails = typeof onViewDetails === 'function';
  const canSkip = typeof onSkip === 'function';
  const canBlock = typeof onBlock === 'function' || typeof onUnblock === 'function';
  const canReport = typeof onReport === 'function';

  return (
    <article
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition hover:shadow-lg"
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
      <div className="flex flex-col gap-4 p-4 pr-14 sm:flex-row sm:p-5 sm:pr-16">
        <img
          src={profile.photo || profile.photoURL || 'https://placehold.co/120x120?text=User'}
          alt={profile.name || 'User'}
          className="mx-auto h-20 w-20 rounded-full object-cover sm:mx-0 sm:h-24 sm:w-24"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate pr-2">{profile.name || 'Unknown'}</h3>
              <p className="mt-1 text-sm text-slate-500 truncate">
                {profile.age ? `${profile.age} yrs` : 'Age N/A'} · {profile.location || 'Location unknown'}
              </p>
               {/* Match / Trust / Verified */}
               <div className="mt-2 flex flex-wrap items-center gap-2">
                 <span className="inline-flex w-max shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                   {matchScore?.score ?? 0}% Match
                 </span>
                 {profile.isVerified && (
                   <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                     ✔️ Verified
                   </span>
                 )}
                 <div className="flex items-center gap-1">
                   <span className="text-xs font-medium text-slate-600">{profile.trustScore || 80}%</span>
                   <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                     <div 
                         className="h-full bg-emerald-600"
                       style={{ width: `${profile.trustScore || 80}%` }}
                     />
                   </div>
                 </div>
               </div>
              <p className="mt-3 text-sm font-medium text-slate-700 truncate">
                {profile.profession || 'Profession not specified'}
              </p>
              <p className="mt-2 max-w-full truncate text-sm text-slate-500">
                {profile.bio || 'No bio available.'}
              </p>
            </div>
            <div className="shrink-0 text-right" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-4">
        <div className={`grid gap-3 ${canLike && canSendInterest ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
          {canLike && (
            <button
              type="button"
              onClick={() => (showUnlike ? onUnlike?.(profile) : onLike?.(profile))}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {actionLabel}
            </button>
          )}
          {canSendInterest && (
            <button
              type="button"
              onClick={() => onSendInterest(profile)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              💌 Send Interest
            </button>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-2 flex items-start gap-2 sm:right-3 sm:top-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
          aria-label="More actions"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 z-10 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {canViewDetails && (
              <button
                type="button"
                onClick={() => {
                  onViewDetails(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                View details
              </button>
            )}
            {canLike && !showUnlike && (
              <button
                type="button"
                onClick={() => {
                  onLike?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Like
              </button>
            )}
            {canSkip && (
              <button
                type="button"
                onClick={() => {
                  onSkip(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Skip
              </button>
            )}
            {showUnlike && isLiked && (
              <button
                type="button"
                onClick={() => {
                  onUnlike(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Unlike
              </button>
            )}
            {canBlock && (isBlocked ? (
              <button
                type="button"
                onClick={() => {
                  onUnblock?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Unblock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onBlock?.(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Block
              </button>
            ))}
            {canReport && (
              <button
                type="button"
                onClick={() => {
                  onReport(profile);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-slate-50"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProfileCard;
