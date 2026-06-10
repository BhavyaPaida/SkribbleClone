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
        errorstatusCode=404;
        throw error;
    }

    if(room.players.size >=room.maxPlayers){
        const error= new Error("Room is full");
        error.statusCode=400;
        throw error;
    }

    const player= new Player(playerId, username);
    room.players.set(player.id, player);
    return room.toJSON();
};

const leaveRoom = (roomCode, playerId)=>{
    const room = rooms.get(roomCode);
    if(!room) return null;

    room.players.delete(playerID);

    if(room.players.size === 0){
        rooms.delete(roomCode);
        return null;
    }

    if(room.hostID===playerId){
        const newHost = room.players.values().next().value;
        newHost.isHost=true;
        room.hostID=newHost.id;
    }

    return room.toJSON();
};

const getRoom = (roomCode)=>{
    room=rooms.get(roomCode)
    return room.toJSON();
}

module.exports = {createRoom, joinRoom, leaveRoom, getRoom}


