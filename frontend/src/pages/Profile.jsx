import { useEffect, useState } from 'react';
import { api } from '../utils/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {profile ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString()} {new Date(profile.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Loading profile...</div>
        )}
        <p className="mt-6 text-xs text-gray-500 italic">
          Predictions are for informational purposes only and do not guarantee winnings.
        </p>
      </div>
    </div>
  );
};

export default Profile;
