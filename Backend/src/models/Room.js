const {getRandomWord} = require('../utils/generateWordList');

class Room{
    constructor (code, hostId){
        this.code=code;
        this.hostId=hostId;
        this.players=new Map();
        this.maxPlayers=8;
        this.maxRounds=3;
        this.roundTime=60;
        this.status='waiting';
        this.currentRound=0;
        this.currentWord=null;
        this.usedWords=[];
        this.currentDrawerId=null;
        this.roundStartTime=null;
        this.timer=null;
        this.gameService=null;
    }

    isFull(){
        return this.players.size >= this.maxPlayers;
    }

    toJSON(){
        return {
            code: this.code,
            hostId: this.hostId,
            players: this.getPlayersArray().map(p => p.toJSON()),
            maxPlayers: this.maxPlayers,
            totalRounds: this.totalRounds,
            roundTime: this.roundTime,
            status: this.status,
            currentRound: this.currentRound,
            currentDrawerId: this.currentDrawerId,
        };
    }
}

module.exports= Room;