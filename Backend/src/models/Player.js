class Player {

    constructor(id, username){
        this.id=id;
        this.username=username;
        this.score=0;
        this.isDrawing=false;
        this.hasGuessed=false;
        this.isHost=false;
    }

    addScore(points){
        this.score+=points;
    }

    resetForNewRound(){
        this.isDrawing=false;
        this.hasGuessed=false;
    }

    toJSON(){
        return {
            id: this.id,
            username: this.username,
            score: this.score,
            isDrawing: this.isDrawing,
            hasGuessed: this.hasGuessed,
            isHost: this.isHost 
        };
    }
}


module.exports = Player;