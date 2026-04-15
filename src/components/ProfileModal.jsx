const ProfileModal = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{profile.name}'s Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Photo Gallery */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src={profile.photo || 'https://placehold.co/200x200?text=Photo'}
              alt="Profile"
              className="h-48 w-full rounded-xl object-cover"
            />
            <img
              src={profile.photo || 'https://placehold.co/200x200?text=Photo'}
              alt="Profile"
              className="h-48 w-full rounded-xl object-cover"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-slate-800">Basic Information</h3>
              <p className="text-sm text-slate-600">Age: {profile.age}</p>
              <p className="text-sm text-slate-600">Gender: {profile.gender}</p>
              <p className="text-sm text-slate-600">Location: {profile.location}</p>
              <p className="text-sm text-slate-600">Height: {profile.height} cm</p>
              <p className="text-sm text-slate-600">Marital Status: {profile.maritalStatus}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Professional</h3>
              <p className="text-sm text-slate-600">Profession: {profile.profession}</p>
              <p className="text-sm text-slate-600">Education: {profile.education}</p>
              <p className="text-sm text-slate-600">Language: {profile.language}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-slate-800">About Me</h3>
            <p className="text-sm text-slate-600">{profile.bio}</p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-slate-800">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest, index) => (
                <span key={index} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Family & Preferences */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-slate-800">Family</h3>
              <p className="text-sm text-slate-600">Religion: {profile.religion}</p>
              <p className="text-sm text-slate-600">Caste: {profile.caste}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Partner Preferences</h3>
              <p className="text-sm text-slate-600">Min Age: {profile.partnerPreferences?.minAge}</p>
              <p className="text-sm text-slate-600">Max Age: {profile.partnerPreferences?.maxAge}</p>
              <p className="text-sm text-slate-600">Location: {profile.partnerPreferences?.location}</p>
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