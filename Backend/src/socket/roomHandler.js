const {createRoom, joinRoom} = require('../services/roomService');

const {registerGameHandler} = require('./gameHandler');
const {registerDrawHandler} = require('./drawHandler');
const {registerChatHandler} = require('/chatHandler');


const roomHandler = (io, socket) =>{
    socket.on('createRoom', ({username, maxPlayers})=>{
        try {
            const room = createRoom(socket.id, username, maxPlayers);

            socket.roomcode = room.code;
            socket.username = username;


            //make this socket "join" the socket.IO room
            //this is what enables io.to("XKQP".emit() later

            socket.join(room.code); 

            socket.emit("roomCreated", room.toJSON());

            //registering a handle means simply calling socket.on()

            registerGameHandler(io, socket);
            registerDrawHandler(io, socket);
            registerChatHandler(io, socket);

        }
        catch(err){
            socket.emit("error", {message: err.message});
        }
    });

    socket.on("joinRoom", ({username, roomCode})=>{
        try{
            const room = joinRoom(roomCode, socket.id, username);

            socket.roomCode = roomCode;
            socket.username = username;
            socket.join(roomCode);

            io.to(roomCode).emit(` ${username} joined`, room)

            registerGameHandler(io, socket);
            registerDrawHandler(io, socket);
            registerChatHandler(io, socket);
            
        }
        catch(err){
            socket.emit("error", {message: err.message});
        }
    })


    socket.on("leaveRoom", ()=>{
        const {roomCode, username} = socket;
        const updatedRoom = leaveRoom(socket.id, roomCode);

        socket.leave(roomCode);

        if(!updatedRoom){return;}

        io.to(roomCode).emit(`${username} left`, {
            username,
            room: updatedRoom});
    });

    socket.on("disconnect", ()=>{
        if(!socket.roomCode) return;

        const updatedRoom = leaveRoom(socket.id, socket.roomCode);
        if(!updatedRoom) return;
        io.to(socket.roomCode).emit(`${socket.username} left`, {
            username: socket.username,
            room: updatedRoom,
        });
    });

};
module.exports = roomHandler;