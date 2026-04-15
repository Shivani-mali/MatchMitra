const ProfileCard = ({ profile, onSendInterest, onReport }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <img
          src={profile.photo || profile.photoURL || 'https://placehold.co/100x100?text=User'}
          alt={profile.name || 'User'}
          className="h-20 w-20 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">{profile.name}</h3>
            {profile.verified && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Verified
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600">
            {profile.age} • {profile.gender} • {profile.location}
          </p>
          <p className="mt-1 text-sm text-slate-500">{profile.profession}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{profile.bio}</p>
          <p className="mt-2 text-xs text-slate-400">Trust Score: {profile.trustScore ?? 50}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSendInterest(profile)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Send Interest
        </button>
        <button
          type="button"
          onClick={() => onReport(profile)}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          Report User
        </button>
      </div>
    </article>
  );
};

export default ProfileCard;
