import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserSuccess } from '../redux/slices/authSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      const data = response.data.data;
      const userProfile = data.user || data;

      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setRole(userProfile.role || '');
      
      dispatch(updateUserSuccess(userProfile));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      return toast.error('Name and Phone are required');
    }

    setUpdating(true);
    try {
      const response = await api.put('/user/profile', { name, phone });
      const data = response.data.data;
      const updatedUser = data.user || data;

      dispatch(updateUserSuccess(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md border border-gray-200" id="profile-page">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 font-semibold">Your Profile</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email Address (Read-only)</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Role (Read-only)</label>
          <input
            type="text"
            value={role}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 uppercase font-bold cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="1234567890"
            required
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors disabled:bg-gray-400 cursor-pointer"
        >
          {updating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
