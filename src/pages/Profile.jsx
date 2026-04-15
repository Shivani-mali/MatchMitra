import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  calculateProfileCompletion,
  getProfileByUid,
  uploadProfilePhoto,
  upsertProfile,
} from '../services/firestoreService';

const initialProfile = {
  name: '',
  age: '',
  gender: '',
  location: '',
  religion: '',
  caste: '',
  profession: '',
  education: '',
  hobbies: '',
  bio: '',
  photoURL: '',
  partnerPreferences: {
    minAge: '',
    maxAge: '',
    location: '',
    religion: '',
    caste: '',
  },
};

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      const data = await getProfileByUid(user.uid);
      if (data) {
        setProfile((prev) => ({
          ...prev,
          ...data,
          partnerPreferences: {
            ...prev.partnerPreferences,
            ...(data.partnerPreferences || {}),
          },
        }));
      }
    };

    loadProfile();
  }, [user?.uid]);

  const completionPercent = useMemo(() => calculateProfileCompletion(profile), [profile]);

  const updateField = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));
  const updatePreference = (field, value) =>
    setProfile((prev) => ({
      ...prev,
      partnerPreferences: { ...prev.partnerPreferences, [field]: value },
    }));

  const onPhotoChange = async (event) => {
    if (!event.target.files?.[0] || !user?.uid) return;
    setUploading(true);

    try {
      const photoURL = await uploadProfilePhoto(user.uid, event.target.files[0]);
      updateField('photoURL', photoURL);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...profile,
        uid: user.uid,
        email: user.email,
        age: Number(profile.age) || 0,
        partnerPreferences: {
          ...profile.partnerPreferences,
          minAge: Number(profile.partnerPreferences.minAge) || null,
          maxAge: Number(profile.partnerPreferences.maxAge) || null,
        },
      };

      await upsertProfile(user.uid, payload);
      await refreshProfile();

      setMessage('Profile saved successfully.');
      if (calculateProfileCompletion(payload) >= 90) {
        navigate('/dashboard');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Create Your Profile</h1>
              <p className="text-sm text-slate-500">Complete your details to unlock better matches.</p>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              Completion: {completionPercent}%
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Name" value={profile.name} onChange={(event) => updateField('name', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Age" value={profile.age} onChange={(event) => updateField('age', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Gender" value={profile.gender} onChange={(event) => updateField('gender', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Location" value={profile.location} onChange={(event) => updateField('location', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Religion (optional)" value={profile.religion} onChange={(event) => updateField('religion', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Caste (optional)" value={profile.caste} onChange={(event) => updateField('caste', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Profession" value={profile.profession} onChange={(event) => updateField('profession', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Education" value={profile.education} onChange={(event) => updateField('education', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" placeholder="Hobbies" value={profile.hobbies} onChange={(event) => updateField('hobbies', event.target.value)} />
            <textarea className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" rows={3} placeholder="Bio" value={profile.bio} onChange={(event) => updateField('bio', event.target.value)} />

            <div className="md:col-span-2 rounded-xl border border-slate-200 p-3">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Partner Preferences</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Preferred min age" value={profile.partnerPreferences.minAge} onChange={(event) => updatePreference('minAge', event.target.value)} />
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Preferred max age" value={profile.partnerPreferences.maxAge} onChange={(event) => updatePreference('maxAge', event.target.value)} />
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Preferred location" value={profile.partnerPreferences.location} onChange={(event) => updatePreference('location', event.target.value)} />
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Preferred religion (optional)" value={profile.partnerPreferences.religion} onChange={(event) => updatePreference('religion', event.target.value)} />
                <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" placeholder="Preferred caste (optional)" value={profile.partnerPreferences.caste} onChange={(event) => updatePreference('caste', event.target.value)} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Profile Photo</label>
              <input type="file" accept="image/*" onChange={onPhotoChange} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
              {uploading && <p className="mt-1 text-xs text-indigo-600">Uploading photo...</p>}
              {profile.photoURL && (
                <img src={profile.photoURL} alt="Profile" className="mt-3 h-24 w-24 rounded-xl object-cover" />
              )}
            </div>

            {message && <p className="text-sm text-emerald-700 md:col-span-2">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Profile;
