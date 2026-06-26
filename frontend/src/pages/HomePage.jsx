import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket/socket';

// 8 SVG stick figures matching the screenshot exactly
const StickFigures = [
  // 1. Simple smile
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M18 20 Q25 27 32 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="20" cy="15" r="1.5" fill="white"/>
      <circle cx="30" cy="15" r="1.5" fill="white"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 2. Neutral / flat mouth
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <line x1="18" y1="22" x2="32" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="15" r="1.5" fill="white"/>
      <circle cx="30" cy="15" r="1.5" fill="white"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 3. Dizzy / spiral eyes
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M18 20 Q25 27 32 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* dizzy left eye */}
      <path d="M17 13 Q19 11 21 13 Q19 15 17 13" stroke="white" strokeWidth="1.5" fill="none"/>
      {/* dizzy right eye */}
      <path d="M27 13 Q29 11 31 13 Q29 15 27 13" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 4. Sunglasses
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M18 20 Q25 27 32 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* sunglasses */}
      <rect x="14" y="12" width="9" height="6" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="27" y="12" width="9" height="6" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="23" y1="15" x2="27" y2="15" stroke="white" strokeWidth="1.5"/>
      <line x1="36" y1="14" x2="38" y2="13" stroke="white" strokeWidth="1.5"/>
      <line x1="14" y1="14" x2="12" y2="13" stroke="white" strokeWidth="1.5"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 5. Tongue out
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M19 21 Q25 25 31 21" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="25" cy="26" rx="3" ry="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="15" r="1.5" fill="white"/>
      <circle cx="30" cy="15" r="1.5" fill="white"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 6. Crown + smirk
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      {/* crown */}
      <polyline points="13,8 16,3 21,7 25,2 29,7 34,3 37,8" stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      {/* smirk */}
      <path d="M20 22 Q27 27 32 21" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="20" cy="15" r="1.5" fill="white"/>
      <circle cx="30" cy="15" r="1.5" fill="white"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 7. Heart eyes
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M18 20 Q25 27 32 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* heart left eye */}
      <path d="M18 13 Q18 11 20 11 Q22 11 22 13 Q22 15 20 17 Q18 15 18 13Z" stroke="white" strokeWidth="1" fill="white"/>
      {/* heart right eye */}
      <path d="M28 13 Q28 11 30 11 Q32 11 32 13 Q32 15 30 17 Q28 15 28 13Z" stroke="white" strokeWidth="1" fill="white"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
  // 8. Big grin / squint eyes
  ({ selected, onClick }) => (
    <StickyWrapper selected={selected} onClick={onClick}>
      <circle cx="25" cy="18" r="14" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M17 19 Q25 28 33 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* squinting eyes */}
      <path d="M17 14 Q20 12 23 14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M27 14 Q30 12 33 14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="25" y1="32" x2="25" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="12" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="40" x2="38" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="14" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="56" x2="36" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </StickyWrapper>
  ),
];

