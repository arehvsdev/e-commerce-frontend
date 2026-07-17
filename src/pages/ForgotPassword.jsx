import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { EyeIcon, EyeCloseIcon } from '../icons';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = check email, 2 = reset password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter your email address');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }

    setLoading(true);
    try {
      await api.post('/auth/check-email', { email });
      toast.success('Email verified successfully!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !newPassword || !confirmPassword) {
      return toast.error('All fields are required');
    }

    // Password strength check (min 8 chars, one uppercase, one lowercase, one number, one special char)
    if (newPassword.length < 8 || newPassword.length > 100) {
      return toast.error('Password must be between 8 and 100 characters long');
    }
    if (!/[A-Z]/.test(newPassword)) {
      return toast.error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(newPassword)) {
      return toast.error('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(newPassword)) {
      return toast.error('New password must contain at least one number');
    }
    if (!/[@$!%*?&#^()_\-+={[\]}|\\:;"'<,>.?/]/.test(newPassword)) {
      return toast.error('New password must contain at least one special character');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        newPassword,
      });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8 text-center lg:text-left">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm sm:text-title-md">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500">
            {step === 1 
              ? 'Enter your email to verify your account.' 
              : 'Enter your new password to reset it.'
            }
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCheckEmail} className="space-y-6">
            <div>
              <Label htmlFor="resetEmail">Email Address *</Label>
              <Input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@gmail.com"
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center"
                size="sm"
              >
                {loading ? 'Verifying Email...' : 'Verify Email'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="verifiedEmail">Email Address</Label>
              <Input
                id="verifiedEmail"
                type="email"
                value={email}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="newResetPassword">New Password *</Label>
              <div className="relative">
                <Input
                  id="newResetPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-12"
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showNewPassword ? (
                    <EyeIcon className="fill-gray-500 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmResetPassword">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="confirmResetPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-12"
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="fill-gray-500 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center"
                size="sm"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-700">
          Back to{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
