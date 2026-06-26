import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../socket/socket';
import PlayerList from '../components/PlayerList';
import ChatBox from '../components/ChatBox';

function IconPeople() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconRefresh() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function IconPalette() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="#374151"/><circle cx="17.5" cy="10.5" r=".5" fill="#374151"/><circle cx="8.5" cy="7.5" r=".5" fill="#374151"/><circle cx="6.5" cy="12.5" r=".5" fill="#374151"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
}
function IconClock() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconPencil() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function IconChat() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function SettingRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 4px',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '15px', color: '#374151', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#111', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '28px', color: 'white', lineHeight: 1 }}>
        skribbl.io
      </span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    </div>
  );
}

export default function WaitingRoomPage() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [room, setRoom] = useState(state?.room || null);
  const username = state?.username || '';
  const isHost = state?.isHost || false;

  // Seed initial chat messages from players already in room on first load.
  // This runs once from state — no socket events needed for this.
  const [initialMessages] = useState(() => {
    const players = state?.room?.players || [];
    return players.map(p => ({
      type: 'log',
      text: `${p.username} joined the room.`,
    }));
  });

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleGameStarted = (updatedRoom) => {
      navigate(`/game/${roomCode}`, {
        state: { username, room: updatedRoom, isHost },
      });
    };

    // Listen for ALL socket events to catch dynamic room name events like
    // "${username} joined" and "${username} left"
    socket.onAny((event, data) => {
      if (event.includes('joined') && data?.players) {
        setRoom(data);
        // Only dispatch for the newest player — the last one in the array
        const newest = data.players[data.players.length - 1];
        if (newest) {
          window.dispatchEvent(new CustomEvent('chat_log', {
            detail: `${newest.username} joined the room.`,
          }));
        }
      }
      if (event.includes('left') && data?.room) {
        setRoom(data.room);
        window.dispatchEvent(new CustomEvent('chat_log', {
          detail: `${data.username} left the room.`,
        }));
      }
      if (event === 'roomClosed') {
        navigate('/', { state: { error: 'The room was closed because the host left or not enough players remained.' } });
      }
    });

    socket.on('gameStarted', handleGameStarted);

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.offAny();
    };
  }, [roomCode, navigate, username, isHost]);

  const startGame = () => socket.emit('startGame');

  const leaveRoom = () => {
    socket.emit('leaveRoom');
    socket.disconnect();
    navigate('/');
  };

  if (!room) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1b2e' }}>
      <p style={{ color: 'white', fontSize: '18px' }}>Loading room...</p>
    </div>
  );

  const players = room.players || [];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet"/>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0d1b2e',
      }}>
        {/* HEADER */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
        }}>
          <Logo />
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '26px', color: 'white' }}>
            Round: {room.currentRound} / {room.maxRounds}
          </div>
          <div style={{ fontSize: '16px', color: 'white', fontWeight: 600 }}>
            Room Status: <span style={{ color: '#facc15' }}>{room.status}...</span>
          </div>
        </header>

        {/* BODY */}
        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          padding: '0 24px 24px',
        }}>
          {/* Column 1: Players */}
          <PlayerList players={players} maxPlayers={room.maxPlayers} />

          {/* Column 2: Room Settings */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px 20px 16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 800,
              color: '#6b7280',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>ROOM SETTINGS</h2>

            <div style={{ flex: 1 }}>
              <SettingRow icon={<IconPeople/>}  label="Max Players" value={room.maxPlayers} />
              <SettingRow icon={<IconRefresh/>} label="Max Rounds"  value={room.maxRounds} />
              <SettingRow icon={<IconPalette/>} label="Language"    value="English" />
              <SettingRow icon={<IconClock/>}   label="Round Time"  value={`${room.roundTime} sec`} />
              <SettingRow icon={<IconPencil/>}  label="Draw Time"   value="60 sec" />
              <SettingRow icon={<IconChat/>}    label="Chat Mode"   value="Free Chat" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  style={{
                    width: '100%', padding: '16px',
                    borderRadius: '12px', border: 'none',
                    background: players.length < 2 ? '#86efac' : '#22a83a',
                    color: 'white',
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: '20px', letterSpacing: '2px',
                    cursor: players.length < 2 ? 'not-allowed' : 'pointer',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => { if (players.length >= 2) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  START GAME
                </button>
              ) : (
                <div style={{
                  width: '100%', padding: '16px', borderRadius: '12px',
                  background: '#f3f4f6', color: '#6b7280',
                  fontSize: '14px', textAlign: 'center', fontWeight: 600,
                }}>
                  Waiting for host to start...
                </div>
              )}
              <button
                onClick={leaveRoom}
                style={{
                  width: '100%', padding: '16px',
                  borderRadius: '12px', border: 'none',
                  background: '#dc2626', color: 'white',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '20px', letterSpacing: '2px',
                  cursor: 'pointer', transition: 'filter 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                LEAVE ROOM
              </button>
            </div>
          </div>

          {/* Column 3: Chat */}
          <ChatBox roomCode={roomCode} isPlaying={false} initialMessages={initialMessages} />
        </main>
      </div>
    </>
  );
}