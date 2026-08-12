import React, { useState, useEffect } from 'react';

export default function ControlsOverlay() {
  const [visible, setVisible] = useState(true);

  // Auto-hide after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(10, 5, 20, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 9000,
      pointerEvents: 'auto',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        color: 'white',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '24px',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #bb88ff, #ff88cc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to My World
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.5', marginBottom: '30px' }}>
          Explore my interactive 3D portfolio. Discover my journey, my projects, and connect with me.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              <Key label="W" />
              <Key label="A" />
              <Key label="S" />
              <Key label="D" />
            </div>
            <span style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Move</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              <Key label="SPACE" width="100px" />
            </div>
            <span style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Jump</span>
          </div>
        </div>

        <button 
          onClick={() => setVisible(false)}
          style={{
            background: 'linear-gradient(90deg, #7b2cbf, #c77dff)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(123, 44, 191, 0.4)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Start Exploring
        </button>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Key({ label, width = '36px' }) {
  return (
    <div style={{
      width,
      height: '36px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
      boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
      textTransform: 'uppercase'
    }}>
      {label}
    </div>
  )
}
