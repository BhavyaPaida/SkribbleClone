const {getRoom} = require('../services/roomService');

const registerChatHandler = (io, socket) => {

    socket.on("chat-message", ({message}) => {
        const room= getRoom(socket.roomCode);
        if(!room)  return;

        if(room.status === 'playing' && socket.id === room.currentDrawerId) return;

        io.to(socket.roomCode).emit("chat-message", {
            playerName: socket.username,
            message,
            isCorrect: false,
        })
    })
}

module.exports = {registerChatHandler};