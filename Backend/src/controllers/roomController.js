const {getRoom}= require('../services/roomService');

const checkRoom = (req,res, next)=>{
    try{
        const {code}=req.params;
        const room = getRoom(code);

        if(!room){
            const error= new Error("Room not found");
            error.statusCode=404;
            throw error;
        }

        if (room.status === "playing"){
            const error = new Error("Game already started");
            error.statusCode=400;
            throw error;
        }

        if(room.isFull()){
            const error= new Error("Room is full");
            error.statusCode=400;
            throw error;
        }

        res.status(200).json(room.toJSON());
    }

    catch(err){
        next(err);
    }
};

module.exports = {checkRoom}