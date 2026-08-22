import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';

const inputClass =
  'rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setStep('otp');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not send the code. Try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await authApi.verifyResetOtp({ email, code });
      setResetToken(data.reset_token);
      setStep('reset');
    } catch (err) {
      setError(extractErrorMessage(err, 'That code is invalid or has expired.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep('done');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not reset your password.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="text-h1 text-brand-black">Password reset</h1>
        <p className="text-body text-gray-500">
          Your password has been changed. You can log in with it now.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mt-2 w-full rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-h1 text-brand-black">Reset password</h1>
        <p className="mt-1 text-body-sm text-gray-500">
          {step === 'email' && "Enter your email and we'll send you a reset code."}
          {step === 'otp' && `Enter the 6-digit code we sent to ${email}.`}
          {step === 'reset' && 'Choose a new password for your account.'}
        </p>
      </div>

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <label className="flex flex-col gap-1">
            <span className="text-label text-brand-black">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send code'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <label className="flex flex-col gap-1">
            <span className="text-label text-brand-black">6-digit code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              required
              className={`${inputClass} tracking-[0.5em]`}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            {submitting ? 'Verifying…' : 'Verify code'}
          </button>
          <div className="flex items-center justify-between text-body-sm">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className="font-medium text-gray-500"
            >
              Change email
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSendCode}
              className="font-semibold text-brand-red disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <label className="flex flex-col gap-1">
            <span className="text-label text-brand-black">New password</span>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={inputClass}
            />
            <PasswordRequirements password={newPassword} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-brand-black">Confirm password</span>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Reset password'}
          </button>
        </form>
      )}

      <p className="text-center text-body-sm text-gray-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-brand-red">
          Log in
        </Link>
      </p>
    </div>
  );
}
