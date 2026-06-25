// Pure SVG stick figure - simple smiley face, matches the design exactly
function StickFigureSVG() {
  return (
    <svg width="44" height="58" viewBox="0 0 44 58" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="13" r="11" stroke="#333" strokeWidth="1.8" fill="none"/>
      <path d="M16 15 Q22 21 28 15" stroke="#333" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="18" cy="11" r="1.3" fill="#333"/>
      <circle cx="26" cy="11" r="1.3" fill="#333"/>
      <line x1="22" y1="24" x2="22" y2="43" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="30" x2="11" y2="39" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="30" x2="33" y2="39" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="43" x2="13" y2="55" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="43" x2="31" y2="55" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function PlayerList({ players, maxPlayers, currentDrawerId }) {
  const emptySlots = Array(Math.max(0, maxPlayers - players.length)).fill(null);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <h2 style={{
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 800,
        color: '#6b7280',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        PLAYERS ({players.length}/{maxPlayers})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
        {/* Filled player slots */}
        {players.map((player, i) => (
          <div key={player.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#fff',
          }}>
            <StickFigureSVG />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {player.isHost && (
                  <span style={{ fontSize: '15px' }}>👑</span>
                )}
                <span style={{
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1d4ed8',
                  whiteSpace: player.isHost ? 'normal' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {player.username}
                  {player.isHost ? '\n(Host)' : ''}
                </span>
              </div>
              {player.isHost && (
                <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: 600, marginTop: '-2px' }}>
                  (Host)
                </div>
              )}
              {player.isDrawing && (
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  background: '#22c55e', color: '#fff',
                  padding: '1px 8px', borderRadius: '99px', display: 'inline-block', marginTop: '2px',
                }}>Drawing</span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111', marginLeft: 'auto' }}>
              {player.score}
            </span>
          </div>
        ))}

        {/* Empty waiting slots */}
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 10px',
            borderRadius: '12px',
            border: '1.5px dashed #d1d5db',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: '2px dashed #d1d5db',
              flexShrink: 0,
            }} />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  );
}