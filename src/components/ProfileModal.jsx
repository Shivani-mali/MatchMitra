const ProfileModal = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  const renderStars = (score = 0) => {
    const normalized = Math.max(0, Math.min(5, Number(score) || 0));
    const full = Math.floor(normalized);
    const hasHalf = normalized - full >= 0.5;

    return (
      <div className="inline-flex items-center gap-0.5" aria-label={`Profile rating ${normalized.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < full) {
            return <span key={`full-${index}`} className="text-amber-500">★</span>;
          }

          if (index === full && hasHalf) {
            return <span key={`half-${index}`} className="text-amber-500">⯪</span>;
          }

          return <span key={`empty-${index}`} className="text-slate-300">★</span>;
        })}
      </div>
    );
  };

  const displayValue = (value, fallback = 'Not provided') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && !value.trim()) return fallback;
    return value;
  };

  const interests = Array.isArray(profile.interests)
    ? profile.interests
    : Array.isArray(profile.hobbies)
    ? profile.hobbies
    : [];

  const photoSrc = profile.photo || profile.photoURL || 'https://placehold.co/200x200?text=Photo';
  const profileRating = Number(profile.rating ?? profile.trustScore ?? 80) / 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 md:text-2xl">{displayValue(profile.name, 'User')}'s Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close profile details"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Profile Rating</p>
                <div className="mt-1 flex items-center gap-2">
                  {renderStars(profileRating)}
                  <span className="text-sm font-bold text-amber-900">{profileRating.toFixed(1)}/5</span>
                </div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Trust Score: {profile.trustScore ?? 80}%
              </div>
            </div>
            <p className="mt-2 text-xs text-amber-800">
              This rating helps suggest how complete and trusted the profile looks.
            </p>
          </section>

          {/* Photo Gallery */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <img
              src={photoSrc}
              alt="Profile"
              className="h-44 w-full rounded-xl object-cover sm:h-48"
            />
            <img
              src={photoSrc}
              alt="Profile"
              className="h-44 w-full rounded-xl object-cover sm:h-48"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">Basic Information</h3>
              <p className="text-sm text-slate-600">Age: {displayValue(profile.age)}</p>
              <p className="text-sm text-slate-600">Gender: {displayValue(profile.gender)}</p>
              <p className="text-sm text-slate-600">Location: {displayValue(profile.location)}</p>
              <p className="text-sm text-slate-600">Height: {profile.height ? `${profile.height} cm` : 'Not provided'}</p>
              <p className="text-sm text-slate-600">Marital Status: {displayValue(profile.maritalStatus)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Professional</h3>
              <p className="text-sm text-slate-600">Profession: {displayValue(profile.profession)}</p>
              <p className="text-sm text-slate-600">Education: {displayValue(profile.education)}</p>
              <p className="text-sm text-slate-600">Language: {displayValue(profile.language)}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-slate-800">About Me</h3>
            <p className="text-sm text-slate-600">{displayValue(profile.bio)}</p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-slate-800">Interests</h3>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span key={index} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Not provided</p>
            )}
          </div>

          {/* Family & Preferences */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">Family</h3>
              <p className="text-sm text-slate-600">Religion: {displayValue(profile.religion)}</p>
              <p className="text-sm text-slate-600">Caste: {displayValue(profile.caste)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Partner Preferences</h3>
              <p className="text-sm text-slate-600">Min Age: {displayValue(profile.partnerPreferences?.minAge)}</p>
              <p className="text-sm text-slate-600">Max Age: {displayValue(profile.partnerPreferences?.maxAge)}</p>
              <p className="text-sm text-slate-600">Location: {displayValue(profile.partnerPreferences?.location)}</p>
            </div>
          </div>

          {/* Willing to relocate */}
          {profile.willingToRelocate && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">✈️ Willing to relocate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;