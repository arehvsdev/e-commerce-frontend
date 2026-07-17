import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserSuccess } from '../redux/slices/authSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile details states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Address details states
  const [address, setAddress] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [country, setCountry] = useState('');
  const [cityState, setCityState] = useState('');
  const [postalCode, setPostalCode] = useState('');
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
      try {
        const countriesRes = await api.get('/countries');
        setCountriesList(countriesRes.data.data || []);
      } catch (err) {
        console.warn('Failed to load countries list', err);
      }

      const response = await api.get('/user/profile');
      const data = response.data.data;
      const userProfile = data.user || data;

      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setRole(userProfile.role || '');
      
      dispatch(updateUserSuccess(userProfile));

      // Fetch user address separately
      try {
        const addressRes = await api.get('/user/profile/address');
        const addressData = addressRes.data.data?.address;
        if (addressData) {
          setAddress(addressData);
          setCountry(addressData.country?._id || addressData.country?.id || addressData.country || '');
          setCityState(addressData.cityState || '');
          setPostalCode(addressData.postalCode || '');
        } else {
          setAddress(null);
          setCountry('');
          setCityState('');
          setPostalCode('');
        }
      } catch (addrErr) {
        console.warn('Failed to load address details', addrErr);
      }

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
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      return toast.error('First Name, Last Name and Phone are required');
    }

    if (firstName.trim().length < 2 || firstName.trim().length > 60) {
      return toast.error('First name must be between 2 and 60 characters');
    }

    if (lastName.trim().length < 2 || lastName.trim().length > 60) {
      return toast.error('Last name must be between 2 and 60 characters');
    }

    const phoneTrim = phone.trim();
    if (phoneTrim.length < 7 || phoneTrim.length > 20) {
      return toast.error('Phone number must be between 7 and 20 characters');
    }
    if (!/^[+0-9\s()-]+$/.test(phoneTrim)) {
      return toast.error('Phone number contains invalid characters');
    }

    setUpdating(true);
    try {
      const response = await api.patch('/user/profile', { firstName: firstName.trim(), lastName: lastName.trim(), phone: phoneTrim });
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
    
    const countryStr = (country || '').toString().trim();
    const cityStateStr = (cityState || '').toString().trim();
    const postalCodeStr = (postalCode || '').toString().trim();

    if (!countryStr || !cityStateStr || !postalCodeStr) {
      return toast.error('Country, City/State, and Postal Code are required');
    }

    if (cityStateStr.length < 2 || cityStateStr.length > 100) {
      return toast.error('City/State must be between 2 and 100 characters');
    }

    if (!/^\d{6}$/.test(postalCodeStr)) {
      return toast.error('Postal code must be exactly 6 digits');
    }

    setUpdating(true);
    try {
      if (!address) {
        // Create new address
        await api.post('/user/profile/address', {
          country: countryStr,
          cityState: cityStateStr,
          postalCode: postalCodeStr,
        });
        toast.success('Address details created successfully!');
      } else {
        // Update existing address
        await api.put('/user/profile/address', {
          country: countryStr,
          cityState: cityStateStr,
          postalCode: postalCodeStr,
        });
        toast.success('Address details updated successfully!');
      }
      setShowAddressModal(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error('Both password fields are required');
    }

    if (newPassword.length < 8 || newPassword.length > 100) {
      return toast.error('New password must be between 8 and 100 characters long');
    }
    if (!/[A-Z]/.test(newPassword)) {
      return toast.error('New password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(newPassword)) {
      return toast.error('New password must contain at least one lowercase letter');
    }
    if (!/\d/.test(newPassword)) {
      return toast.error('New password must contain at least one number');
    }
    if (!/[@$!%*?&#^()_\-+={[\]}|\\:;"'<,>.?/]/.test(newPassword)) {
      return toast.error('New password must contain at least one special character');
    }

    setUpdating(true);
    try {
      await api.patch('/user/profile/password', { oldPassword: currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/user/profile');
        toast.success('Account deleted successfully.');
        handleLogout();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  const toggle2FA = () => {
    const newValue = !twoFactorEnabled;
    setTwoFactorEnabled(newValue);
    localStorage.setItem('profile_2fa', JSON.stringify(newValue));
    toast.success(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="profile-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal profile details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Details */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 pt-2">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">First Name</p>
              <p className="text-sm font-semibold text-gray-800">{firstName || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Last Name</p>
              <p className="text-sm font-semibold text-gray-800">{lastName || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Email Address</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Phone</p>
              <p className="text-sm font-semibold text-gray-800">{phone || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Role</p>
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
              {address ? 'Edit' : 'Add Address'}
            </button>
          </div>

          {!address ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500 font-medium mb-4">No address details added yet.</p>
              <Button size="sm" onClick={() => setShowAddressModal(true)}>Add Address</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 pt-2">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Country</p>
                <p className="text-sm font-semibold text-gray-800">{address.country?.name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">City/State</p>
                <p className="text-sm font-semibold text-gray-800">{address.cityState || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Postal Code</p>
                <p className="text-sm font-semibold text-gray-800">{address.postalCode || 'N/A'}</p>
              </div>
            </div>
          )}
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
                <p className="text-xs text-gray-500 mt-1">Update your login password details.</p>
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
                <h4 className="text-sm font-bold text-gray-900">Logout</h4>
                <p className="text-xs text-gray-500 mt-1">Sign out from your active session.</p>
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
                <h4 className="text-sm font-bold text-gray-905 text-error-600">Delete account</h4>
                <p className="text-xs text-gray-500 mt-1">Permanently delete your profile and account details.</p>
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
              {address ? 'Edit Address Details' : 'Add Address Details'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Update your billing/shipping address.
            </p>
          </div>

          <form onSubmit={handleAddressUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="addrCountry">Country *</Label>
                <select
                  id="addrCountry"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
                  required
                >
                  <option value="">-- Select Country --</option>
                  {countriesList.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="addrCity">City/State *</Label>
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
                <Label htmlFor="addrPostal">Postal Code *</Label>
                <Input
                  id="addrPostal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 560001"
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
        className="max-w-xl p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Change Password
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter details to update your login password.
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                disabled={updating}
                size="sm"
              >
                {updating ? 'Saving...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
