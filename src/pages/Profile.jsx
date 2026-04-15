import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  calculateProfileCompletion,
  getProfileByUid,
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
  height: '',
  maritalStatus: '',
  language: '',
  interests: '',
  willingToRelocate: false,
  isVerified: false,
  trustScore: 80,
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const getPhotoStorageKey = (uid) => `matchmitra_profile_photo_${uid}`;

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      try {
        const data = await getProfileByUid(user.uid);
        if (data) {
          const localPhoto = localStorage.getItem(getPhotoStorageKey(user.uid));
          const savedPhoto = data.photo || data.photoURL || localPhoto || '';
          setIsEditing(true);
          setProfile({
            name: data.name || '',
            age: data.age || '',
            gender: data.gender || '',
            location: data.location || '',
            religion: data.religion || '',
            caste: data.caste || '',
            profession: data.profession || '',
            education: data.education || '',
            hobbies: data.hobbies ? data.hobbies.join(', ') : '',
            bio: data.bio || '',
            photoURL: savedPhoto,
            height: data.height || '',
            maritalStatus: data.maritalStatus || '',
            language: data.language || '',
            interests: data.interests ? data.interests.join(', ') : '',
            willingToRelocate: data.willingToRelocate || false,
            isVerified: data.isVerified || false,
            trustScore: data.trustScore ?? 80,
            partnerPreferences: {
              minAge: data.partnerPreferences?.minAge || '',
              maxAge: data.partnerPreferences?.maxAge || '',
              location: data.partnerPreferences?.location || '',
              religion: data.partnerPreferences?.religion || '',
              caste: data.partnerPreferences?.caste || '',
            },
          });
        } else {
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setIsEditing(false);
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

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photoData = typeof reader.result === 'string' ? reader.result : '';
      updateField('photoURL', photoData);

      if (user?.uid && photoData) {
        localStorage.setItem(getPhotoStorageKey(user.uid), photoData);
      }
    };
    reader.readAsDataURL(file);
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

      setMessage('Profile saved successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/matches');
      }, 1500);
    } catch (error) {
      console.error('Profile save error:', error);
      setMessage(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-lg font-semibold text-slate-800">Profile Overview</h2>
        </div>
      </div>
      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
              </h1>
              <p className="text-sm text-slate-500">
                {isEditing ? 'Update your details anytime.' : 'Complete your details to unlock better matches.'}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                Completion: {completionPercent}%
              </div>
              {profile?.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✔️ Verified
                </span>
              )}
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-slate-600">Trust Score</span>
                <span className="text-sm font-bold text-slate-900">{profile?.trustScore ?? 80}%</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${profile?.trustScore ?? 80}%` }}
                  />
                </div>
              </div>
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
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Height (cm)" value={profile.height} onChange={(event) => updateField('height', event.target.value)} />
            <select className="rounded-lg border border-slate-200 px-3 py-2" value={profile.maritalStatus} onChange={(event) => updateField('maritalStatus', event.target.value)}>
              <option value="">Marital Status</option>
              <option value="single">Single</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Language" value={profile.language} onChange={(event) => updateField('language', event.target.value)} />
            <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" placeholder="Interests (comma separated)" value={profile.interests} onChange={(event) => updateField('interests', event.target.value)} />
            <label className="flex items-center md:col-span-2">
              <input type="checkbox" checked={profile.willingToRelocate} onChange={(event) => updateField('willingToRelocate', event.target.checked)} className="mr-2" />
              Willing to relocate
            </label>

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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <img
                  src={profile.photoURL || 'https://placehold.co/120x120?text=User'}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Upload image from your device. It is saved in your profile and also cached in local storage.
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <p className={`text-sm md:col-span-2 ${
                message.includes('failed') ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Profile' : 'Save Profile'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
