import useGameStore from '../../store/useGameStore';

export default function ContactForm() {
  const contactModalOpen = useGameStore(s => s.contactModalOpen);
  const setContactModalOpen = useGameStore(s => s.setContactModalOpen);

  const handleClose = () => {
    setContactModalOpen(false);
  };

  return (
    <>
      {/* Fixed bottom-right trigger button (always visible) */}
      <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10, pointerEvents: 'auto' }}>
        <button className="download-btn" onClick={() => {
          document.exitPointerLock();
          setContactModalOpen(true);
        }}>
           Contact Me
        </button>
      </div>

      {/* Modal Overlay */}
      {contactModalOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{
            background: 'rgba(18, 18, 28, 0.95)',
            padding: '2.5rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.1)',
          }}>
            <h2 style={{
              color: '#fff',
              marginBottom: '0.5rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
            }}>Send a Message</h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
            }}>I'll get back to you as soon as possible.</p>

            <input type="text" placeholder="Your Name" style={inputStyle} />
            <input type="email" placeholder="Your Email" style={inputStyle} />
            <textarea placeholder="Your message..." style={{...inputStyle, height: '110px', resize: 'vertical'}} />
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
               <button
                 className="nav-btn"
                 onClick={handleClose}
                 style={{ flex: 1 }}
               >
                 Cancel
               </button>
               <button
                 className="download-btn"
                 style={{ flex: 2 }}
                 onClick={() => {
                   // TODO: wire to actual email service (EmailJS, Resend, etc.)
                   handleClose();
                 }}
               >
                 Send Message
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  marginBottom: '0.85rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};
