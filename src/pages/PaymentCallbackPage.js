import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../api/payment';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState('verifying');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setError('No payment reference was provided.');
      return;
    }

    verifyPayment(reference)
      .then((data) => {
        setResult(data);
        setStatus('success');
      })
      .catch((err) => {
        setError(extractErrorMessage(err, 'We could not verify your payment.'));
        setStatus('error');
      });
  }, [reference]);

  if (status === 'verifying') {
    return <Spinner label="Verifying your payment…" />;
  }

  if (status === 'error') {
    return (
      <div className="px-6 py-16 text-center">
        <ErrorMessage message={error} />
        <Link to="/orders" className="mt-4 inline-block font-medium text-brand-red">
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-black">Payment confirmed!</h1>
      <p className="mt-2 text-gray-500">
        Order #{result.order_id} is paid. A confirmation email with your pickup QR code is on
        its way.
      </p>
      {result.qr_code && (
        <p className="mt-3 break-all rounded-2xl bg-gray-50 px-4 py-2 text-xs text-gray-500">
          QR code: {result.qr_code}
        </p>
      )}
      <Link
        to={`/orders/${result.order_id}`}
        className="mt-6 inline-block rounded-full bg-brand-red px-6 py-3 text-sm font-bold text-white hover:bg-brand-red-dark"
      >
        View order
      </Link>
    </div>
  );
}
