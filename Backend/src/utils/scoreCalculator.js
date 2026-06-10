const MAX_POINTS = 300;
const MIN_POINTS = 50;
const DRAWER_POINTS = 50;

const calculateScore = (timeElapsed, totalRoundTime, didGuess) => {
    if(!didGuess) return 0;
    fraction = timeElapsed / totalRoundTime;
    const rawscore = Math.floor(MAX_POINTS * (1 - fraction));
    return Math.max(rawscore, MIN_POINTS);
}



module.exports = {calculateScore, DRAWER_POINTS};

