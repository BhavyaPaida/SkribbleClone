const http=require('http');
const app= require('./src/app')
const {initSocket} = require('./src/socket/index')
const {PORT} = require('./src/config/env')


const server= http.createServer(app);
initSocker(server);

server.listen(PORT, ()=>{
    console.log('server running on http://localhost: ${PORT}');
});
 