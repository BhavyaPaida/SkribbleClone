const {createRoom, joinRoom, leaveRoom} = require('../services/roomService');

const {registerGameHandler} = require('./gameHandler');
const {registerDrawHandler} = require('./drawHandler');
const {registerChatHandler} = require('./chatHandler');


const roomHandler = (io, socket) =>{

      registerGameHandler(io, socket);
      registerDrawHandler(io, socket);
      registerChatHandler(io, socket);


    socket.on('createRoom', ({username, maxPlayers})=>{
        try {
            const room = createRoom(socket.id, username, maxPlayers);

            socket.roomCode = room.code;
            socket.username = username;


            //make this socket "join" the socket.IO room
            //this is what enables io.to("XKQP".emit() later

            socket.join(room.code); 

            socket.emit("roomCreated", room);

            //registering a handle means simply calling socket.on()


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

            io.to(roomCode).emit(`${username} joined`, room)

            
        }
        catch(err){
            socket.emit("error", {message: err.message});
        }
    })


    socket.on("leaveRoom", ()=>{
        const {roomCode, username} = socket;
        const result = leaveRoom(socket.id, roomCode);

        socket.leave(roomCode);

        if(!result) return;

        if (result.deleted) {
            io.to(roomCode).emit('roomClosed');
        } else {
            io.to(roomCode).emit(`${username} left`, {
                username,
                room: result.room
            });
        }
    });

    socket.on("disconnect", ()=>{
        if(!socket.roomCode) return;

        const result = leaveRoom(socket.id, socket.roomCode);
        if(!result) return;
        
        if (result.deleted) {
            io.to(socket.roomCode).emit('roomClosed');
        } else {
            io.to(socket.roomCode).emit(`${socket.username} left`, {
                username: socket.username,
                room: result.room,
            });
        }
    });

};
module.exports = roomHandler;