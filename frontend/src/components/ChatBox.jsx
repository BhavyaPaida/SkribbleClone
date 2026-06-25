import { useState, useEffect, useRef } from 'react';
import socket from '../socket/socket';

export default function ChatBox({ roomCode, isPlaying = false, initialMessages = [] }) {
  // Seed state directly from initialMessages prop — runs only once on mount
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleChat = (data) => {
      setMessages((prev) => [...prev, { type: 'chat', ...data }]);
    };

    const handleCorrectGuess = (data) => {
      setMessages((prev) => [...prev, {
        type: 'correct',
        text: `🎉 ${data.playerName} guessed the word! (+${data.points} pts)`,
      }]);
    };

    // Listen for log events dispatched via window (join/leave from WaitingRoomPage)
    const handleLog = (e) => {
      setMessages((prev) => [...prev, { type: 'log', text: e.detail }]);
    };

    socket.on('chat-message', handleChat);
    socket.on('chat message', handleChat);
    socket.on('correctGuess', handleCorrectGuess);
    window.addEventListener('chat_log', handleLog);

    return () => {
      socket.off('chat-message', handleChat);
      socket.off('chat message', handleChat);
      socket.off('correctGuess', handleCorrectGuess);
      window.removeEventListener('chat_log', handleLog);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (isPlaying) {
      socket.emit('guess-word', { guess: input.trim() });
    } else {
      socket.emit('chat message', { message: input.trim() });
    }
    setInput('');
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f3f4f6' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 800,
          color: '#6b7280',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: 0,
        }}>CHAT / ROOM LOG</h2>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.type === 'log' && (
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                {msg.text}
              </p>
            )}
            {msg.type === 'chat' && (
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{msg.playerName}</span>{' '}
                <span style={{ color: '#374151' }}>{msg.message}</span>
              </p>
            )}
            {msg.type === 'correct' && (
              <p style={{
                margin: 0, fontSize: '13px', fontWeight: 600,
                padding: '6px 10px', borderRadius: '8px',
                background: '#dcfce7', color: '#166534',
              }}>
                {msg.text}
              </p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderTop: '1px solid #f3f4f6',
      }}>
        <input
          type="text"
          placeholder={isPlaying ? 'Type your guess...' : 'Type a message...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            fontSize: '14px',
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: '#f9fafb',
            outline: 'none',
            color: '#111',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#3b82f6', padding: '4px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}