const express=require('express')
const cors=require('cors')
const roomRoutes= require('./routes/roomRoutes')
const errorHandler= require('./middleware/errorHandler');

const app=express();
app.use(express.json());
app.use(cors());


//routes

app.use('/api/rooms', roomRoutes);

//Health Check
//A simple endpoint to confirm the server is alive
//Used by deployment platforms (AWS, Railway, etc) to check server health.
//GET http://localhost:3000/health ->{status:"ok"}


app.get('/health', (req,res)=>{
    res.status(200).json({status: 'ok'});
})


// 404 Handler
// If no route above matches, we reach here
//Must be placed AFTER all the routes

app.use((req, res)=>{
    res.status(404).json({error: 'Route not found'})
})

// Global Error Handler
// This is a special middleware with 4 parameters (err, req, res, next).
// Express recognizes it as an error handler because of the extra `err` param.
// Any route that calls next(err) will land here.
// Must be placed LAST — after all routes and middleware.
app.use(errorHandler);

module.exports = app;