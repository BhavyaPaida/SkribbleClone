const {Server} = require("socket.io");
const roomHandler = require('./roomHandler');

const initSocket = (server)=>{  //create a function to receive HTTP server
    const io = new Server(server, {
        cors:{
            origin: "*", // allow requests from any origin
        },
    });

    io.on('connection', (socket)=> {
        console.log(`Player connected: ${socket.id}`);

        roomHandler(io, socket);
    });
};
//

module.exports = {initSocket};

//notes

/**
 * io vs socket
 * io -> the whole socket.io server used to broadcast to 
 *       EVERYONE or a whole room.. IO.TO("XKQP").emit(..)
 *       -> sends to all players in room XKQP
 * 
 * socket -> one specific player's connection, used to talk
 *           just that player.. socket.emit(..)
 *           -> sends to just that player
 */


/**
 * socket.on(..) means listen for an event coming from client
 * socket.emit() means send an event to the client
 * 
 * 
 */