import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../redux/thunks/authThunks';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { EyeIcon, EyeCloseIcon } from '../icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        const errorMsg = resultAction.payload || 'Login failed';
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8 text-center lg:text-left">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500">
            Enter your email and password to sign in!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">
              Email Address <span className="text-error-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@gmail.com"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <Label htmlFor="password" className="mb-0">
                Password <span className="text-error-500">*</span>
              </Label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-650 hover:text-brand-700 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-12"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 size-5" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;