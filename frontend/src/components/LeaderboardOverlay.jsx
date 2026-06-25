export default function LeaderboardOverlay({ leaderboard, word, isGameOver, onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(10, 20, 40, 0.8)' }}
    >
      <div
        className="flex flex-col items-center gap-5 rounded-3xl px-10 py-10 w-full max-w-md mx-4 shadow-2xl"
        style={{ background: '#162032', border: '1.5px solid rgba(255,255,255,0.12)' }}
      >
        <h2 className="text-white text-2xl font-bold">
          {isGameOver ? '🏆 Game Over!' : '⏱️ Round Over!'}
        </h2>

        {word && (
          <div
            className="px-5 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
          >
            The word was:{' '}
            <span className="text-white font-bold text-base">{word}</span>
          </div>
        )}

        <div className="w-full flex flex-col gap-2 mt-1">
          {leaderboard.map((player, i) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: i === 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)',
                border: i === 0 ? '1px solid rgba(250,204,21,0.25)' : '1px solid transparent',
              }}
            >
              <span className="text-xl w-6 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="flex-1 text-white font-medium truncate">{player.username}</span>
              <span
                className="font-bold"
                style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.7)' }}
              >
                {player.score} pts
              </span>
            </div>
          ))}
        </div>

        {isGameOver && (
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-xl text-white font-bold transition hover:brightness-110 active:scale-95 mt-2"
            style={{ background: '#1a56db' }}
          >
            Back to Home
          </button>
        )}
        {!isGameOver && (
          <p className="text-white/40 text-sm">Next round starting soon...</p>
        )}
      </div>
    </div>
  );
}
