import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyQrCode } from '../api/kitchen';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import OrderStatusBadge from '../components/OrderStatusBadge';
import BackButton from '../components/BackButton';
import { formatNaira } from '../utils/format';

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport';

export default function KitchenScanPage() {
  const scannerRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        (decodedText) => handleScan(decodedText),
        () => {}
      )
      .catch(() => {
        setCameraError(
          'Could not access the camera. You can still enter the code manually below.'
        );
      });

    return () => {
      scanner.stop().catch(() => {}).finally(() => scanner.clear());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pauseScanning() {
    setScanning(false);
    try {
      await scannerRef.current?.pause(true);
    } catch {
      // scanner may already be stopped/paused; nothing to do
    }
  }

  async function resumeScanning() {
    setResult(null);
    setError('');
    try {
      await scannerRef.current?.resume();
      setScanning(true);
    } catch {
      setScanning(true);
    }
  }

  async function handleScan(qrCode) {
    if (verifying) return;
    await pauseScanning();
    await verify(qrCode);
  }

  async function verify(qrCode) {
    setError('');
    setVerifying(true);
    try {
      const data = await verifyQrCode(qrCode);
      setResult(data.order);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not verify this code.'));
    } finally {
      setVerifying(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await pauseScanning();
    await verify(manualCode.trim());
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/kitchen" />
        <h1 className="text-2xl font-extrabold text-brand-black">Scan Pickup QR</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Point the camera at the customer's QR code to mark their order collected.
      </p>

      <div
        id={SCANNER_ELEMENT_ID}
        className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
      />

      {cameraError && (
        <div className="mt-4">
          <ErrorMessage message={cameraError} />
        </div>
      )}

      {!result && (
        <form onSubmit={handleManualSubmit} className="mt-5 flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or enter the code manually"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <button
            type="submit"
            disabled={verifying}
            className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            Verify
          </button>
        </form>
      )}

      {verifying && <p className="mt-4 text-center text-sm text-gray-500">Verifying…</p>}

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
          <button
            onClick={resumeScanning}
            className="mt-3 w-full rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-brand-black"
          >
            Scan again
          </button>
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-brand-black">Order #{result.id}</p>
            <OrderStatusBadge status={result.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {result.items?.length} item{result.items?.length === 1 ? '' : 's'} ·{' '}
            {formatNaira(result.total_amount)}
          </p>
          <p className="mt-2 text-sm font-semibold text-green-600">Order marked as collected.</p>

          <button
            onClick={resumeScanning}
            className="mt-4 w-full rounded-full bg-brand-red py-3 text-sm font-bold text-white"
          >
            Scan next order
          </button>
        </div>
      )}

      {!scanning && !result && !error && !verifying && (
        <p className="mt-4 text-center text-sm text-gray-400">Camera paused</p>
      )}
    </div>
  );
}
