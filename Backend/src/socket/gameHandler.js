const gameService = require('../services/gameService');
const {getRoom} = require('../services/roomService');

const registerGameHandler = (io,socket) => {
    
    socket.on("startGame", ()=>{
        const room = getRoom(socket.roomCode);
        if(!room) return;

        room.gameService = new gameService(room);

        try{
            const data= room.gameService.startGame(socket.id);
            io.to(socket.roomCode).emit("gameStarted", data.room);
            io.to(data.drawerId).emit("your-word", {word: data.word});

            startRoundTimer(io, socket.roomCode, room);
        }
        catch(err){
            socket.emit("error", {message: err.message});
        }
    })

    socket.on("request-word", () => {
        const room = getRoom(socket.roomCode);
        if(!room || room.status !== "playing") return;

        if (socket.id === room.currentDrawerId && room.currentWord) {
             socket.emit("your-word", { word: room.currentWord });
        }
    });

    socket.on("guess-word", ({guess}) => {
        const room= getRoom(socket.roomCode);
        if(!room || room.status !== "playing") return;

        const normalizedGuess = guess.trim().toLowerCase();
        const normalizedWord = room.currentWord.trim().toLowerCase();

        if(normalizedGuess === normalizedWord){
            const result = room.gameService.handleCorrectGuess(socket.id);
            if(!result) return;

            io.to(socket.roomCode).emit("correctGuess", {
                playerName: result.guesser.name,
                points: result.guesserPoints,
                room: result.room,
            })

            if(room.gameService.checkRoundEnd()){
                endRound(io, socket.roomCode, room);
            }
        }
        else{
            io.to(socket.roomCode).emit("chat-message", {
                playerName: socket.username,
                message: guess,
                isCorrect: false,
            })
        }
    })


    const startRoundTimer = (io, roomCode, room)=> {
        const timer = setTimeout(()=>{
            if(room.status!=="playing") return;
            endRound(io, roomCode, room);

        }, room.roundTime * 1000);

        room.timer=timer;
    };

    const endRound = (io, roomCode, room) => {
        if (room.timer) {
            clearTimeout(room.timer);
            room.timer = null;
        }

        room.status = "waiting"; // Prevent old drawer from requesting word

        room.players.forEach(p => {
            p.hasGuessed = false;
        });

  
        io.to(roomCode).emit("clearCanvas");

  
        io.to(roomCode).emit("round-ended", {
            word: room.currentWord,
            leaderboard: room.gameService.getLeaderboard(),
        });


        setTimeout(() => {
            if (room.gameService.checkGameEnd()) {
                const result = room.gameService.endGame();
                io.to(roomCode).emit("game-over", { leaderboard: result.leaderboard });
            } 
            
            else {
                const data = room.gameService.assignNextDrawer();
                if (!data) return; // Abort if game can't continue (e.g. no players)
                io.to(roomCode).emit("new-turn", data.room);
                io.to(data.drawerId).emit("your-word", { word: data.word });
                startRoundTimer(io, roomCode, room);
            }
        }, 3000);
    };
}

module.exports = {registerGameHandler};