const Room = require('../models/Room');
const Player=require('../models/Player');
const generateRoomCode= require('../utils/generateRoomCode');

//in-memory storage - all active rooms live here


const rooms= new Map();

const createRoom = (hostId, username, maxPlayers)=>{
    let code= generateRoomCode();
    while(rooms.has(code)){
        code= generateRoomCode();
    } 

    const room= new Room(code, hostId);

    if(maxPlayers>1) room.maxPlayers=maxPlayers;
    const host= new Player(hostId, username);
    host.isHost=true;
    room.players.set(host.id, host);
    room.departedPlayers = new Set(); // Track players who left to prevent rejoining
    rooms.set(code, room);
    return room.toJSON();
};


const joinRoom = (roomCode, playerId, username)=>{
    const room = rooms.get(roomCode);
    if(!room){
        const error= new Error("Room not found");
        error.statusCode=404;
        throw error;
    }

    if(room.status === "playing"){
        const error= new Error("Game already started");
        error.statusCode=400;
        throw error;
    }

    if(room.players.size >=room.maxPlayers){
        const error= new Error("Room is full");
        error.statusCode=400;
        throw error;
    }

    if(room.departedPlayers && room.departedPlayers.has(username)){
        const error= new Error("You cannot rejoin a room you have left.");
        error.statusCode=403;
        throw error;
    }

    const player= new Player(playerId, username);
    room.players.set(player.id, player);
    return room.toJSON();
};

const leaveRoom = (playerId, roomCode)=>{
    const room = rooms.get(roomCode);
    if(!room) return { deleted: true }; // Assume deleted if not found

    const player = room.players.get(playerId);
    if(player){
        if(!room.departedPlayers) room.departedPlayers = new Set();
        room.departedPlayers.add(player.username);
        room.players.delete(playerId);
    }

    // Delete room if completely empty, if the host leaves, or if a playing game drops to 1 player
    if(room.players.size === 0 || room.hostId === playerId){
        rooms.delete(roomCode);
        return { deleted: true };
    }
    
    if (room.status === "playing" && room.players.size <= 1) {
        rooms.delete(roomCode);
        return { deleted: true };
    }

    return { deleted: false, room: room.toJSON() };
};

const getRoom = (roomCode)=>{
    const room = rooms.get(roomCode);
    return room || null;
}

module.exports = {createRoom, joinRoom, leaveRoom, getRoom}


