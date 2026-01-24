import { useEffect, useRef, useState } from 'react';

/**
 * AdSense component with lazy loading and proper initialization
 *
 * Usage:
 * <AdSense
 *   adClient="ca-pub-XXXXXXXXXX"
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   fullWidthResponsive={true}
 *   style={{ display: 'block', minHeight: '100px' }}
 * />
 */
export default function AdSense({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = '',
  ...props
}) {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Check if AdSense script is already loaded
    const scriptLoaded = document.querySelector('script[src*="adsbygoogle.js"]');

    if (!scriptLoaded) {
      // Load AdSense script
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        setAdLoaded(true);
      };

      script.onerror = () => {
        console.warn('AdSense script failed to load (ad blocker?)');
      };

      document.head.appendChild(script);
    } else {
      setAdLoaded(true);
    }
  }, [adClient]);

  useEffect(() => {
    // Initialize ad after script loads and element is rendered
    if (adLoaded && adRef.current && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn('AdSense push error:', err);
      }
    }
  }, [adLoaded]);

  // Don't render anything if required props are missing
  if (!adClient || !adSlot) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        {...props}
      />
      <small style={{
        display: 'block',
        textAlign: 'center',
        color: '#999',
        fontSize: '10px',
        marginTop: '4px'
      }}>
        Advertisement
      </small>
    </div>
  );
}
