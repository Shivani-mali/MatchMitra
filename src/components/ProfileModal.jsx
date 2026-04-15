import { useLanguage } from '../context/LanguageContext';

const ProfileModal = ({ profile, isOpen, onClose }) => {
  const { t } = useLanguage();

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
          <h2 className="text-xl font-bold text-slate-800 md:text-2xl">{displayValue(profile.name, 'User')}&apos;s Profile</h2>
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
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{t('profile.rating')}</p>
                <div className="mt-1 flex items-center gap-2">
                  {renderStars(profileRating)}
                  <span className="text-sm font-bold text-amber-900">{profileRating.toFixed(1)}/5</span>
                </div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Trust Score: {profile.trustScore ?? 80}%
              </div>
            </div>
              <p className="mt-2 text-xs text-amber-800">{t('profile.profileScoreHelp')}</p>
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
              <h3 className="font-semibold text-slate-800">{t('profile.basicInfo')}</h3>
              <p className="text-sm text-slate-600">{t('profile.age')}: {displayValue(profile.age, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.gender')}: {displayValue(profile.gender, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.location')}: {displayValue(profile.location, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.height')}: {profile.height ? `${profile.height} cm` : t('profile.noValue')}</p>
              <p className="text-sm text-slate-600">{t('profile.maritalStatus')}: {displayValue(profile.maritalStatus, t('profile.noValue'))}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{t('profile.professional')}</h3>
              <p className="text-sm text-slate-600">{t('profile.profession')}: {displayValue(profile.profession, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.education')}: {displayValue(profile.education, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.language')}: {displayValue(profile.language, t('profile.noValue'))}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-slate-800">{t('profile.aboutMe')}</h3>
            <p className="text-sm text-slate-600">{displayValue(profile.bio, t('profile.noValue'))}</p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-slate-800">{t('profile.interests')}</h3>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span key={index} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">{t('profile.noValue')}</p>
            )}
          </div>

          {/* Family & Preferences */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">{t('profile.family')}</h3>
              <p className="text-sm text-slate-600">{t('profile.religion')}: {displayValue(profile.religion, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.caste')}: {displayValue(profile.caste, t('profile.noValue'))}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{t('profile.partnerPreferences')}</h3>
              <p className="text-sm text-slate-600">{t('profile.minAge')}: {displayValue(profile.partnerPreferences?.minAge, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.maxAge')}: {displayValue(profile.partnerPreferences?.maxAge, t('profile.noValue'))}</p>
              <p className="text-sm text-slate-600">{t('profile.partnerLocation')}: {displayValue(profile.partnerPreferences?.location, t('profile.noValue'))}</p>
            </div>
          </div>

          {/* Willing to relocate */}
          {profile.willingToRelocate && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">✈️ {t('profile.willingToRelocate')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;