function StickyWrapper({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: '6px',
        cursor: 'pointer',
        borderRadius: '50%',
        transition: 'transform 0.15s',
        transform: selected ? 'scale(1.18)' : 'scale(1)',
        filter: selected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : 'none',
        opacity: selected ? 1 : 0.75,
      }}
    >
      <svg width="50" height="75" viewBox="0 0 50 75">
        {children}
      </svg>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      // Clear the state so refreshing doesn't keep showing the error
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCreateRoom = () => {
    if (!username.trim()) { setError('Please enter a username first.'); return; }
    setError('');
    if (!socket.connected) socket.connect();
    socket.emit('createRoom', { username: username.trim(), maxPlayers: 8 });
    socket.once('roomCreated', (room) => {
      navigate(`/room/${room.code}`, {
        state: { username: username.trim(), room, isHost: true },
      });
    });
    socket.once('error', (err) => setError(err.message));
  };

  const handleJoinRoom = () => {
    if (!username.trim()) { setError('Please enter a username first.'); setShowJoinModal(false); return; }
    if (!roomCode.trim()) { setError('Please enter a room code.'); return; }
    setError('');
    if (!socket.connected) socket.connect();
    socket.emit('joinRoom', { username: username.trim(), roomCode: roomCode.trim().toUpperCase() });
    socket.once('error', (err) => setError(err.message));
    socket.once(`${username.trim()} joined`, (room) => {
      navigate(`/room/${room.code}`, {
        state: { username: username.trim(), room, isHost: false },
      });
    });
  };

  return (
    <>
      {/* Fredoka One font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#0d1b2e',
        }}
      >
        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '620px', padding: '0 24px' }}>

          {/* Logo */}
          <h1
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '86px',
              color: 'white',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            skribbl.io
            {/* Pencil SVG */}
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ marginLeft: '4px' }}>
              <rect x="18" y="8" width="14" height="40" rx="3" stroke="white" strokeWidth="2.5" fill="none" transform="rotate(30 30 30)"/>
              <polygon points="16,52 22,58 28,44" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              <line x1="18" y1="48" x2="26" y2="44" stroke="white" strokeWidth="2"/>
            </svg>
          </h1>

          {/* Stick figures row */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-end' }}>
            {StickFigures.map((Figure, i) => (
              <Figure
                key={i}
                selected={selectedAvatar === i}
                onClick={() => setSelectedAvatar(i)}
              />
            ))}
          </div>

          {/* Username input */}
          <input
            type="text"
            placeholder="enter username..."
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
            maxLength={20}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.09)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              color: 'white',
              fontSize: '18px',
              fontFamily: "'Fredoka One', cursive",
              outline: 'none',
              letterSpacing: '0.5px',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: '14px', margin: '-12px 0 0', alignSelf: 'flex-start' }}>{error}</p>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <button
              onClick={handleCreateRoom}
              style={{
                flex: 1,
                padding: '18px',
                borderRadius: '14px',
                background: '#3cb043',
                border: 'none',
                color: 'white',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '20px',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'filter 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
              onMouseDown={e => e.target.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.target.style.transform = 'scale(1)'}
            >
              CREATE ROOM
            </button>
            <button
              onClick={() => {
                if (!username.trim()) { setError('Please enter a username first.'); return; }
                setShowJoinModal(true); setError('');
              }}
              style={{
                flex: 1,
                padding: '18px',
                borderRadius: '14px',
                background: '#1a56db',
                border: 'none',
                color: 'white',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '20px',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'filter 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
              onMouseDown={e => e.target.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.target.style.transform = 'scale(1)'}
            >
              ENTER CODE
            </button>
          </div>
        </div>

        {/* Join modal */}
        {showJoinModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowJoinModal(false); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{
              background: '#162032',
              border: '1.5px solid rgba(255,255,255,0.13)',
              borderRadius: '20px',
              padding: '40px 36px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              width: '100%', maxWidth: '360px',
              margin: '0 16px',
            }}>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", color: 'white', fontSize: '28px', margin: 0, textAlign: 'center' }}>
                Join a Room
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '-8px 0 0', textAlign: 'center' }}>
                Enter the 4-character room code
              </p>
              <input
                autoFocus
                type="text"
                placeholder="e.g. XKQP"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                maxLength={4}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  color: 'white',
                  fontSize: '28px',
                  fontFamily: "'Fredoka One', cursive",
                  textAlign: 'center',
                  letterSpacing: '10px',
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
              />
              {error && <p style={{ color: '#f87171', fontSize: '13px', margin: '-8px 0 0', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowJoinModal(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.07)', border: 'none',
                    color: 'rgba(255,255,255,0.55)', fontFamily: "'Fredoka One', cursive",
                    fontSize: '16px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    background: '#1a56db', border: 'none',
                    color: 'white', fontFamily: "'Fredoka One', cursive",
                    fontSize: '16px', cursor: 'pointer',
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}