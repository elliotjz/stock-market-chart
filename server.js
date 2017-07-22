'use strict'

const express = require("express");
const env = require('./env');
const socket = require('socket.io');
const mongoose = require('mongoose');


const app = express();


app.set("view engine", "pug");

app.use(express.static('./public'));

mongoose.connect(env.MLAB_URL || process.env.MLAB_URL);
let stocksSchema = new mongoose.Schema({
    id: String,
    stocks: Array
})

let StocksModel = mongoose.model('stocks', stocksSchema);


// Set up Routes
app.get("/", function(req, res) {
    
    res.render("index");
    
})

// Listen to port
const port = process.env.PORT || 3000;
let server = app.listen(port, function(){
    console.log("Server running");
});

// Listen to socket.io
let io = socket(server);

io.on('connection', function(socket) {
    console.log('made socket connection');
    console.log(socket.id);

    socket.on('add-stock', function(data) {
        io.sockets.emit('add-stock', data);
    });

    socket.on('remove-stock', function(data) {
    	io.sockets.emit('remove-stock', data);
    })

})


