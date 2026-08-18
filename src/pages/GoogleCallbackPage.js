import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGoogleRedirectUri, consumeGoogleOAuthFromPath } from '../utils/googleAuth';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('Google sign-in was cancelled.');
      return;
    }
    if (!code) {
      setError('No authorization code was returned by Google.');
      return;
    }

    loginWithGoogle(code, getGoogleRedirectUri())
      .then(() => {
        navigate(consumeGoogleOAuthFromPath(), { replace: true });
      })
      .catch((err) => {
        setError(extractErrorMessage(err, 'Could not sign in with Google.'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="px-6 py-16 text-center">
        <ErrorMessage message={error} />
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 font-medium text-brand-red"
        >
          Back to login
        </button>
      </div>
    );
  }

  return <Spinner label="Signing you in…" />;
}
