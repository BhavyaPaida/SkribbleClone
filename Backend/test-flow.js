const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected with id", socket.id);
    socket.emit("createRoom", { username: "Host", maxPlayers: 8 });
});

socket.on("roomCreated", (room) => {
    console.log("Room created", room.code);
    
    const socket2 = io("http://localhost:3000");
    socket2.on("connect", () => {
        socket2.emit("joinRoom", { username: "Player2", roomCode: room.code });
    });

    setTimeout(() => {
        console.log("Starting game...");
        socket.emit("startGame");
    }, 500);
});

socket.on("gameStarted", (room) => {
    console.log("Game started received");
    console.log("Requesting word...");
    socket.emit("request-word");
});

socket.on("your-word", (data) => {
    console.log("Received your-word!", data);
    process.exit(0);
});

setTimeout(() => {
    console.log("Timeout! Did not receive word.");
    process.exit(1);
}, 3000);
