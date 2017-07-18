'use strict'

const express = require("express");
const controller = require('./controller');
const socket = require('socket.io');


const app = express();


app.set("view engine", "pug");

app.use(express.static('./public'));

// Set up Routes
controller(app);


const port = process.env.PORT || 3000;

let server = app.listen(port, function(){
    console.log("Server running");
});

let io = socket(server);

io.on('connection', function(socket) {
    console.log('made socket connection');
    console.log(socket.id);

    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    })
})





