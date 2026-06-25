const {getRoom} = require('../services/roomService');

const registerDrawHandler = (io,socket) => {

    socket.on("Draw", (drawData) => {
        const room = getRoom(socket.roomCode);
        if(!room || room.status!=="playing") return;

        if(socket.id!== room.currentDrawerId) return;

        //broadcast to everyone in room except the drawer
        socket.to(socket.roomCode).emit("draw", drawData);
    });

    socket.on("clearCanvas", ()=> {
        const room=getRoom(socket.roomCode);
        if(!room) return;

        if(socket.id !== room.currentDrawerId) return;

        socket.to(socket.roomCode).emit("clearCanvas")
    })
}

module.exports = {registerDrawHandler};