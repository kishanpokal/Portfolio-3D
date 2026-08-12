import { useState } from 'react';

export default function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <button className="download-btn" onClick={() => setIsOpen(true)}>
           Contact Me
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{
            background: '#1a1a2e', padding: '2rem', borderRadius: '8px',
            width: '100%', maxWidth: '400px', border: '1px solid #00ffff'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Send a Message</h2>
            <input type="text" placeholder="Name" style={inputStyle} />
            <input type="email" placeholder="Email" style={inputStyle} />
            <textarea placeholder="Your message..." style={{...inputStyle, height: '100px'}} />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button className="nav-btn" onClick={() => setIsOpen(false)}>Cancel</button>
               <button className="download-btn" style={{ flex: 1 }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '4px',
  fontFamily: 'Inter, sans-serif'
};
