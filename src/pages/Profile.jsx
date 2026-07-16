import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserSuccess, logout } from '../redux/slices/authSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Profile = () => {
  const dispatch = useDispatch();

  // Profile data states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Address states (loaded from API)
  const [country, setCountry] = useState('');
  const [cityState, setCityState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(JSON.parse(localStorage.getItem('profile_2fa') || 'false'));

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      const data = response.data.data;
      const userProfile = data.user || data;

      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setRole(userProfile.role || '');
      setCountry(userProfile.country || '');
      setCityState(userProfile.cityState || '');
      setPostalCode(userProfile.postalCode || '');
      setTaxId(userProfile.taxId || '');
      
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
    if (!firstName || !lastName || !phone) {
      return toast.error('First Name, Last Name and Phone are required');
    }

    if (phone.trim().length < 7 || phone.trim().length > 20) {
      return toast.error('Phone number must be between 7 and 20 characters');
    }

    setUpdating(true);
    try {
      const response = await api.put('/user/profile', { firstName, lastName, phone });
      const data = response.data.data;
      const updatedUser = data.user || data;

      dispatch(updateUserSuccess(updatedUser));
      toast.success('Profile updated successfully!');
      setShowProfileModal(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await api.put('/user/profile', { country, cityState, postalCode, taxId });
      const data = response.data.data;
      const updatedUser = data.user || data;

      dispatch(updateUserSuccess(updatedUser));
      toast.success('Address details updated!');
      setShowAddressModal(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error('Both password fields are required');
    }

    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long');
    }
    if (!/[A-Za-z]/.test(newPassword)) {
      return toast.error('New password must contain at least one letter');
    }
    if (!/\d/.test(newPassword)) {
      return toast.error('New password must contain at least one number');
    }

    setUpdating(true);
    try {
      await api.patch('/user/profile/password', { oldPassword: currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handle2faToggle = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    localStorage.setItem('profile_2fa', JSON.stringify(nextVal));
    toast.success(nextVal ? 'Two-factor authentication enabled!' : 'Two-factor authentication disabled.');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete('/user/profile');
      toast.success('Account deleted successfully.');
      dispatch(logout());
      window.location.href = '/register';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="profile-page">
      {/* Breadcrumbs and Page Header */}
      <div className="flex justify-between items-center pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            User Profile
          </h1>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
          <span>Home</span>
          <svg className="w-3 h-3 text-gray-400 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700 font-semibold">User Profile</span>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Card 1: My Profile */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* Silhouette default avatar */}
            <div className="w-20 h-20 overflow-hidden border-2 border-gray-100 rounded-full bg-gray-50 flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="size-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="text-center sm:text-left">
              <h4 className="text-xl font-bold text-gray-900">{name}</h4>
              <p className="text-sm text-gray-500 mt-1 capitalize font-medium">
                {role || 'Customer'} <span className="text-gray-300 mx-1.5">|</span> {cityState}
              </p>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-8 pt-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">First Name</p>
              <p className="text-sm font-semibold text-gray-800">{firstName || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Last Name</p>
              <p className="text-sm font-semibold text-gray-800">{lastName || 'N/A'}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 font-medium mb-1">Email address</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Phone</p>
              <p className="text-sm font-semibold text-gray-800">{phone || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Bio</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{role || 'Customer'}</p>
            </div>


          </div>
        </div>

        {/* Card 2: Address */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Address</h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 pt-2">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Country</p>
              <p className="text-sm font-semibold text-gray-800">{country}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">City/State</p>
              <p className="text-sm font-semibold text-gray-800">{cityState}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Postal Code</p>
              <p className="text-sm font-semibold text-gray-800">{postalCode}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">TAX ID</p>
              <p className="text-sm font-semibold text-gray-800">{taxId}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Security */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Security</h3>
          </div>

          <div className="space-y-6 divide-y divide-gray-100">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Change Password</h4>
                <p className="text-xs text-gray-500 mt-1">Receive real-time notifications and team alerts.</p>
              </div>
              <div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Danger Zone */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Danger Zone</h3>
          </div>

          <div className="space-y-6 divide-y divide-gray-100">
            {/* Logout all devices */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Logout all devices</h4>
                <p className="text-xs text-gray-500 mt-1">Sign out from every active session.</p>
              </div>
              <div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Delete account</h4>
                <p className="text-xs text-gray-500 mt-1">Sign out from every active session.</p>
              </div>
              <div>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 px-4 py-2 border border-error-200 rounded-xl text-sm font-semibold text-error-600 hover:bg-error-50 focus:outline-none transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal 1: Edit Profile details */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        className="max-w-xl p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Edit Personal Profile
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Update your account details below.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <Label htmlFor="profFirstName">First Name *</Label>
                <Input
                  id="profFirstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="profLastName">Last Name *</Label>
                <Input
                  id="profLastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="profPhone">Phone Number *</Label>
                <Input
                  id="profPhone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <Label>Email (Read-only)</Label>
                <Input
                  type="email"
                  value={email}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                size="sm"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal 2: Edit Address details */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        className="max-w-xl p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Edit Address Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Update your billing/shipping address.
            </p>
          </div>

          <form onSubmit={handleAddressUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="addrCountry">Country</Label>
                <Input
                  id="addrCountry"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  required
                />
              </div>

              <div>
                <Label htmlFor="addrCity">City/State</Label>
                <Input
                  id="addrCity"
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="e.g. Arizona, United States"
                  required
                />
              </div>

              <div>
                <Label htmlFor="addrPostal">Postal Code</Label>
                <Input
                  id="addrPostal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. ERT 2489"
                  required
                />
              </div>

              <div>
                <Label htmlFor="addrTax">TAX ID</Label>
                <Input
                  id="addrTax"
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. AS4568384"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                Save Address
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal 3: Change Password */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Change Account Password
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter details to update your login password.
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div>
              <Label htmlFor="currPass">Current Password *</Label>
              <Input
                id="currPass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="newPass">New Password *</Label>
              <Input
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
};

export default Profile;
