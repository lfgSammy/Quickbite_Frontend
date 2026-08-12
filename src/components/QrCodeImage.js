import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodeImage({ value, size = 180, className }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    QRCode.toDataURL(value, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  return (
    <img
      src={dataUrl}
      alt="Pickup QR code"
      width={size}
      height={size}
      className={className}
    />
  );
}
