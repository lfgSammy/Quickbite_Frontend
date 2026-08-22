import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../api/payment';
import Spinner from '../components/Spinner';
import QrCodeImage from '../components/QrCodeImage';
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

  if (result.warning) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl text-yellow-600">
          !
        </div>
        <h1 className="mt-4 text-h1 text-brand-black">We've got this</h1>
        <p className="mt-2 text-body text-gray-500">{result.warning}</p>
        <Link
          to={`/orders/${result.order_id}`}
          className="mt-6 inline-block rounded-full bg-brand-red px-6 py-3 text-btn-lg text-white hover:bg-brand-red-dark"
        >
          View order
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="mt-4 text-h1 text-brand-black">Payment confirmed!</h1>
      <p className="mt-2 text-body text-gray-500">
        Order #{result.order_id} is paid. A confirmation email with your pickup QR code is on
        its way.
      </p>
      {result.qr_code && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-4 py-6">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <QrCodeImage value={result.qr_code} size={160} />
          </div>
          <p className="break-all text-center text-caption text-gray-400">{result.qr_code}</p>
        </div>
      )}
      <Link
        to={`/orders/${result.order_id}`}
        className="mt-6 inline-block rounded-full bg-brand-red px-6 py-3 text-btn-lg text-white hover:bg-brand-red-dark"
      >
        View order
      </Link>
    </div>
  );
}
