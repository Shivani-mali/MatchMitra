import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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

    const parsedAge = Number(profile.age);
    if (!parsedAge || parsedAge < 21 || parsedAge > 40) {
      setMessage('Age must be between 21 and 40 years.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...profile,
        uid: user.uid,
        email: user.email,
        age: parsedAge,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="mx-auto max-w-4xl p-3.5 sm:p-6 space-y-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                {isEditing ? t('profile.editProfile') : t('profile.createProfile')}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                {isEditing ? t('profile.updateDetails') : t('profile.completeDetails')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:flex-col sm:items-end">
              <div className="rounded-full bg-rose-50 border border-rose-100 px-3.5 py-1 text-xs font-bold text-rose-600">
                {t('profile.completion')}: {completionPercent}%
              </div>
              {profile?.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  ✔️ Verified Profile
                </span>
              )}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-bold text-slate-600">{t('dashboard.trustScore')}</span>
                <span className="text-xs font-extrabold text-slate-900">{profile?.trustScore ?? 80}%</span>
                <div className="h-2 w-20 sm:w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${profile?.trustScore ?? 80}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.name')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.name')} value={profile.name} onChange={(event) => updateField('name', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.age')}</label>
              <input type="number" min="21" max="40" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.age')} value={profile.age} onChange={(event) => updateField('age', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.gender')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.gender')} value={profile.gender} onChange={(event) => updateField('gender', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.location')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.location')} value={profile.location} onChange={(event) => updateField('location', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.religion')} (optional)</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.religion')} value={profile.religion} onChange={(event) => updateField('religion', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.caste')} (optional)</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.caste')} value={profile.caste} onChange={(event) => updateField('caste', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.profession')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.profession')} value={profile.profession} onChange={(event) => updateField('profession', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.education')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.education')} value={profile.education} onChange={(event) => updateField('education', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.height')} (cm)</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={`${t('profile.height')} (cm)`} value={profile.height} onChange={(event) => updateField('height', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('profile.maritalStatus')}</label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 cursor-pointer" value={profile.maritalStatus} onChange={(event) => updateField('maritalStatus', event.target.value)}>
                <option value="">{t('profile.maritalStatus')}</option>
                <option value="single">Single</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">{t('profile.language')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={t('profile.language')} value={profile.language} onChange={(event) => updateField('language', event.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">{t('profile.interests')}</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20" placeholder={`${t('profile.interests')} (comma separated)`} value={profile.interests} onChange={(event) => updateField('interests', event.target.value)} />
            </div>
            
            <label className="flex items-center gap-2.5 sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100/60 transition">
              <input type="checkbox" checked={profile.willingToRelocate} onChange={(event) => updateField('willingToRelocate', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
              {t('profile.willingToRelocate')}
            </label>

            <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">{t('profile.partnerPreferences')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-500" placeholder={`${t('profile.minAge')} - ${t('profile.partnerPreferences')}`} value={profile.partnerPreferences.minAge} onChange={(event) => updatePreference('minAge', event.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-500" placeholder={`${t('profile.maxAge')} - ${t('profile.partnerPreferences')}`} value={profile.partnerPreferences.maxAge} onChange={(event) => updatePreference('maxAge', event.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-500" placeholder={t('profile.partnerLocation')} value={profile.partnerPreferences.location} onChange={(event) => updatePreference('location', event.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-500" placeholder={`${t('profile.religion')} (optional)`} value={profile.partnerPreferences.religion} onChange={(event) => updatePreference('religion', event.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-500 sm:col-span-2" placeholder={`${t('profile.caste')} (optional)`} value={profile.partnerPreferences.caste} onChange={(event) => updatePreference('caste', event.target.value)} />
              </div>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-4 space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500">{t('profile.photo')}</label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  src={profile.photoURL || '/The_Match_mitra_logo.jpeg'}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-rose-500/20 shadow-sm"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-rose-600 hover:file:bg-rose-100"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Upload image from your device. It is saved in your profile and synced instantly.
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <p className={`text-xs font-bold sm:col-span-2 rounded-xl p-3 ${
                message.includes('failed') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:from-rose-500 hover:to-pink-500 active:scale-98 disabled:opacity-70 cursor-pointer"
            >
              {saving ? 'Saving Profile...' : isEditing ? 'Update Profile' : 'Save Profile'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
