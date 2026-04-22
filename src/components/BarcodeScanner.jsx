import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90';

export default function BarcodeScanner() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [product, setProduct] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);

    return () => {
      stopScanner();
    };
  }, [navigate]);

  const startScanner = () => {
    setScanning(true);
    setError('');
    setTimeout(() => {
      if (scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );
        scanner.render(
          (decodedText) => {
            handleBarcode(decodedText);
            scanner.clear();
            setScanning(false);
          },
          (err) => {
            // Scanning errors are normal — ignore them
          }
        );
        scannerInstanceRef.current = scanner;
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      try {
        scannerInstanceRef.current.clear();
      } catch (e) {}
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  };

  const handleBarcode = async (barcode) => {
    setScannedCode(barcode);
    setProduct(null);
    setVerdict(null);
    setLoading(true);
    setError('');

    try {
      // Look up product by barcode using Open Food Facts
      const res = await axios.get(
        `${API}/food-search?query=${encodeURIComponent(barcode)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const products = res.data?.products || [];
      if (products.length === 0) {
        setError(`No product found for barcode: ${barcode}`);
        setLoading(false);
        return;
      }

      const found = products[0];
      setProduct(found);

      // Check safety
      const safetyRes = await axios.post(`${API}/menu`, {
        itemName: (found.product_name || 'Unknown').substring(0, 100),
        ingredients: found.ingredients_text || '',
        sodiumLevel: 0,
        restaurantName: found.brands || 'Grocery',
        dietCategory: 'Grocery',
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setVerdict(safetyRes.data);
    } catch (err) {
      setError('Error looking up product. Please try again.');
    }
    setLoading(false);
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;
    handleBarcode(manualCode.trim());
  };

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return '#ffffff';
  };

  const verdictBg = (v) => {
    if (v === 'Safe') return 'rgba(93,187,99,0.2)';
    if (v === 'Caution') return 'rgba(240,192,64,0.2)';
    if (v === 'Unsafe') return 'rgba(255,107,107,0.2)';
    return 'rgba(255,255,255,0.1)';
  };

  const verdictIcon = (v) => {
    if (v === 'Safe') return '✓';
    if (v === 'Caution') return '⚠';
    if (v === 'Unsafe') return '✗';
    return '?';
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Barcode Scanner</h1>
          </div>
          <button
            onClick={() => { stopScanner(); navigate('/dashboard'); }}
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
          >
            ← DASHBOARD
          </button>
          <button
            onClick={() => navigate('/my-profile')}
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
          >
            MY PROFILE
          </button>
        </div>

        {/* Scanner section */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            SCAN A PRODUCT
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Point your camera at any grocery product barcode for an instant safety check
          </p>

          {!scanning ? (
            <button
              onClick={startScanner}
              style={{ width: '100%', padding: '18px', background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.5)', borderRadius: '4px', color: 'rgba(255,150,100,1)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '2px', marginBottom: '16px' }}
            >
              START CAMERA SCAN
            </button>
          ) : (
            <button
              onClick={stopScanner}
              style={{ width: '100%', padding: '14px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '4px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}
            >
              ✕ STOP SCANNING
            </button>
          )}

          {/* Camera view */}
          {scanning && (
            <div
              id="qr-reader"
              ref={scannerRef}
              style={{ borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}
            />
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>OR ENTER MANUALLY</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Manual barcode entry */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter barcode number e.g. 044000040031"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleManualSearch}
              style={{ padding: '14px 24px', background: 'rgba(255,107,53,0.3)', border: '1px solid rgba(255,107,53,0.5)', color: 'rgba(255,150,100,1)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              LOOK UP
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '4px', padding: '16px 20px', marginBottom: '20px', color: '#ff9999', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ ...sectionStyle, textAlign: 'center', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', fontSize: '13px' }}>
            ANALYZING PRODUCT...
          </div>
        )}

        {/* Product result */}
        {product && verdict && !loading && (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '400', color: '#ffffff' }}>
                {product.product_name || 'Unknown Product'}
              </h2>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic' }}>
                {product.brands || 'Unknown brand'}
                {scannedCode && ` · Barcode: ${scannedCode}`}
              </div>
            </div>

            {/* Ingredients */}
            {product.ingredients_text && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>INGREDIENTS</div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.8', fontStyle: 'italic', margin: 0 }}>
                  {product.ingredients_text}
                </p>
              </div>
            )}

            {/* Verdict */}
            <div style={{ background: verdictBg(verdict.safetyVerdict), border: `1px solid ${verdictColor(verdict.safetyVerdict)}40`, borderRadius: '4px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: verdict.flaggedIngredients?.length > 0 ? '16px' : '0' }}>
                <div style={{ fontSize: '32px', color: verdictColor(verdict.safetyVerdict) }}>
                  {verdictIcon(verdict.safetyVerdict)}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: verdictColor(verdict.safetyVerdict), letterSpacing: '2px' }}>
                    {verdict.safetyVerdict?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontStyle: 'italic' }}>
                    Based on your health profile
                  </div>
                </div>
              </div>

              {verdict.flaggedIngredients?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '10px' }}>FLAGGED INGREDIENTS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {verdict.flaggedIngredients.map((ing, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '2px', color: '#ff9999', fontSize: '12px' }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {verdict.substitutionSuggestion && (
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>SUGGESTION</div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.6' }}>
                    {verdict.substitutionSuggestion}
                  </p>
                </div>
              )}
            </div>

            {/* Scan another */}
            <button
              onClick={() => { setProduct(null); setVerdict(null); setScannedCode(''); setManualCode(''); setError(''); }}
              style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginTop: '16px' }}
            >
              SCAN ANOTHER PRODUCT
            </button>
          </div>
        )}

      </div>
    </div>
  );
}