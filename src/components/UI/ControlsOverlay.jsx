import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';

const ControlsOverlay = () => {
  const loadingComplete = useGameStore((state) => state.loadingComplete);
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (loadingComplete) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 300);
      
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, 20300);

      // Dismiss on any key press
      const onKey = () => handleDismiss();
      window.addEventListener('keydown', onKey);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [loadingComplete]);

  const handleDismiss = () => {
    setIsHiding(true);
    setTimeout(() => {
      setVisible(false);
    }, 500); // match animation duration
  };

  if (!loadingComplete || !visible) return null;

  return (
    <>
      <style>
        {`
          @keyframes cardEntrance {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes cardExit {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0; }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes mouseScroll {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(6px); opacity: 0; }
          }
        `}
      </style>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
        pointerEvents: show ? 'auto' : 'none',
      }}>
        {show && (
          <div style={{
            background: 'rgba(20, 20, 25, 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 200, 100, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,200,100,0.05)',
            animation: isHiding ? 'cardExit 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'cardEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            maxWidth: '450px',
            width: '90%',
          }}>
            <h2 style={{
              margin: '0 0 10px 0',
              fontFamily: "'Inter', sans-serif",
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #FFB75E, #ED8F03)',
              backgroundSize: '200% auto',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animation: 'gradientShift 3s ease infinite',
              textAlign: 'center'
            }}>
              Welcome to BaseCamp
            </h2>
            <p style={{
              margin: '0 0 40px 0',
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem',
              textAlign: 'center'
            }}>
              Explore my interactive 3D portfolio
            </p>

            {/* Keyboard Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
              <div style={keyStyle}>W</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={keyStyle}>A</div>
                <div style={keyStyle}>S</div>
                <div style={keyStyle}>D</div>
              </div>
              <div style={{ ...keyStyle, width: '150px', marginTop: '8px', fontSize: '0.8rem', letterSpacing: '2px' }}>SPACE</div>
            </div>

            {/* Mouse Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={{
                width: '24px',
                height: '36px',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '4px',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '2px',
                  marginTop: '6px',
                  animation: 'mouseScroll 1.5s infinite'
                }} />
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Look Around
              </span>
            </div>

            <button
              onClick={handleDismiss}
              style={{
                background: 'linear-gradient(90deg, #FFB75E, #ED8F03)',
                border: 'none',
                padding: '14px 36px',
                borderRadius: '30px',
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(237, 143, 3, 0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(237, 143, 3, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(237, 143, 3, 0.4)';
              }}
            >
              Start Exploring
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const keyStyle = {
  width: '45px',
  height: '45px',
  background: 'linear-gradient(145deg, rgba(40,40,45,0.8), rgba(20,20,25,0.8))',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'rgba(255, 255, 255, 0.9)',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '1.1rem',
  boxShadow: '0 4px 0 rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
  transform: 'translateY(-2px)'
};

export default ControlsOverlay;
