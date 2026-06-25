const {getRandomWord} = require('../utils/generateWordList');
const {calculateScore, DRAWER_POINTS} = require('../utils/scoreCalculator');



class GameService{
    constructor(room){
        this.room=room;
    }

    startGame(hostId){
        if(this.room.hostId !== hostId){
            const error= new Error("Only host can start the game");
            error.statusCode=403;
            throw error;
        }

        if(this.room.players.size<2){
            const error = new Error("Need at least 2 players to start the game");
            error.statusCode = 400;
            throw error;
        }

        this.room.status="playing";
        this.room.currentRound=1;

        const firstDrawer = this.room.players.values().next().value;
        this._setUpTurn(firstDrawer.id);
        return this._getTurnData();
    }

    assignNextDrawer() {
        const players = Array.from(this.room.players.values());
        const currentIndex = players.findIndex(p => p.id === this.room.currentDrawerId);
        const nextIndex = (currentIndex + 1) % players.length;

        if (nextIndex == 0){
            this.room.currentRound +=1;
        }

        this._setUpTurn(players[nextIndex].id);
        return this._getTurnData();
    }

    handleCorrectGuess(guesserId){
        const guesser = this.room.players.get(guesserId);
        if(!guesser || guesser.hasGuessed) return null;
        const timeElapsed = Math.floor(
            (Date.now() - this.room.roundStartTime) / 1000
        );
        const guesserPoints = calculateScore(timeElapsed, this.room.roundTime, true);
        guesser.score+=guesserPoints;
        guesser.hasGuessed=true;

        
        const drawer = this.room.players.get(this.room.currentDrawerId);
        if(drawer){
            drawer.score+=DRAWER_POINTS;
        }

        return {
            guesser: guesser.toJSON(),
            guesserPoints,
            room: this.room.toJSON(),
        };
    }


    checkRoundEnd(){
        const nonDrawers = Array.from(this.room.players.values()).filter(p=>p.id != this.room.currentDrawerId);
        const allGuessed= nonDrawers.every(p=>p.hasGuessed);
        const timeUp = Math.floor((Date.now()-this.room.roundStartTime)/1000) >=this.room.roundTime;
        return allGuessed || timeUp;
    }

    checkGameEnd(){
        return this.room.currentRound > this.room.maxRounds;
    }

    getLeaderboard() {
        return Array.from(this.room.players.values()).sort((a,b)=> b.score-a.score).map(p=>p.toJSON());
    }


    endGame(){
        this.room.status="finished";
        const leaderboard = Array.from(this.room.players.values())
            .sort((a, b) => b.score - a.score)
            .map(p => p.toJSON());

        return { leaderboard };
    }

    _setUpTurn(drawerId){
        let word=getRandomWord();
        while(this.room.usedWords.includes(word)){
            word=getRandomWord();
        }
        this.room.usedWords.push(word);
        this.room.currentWord=word;
        this.room.currentDrawerId=drawerId;
        this.room.roundStartTime=Date.now();

        this.room.players.forEach(player => {
            player.isDrawing = false;
            player.hasGuessed = false;
        });

        const drawer= this.room.players.get(drawerId);
        if(drawer) drawer.isDrawing=true;
    }

    _getTurnData(){
        return{
            room: this.room.toJSON(),
            word: this.room.currentWord,
            drawerId: this.room.currentDrawerId,
        };
    }

    
}