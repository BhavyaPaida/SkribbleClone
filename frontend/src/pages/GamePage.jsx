import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../socket/socket';
import PlayerList from '../components/PlayerList';
import ChatBox from '../components/ChatBox';
import Canvas from '../components/Canvas';
import WordRevealOverlay from '../components/WordRevealOverlay';
import LeaderboardOverlay from '../components/LeaderboardOverlay';

export default function GamePage() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const username = state?.username || '';
  const [room, setRoom] = useState(state?.room || null);
  const [myWord, setMyWord] = useState(null);           // word shown to drawer
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [wordHint, setWordHint] = useState('');          // dashes for guessers
  const [timeLeft, setTimeLeft] = useState(null);

  const [roundOver, setRoundOver] = useState(false);
  const [roundData, setRoundData] = useState(null);     // { word, leaderboard }
  const [gameOver, setGameOver] = useState(false);
  const [gameData, setGameData] = useState(null);       // { leaderboard }

  const isDrawer = room?.currentDrawerId === socket.id;

  // Build word hint (dashes) from word length
  const buildHint = (word) => {
    if (!word) return '';
    return word.split(' ').map(w => '–'.repeat(w.length)).join('   ');
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Drawer receives their word
    socket.on('your-word', ({ word }) => {
      setMyWord(word);
      setShowWordReveal(true);
      setWordHint(buildHint(word));
    });

    // All players get updated room on new turn
    socket.on('new-turn', (updatedRoom) => {
      setRoom(updatedRoom);
      setRoundOver(false);
      setWordHint(buildHint(''));
      setTimeLeft(updatedRoom.roundTime);
      window.dispatchEvent(new CustomEvent('chat_log', {
        detail: `${updatedRoom.players?.find(p => p.id === updatedRoom.currentDrawerId)?.username || 'Someone'} is drawing...`,
      }));
    });

    // Game started (in case we navigate here fresh)
    socket.on('gameStarted', (updatedRoom) => {
      setRoom(updatedRoom);
      setTimeLeft(updatedRoom.roundTime);
    });

    // Round ended
    socket.on('round-ended', ({ word, leaderboard }) => {
      setRoundData({ word, leaderboard });
      setRoundOver(true);
      setMyWord(null);
    });

    // Game over
    socket.on('game-over', ({ leaderboard }) => {
      setGameData({ leaderboard });
      setGameOver(true);
      setRoundOver(false);
    });

    // Correct guess — room update
    socket.on('correctGuess', ({ room: updatedRoom }) => {
      if (updatedRoom) setRoom(updatedRoom);
    });

    socket.on('error', (err) => console.error('[socket]', err.message));

    const handleAny = (event, data) => {
      if (event.includes('left') && data?.room) {
        setRoom(data.room);
        window.dispatchEvent(new CustomEvent('chat_log', {
          detail: `${data.username} left the game.`,
        }));
      }
      if (event === 'roomClosed') {
        socket.disconnect();
        navigate('/', { state: { error: 'The room was closed because the host left or not enough players remained.' } });
      }
    };
    socket.onAny(handleAny);

    return () => {
      socket.off('your-word');
      socket.off('new-turn');
      socket.off('gameStarted');
      socket.off('round-ended');
      socket.off('game-over');
      socket.off('correctGuess');
      socket.off('error');
      socket.offAny(handleAny);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Initial room setup from state
  useEffect(() => {
    if (room) {
      setTimeLeft(room.roundTime);
      window.dispatchEvent(new CustomEvent('chat_log', { detail: 'Round 1 has started!' }));
    }
  }, []);

  // Request word if we missed the initial broadcast
  useEffect(() => {
    if (isDrawer && !myWord) {
      socket.emit('request-word');
    }
  }, [isDrawer, myWord]);

  const handleWordRevealDone = () => setShowWordReveal(false);

  const handleGameOver = () => {
    socket.disconnect();
    navigate('/');
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1b2d' }}>
        <p className="text-white text-lg">Loading game...</p>
      </div>
    );
  }

  const players = room.players || [];
  const currentDrawer = players.find(p => p.id === room.currentDrawerId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1b2d' }}>
      {/* Word reveal overlay for drawer */}
      {showWordReveal && myWord && (
        <WordRevealOverlay word={myWord} onDone={handleWordRevealDone} />
      )}

      {/* Round over leaderboard */}
      {roundOver && roundData && !gameOver && (
        <LeaderboardOverlay
          leaderboard={roundData.leaderboard}
          word={roundData.word}
          isGameOver={false}
        />
      )}

      {/* Game over leaderboard */}
      {gameOver && gameData && (
        <LeaderboardOverlay
          leaderboard={gameData.leaderboard}
          word={null}
          isGameOver={true}
          onContinue={handleGameOver}
        />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-3">
        <Logo />

        {/* Word hint or drawing indicator */}
        <div className="flex flex-col items-center gap-0.5">
          {isDrawer ? (
            <span
              className="text-white font-bold text-xl tracking-widest"
              style={{ textShadow: '0 0 20px rgba(99,179,237,0.5)' }}
            >
              {myWord || '...'}
            </span>
          ) : (
            <span className="text-white font-bold text-2xl tracking-[0.3em]">
              {wordHint || '– – – – –'}
            </span>
          )}
          {timeLeft !== null && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: timeLeft <= 10 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                color: timeLeft <= 10 ? '#f87171' : 'rgba(255,255,255,0.6)',
              }}
            >
              ⏱ {timeLeft}s
            </span>
          )}
        </div>

        <div className="text-white font-bold">
          Round: {room.currentRound} / {room.maxRounds}
        </div>
      </header>

      {/* Main grid */}
      <main
        className="flex-1 grid gap-4 px-6 pb-4"
        style={{ gridTemplateColumns: '1fr 2fr 1fr' }}
      >
        {/* Players */}
        <PlayerList
          players={players}
          maxPlayers={room.maxPlayers}
          currentDrawerId={room.currentDrawerId}
        />

        {/* Canvas */}
        <Canvas isDrawer={isDrawer} roomCode={roomCode} />

        {/* Chat */}
        <ChatBox roomCode={roomCode} isPlaying={true} isDrawer={isDrawer} />
      </main>
    </div>
  );
}

function Logo() {
  return (
    <h1 className="text-white text-xl font-bold tracking-tight">
      skribbl.io <span>✏️</span>
    </h1>
  );
}
