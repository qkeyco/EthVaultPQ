/**
 * Register Page for EthVaultPQ
 *
 * Features:
 * - Email/Password registration
 * - Wallet linking
 * - Organization creation/joining
 * - Email verification
 * - Password strength validation
 *
 * All open source authentication
 */

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type RegisterStep = 'details' | 'organization' | 'verification' | 'success';

export function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgJoinCode, setOrgJoinCode] = useState('');
  const [createNewOrg, setCreateNewOrg] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { address, isConnected } = useAccount();

  // Password strength validation
  const getPasswordStrength = (pwd: string): { score: number; feedback: string } => {
    if (pwd.length < 8) return { score: 0, feedback: 'Too short (minimum 8 characters)' };
    if (pwd.length < 12) return { score: 1, feedback: 'Weak' };

    let score = 2;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 4) return { score: 2, feedback: 'Medium' };
    if (score < 5) return { score: 3, feedback: 'Strong' };
    return { score: 4, feedback: 'Very Strong' };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Handle account details submission
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength || passwordStrength.score < 2) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }

    setStep('organization');
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          walletAddress: isConnected ? address : null,
          organization: createNewOrg
            ? { name: orgName, role: 'ORG_ADMIN' }
            : { joinCode: orgJoinCode, role: 'END_USER' },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStep('verification');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the post-quantum secure vesting platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between">
              <div className={`flex-1 text-center ${step === 'details' ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step === 'details' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="text-xs mt-1 block">Details</span>
              </div>
              <div className={`flex-1 text-center ${step === 'organization' ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step === 'organization' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="text-xs mt-1 block">Organization</span>
              </div>
              <div className={`flex-1 text-center ${step === 'verification' ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step === 'verification' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="text-xs mt-1 block">Verify</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {passwordStrength && (
                  <div className="mt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= passwordStrength.score
                              ? passwordStrength.score <= 1
                                ? 'bg-red-500'
                                : passwordStrength.score <= 2
                                ? 'bg-yellow-500'
                                : passwordStrength.score <= 3
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{passwordStrength.feedback}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Wallet Linking */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Wallet (Optional)
                </label>
                <ConnectButton />
                {isConnected && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Wallet {address?.slice(0, 6)}...{address?.slice(-4)} will be linked to your account
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Organization */}
          {step === 'organization' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Organization
                </label>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="create-org"
                      name="org-option"
                      type="radio"
                      checked={createNewOrg}
                      onChange={() => setCreateNewOrg(true)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="create-org" className="ml-3 block text-sm text-gray-700">
                      Create a new organization
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="join-org"
                      name="org-option"
                      type="radio"
                      checked={!createNewOrg}
                      onChange={() => setCreateNewOrg(false)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="join-org" className="ml-3 block text-sm text-gray-700">
                      Join an existing organization
                    </label>
                  </div>
                </div>
              </div>

              {createNewOrg ? (
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    id="orgName"
                    name="orgName"
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Acme Corp"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You will be the admin of this organization
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700">
                    Organization Join Code
                  </label>
                  <input
                    id="joinCode"
                    name="joinCode"
                    type="text"
                    required
                    value={orgJoinCode}
                    onChange={(e) => setOrgJoinCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="ABC-123-XYZ"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get this code from your organization admin
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Email Verification */}
          {step === 'verification' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-600">
                We've sent a verification email to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Click the link in the email to verify your account and complete registration.
              </p>
              <div className="pt-4">
                <a
                  href="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Return to login →
                </a>
              </div>
            </div>
          )}

          {/* Login Link */}
          {step !== 'verification' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
