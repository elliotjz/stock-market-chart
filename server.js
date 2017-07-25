'use strict'

const express = require("express");
const env = require('./env');
const socket = require('socket.io');
const mongoose = require('mongoose');


const app = express();


app.set("view engine", "pug");

app.use(express.static('./public'));

mongoose.connect(env.MLAB_URL);
//mongoose.connect(process.env.MLAB_URL);
let stocksSchema = new mongoose.Schema({
    id: String,
    stocks: Array
})

let StocksModel = mongoose.model('stocks', stocksSchema);


// Set up Routes
app.get("/", function(req, res) {
    
    console.log('Reloaded.');
    
    StocksModel.findOne({id: '0'}, function(err, dbData) {
    	if (err) throw err;

    	console.log('stocks: ', dbData.stocks);

    	res.render("index", {
    		stocks: dbData.stocks
    	});
    })
    
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

        StocksModel.findOne({id: '0'}, function(err, dbData) {
        	if (err) throw err;
        	let stocks = dbData.stocks;
        	stocks.push(data.stock)
        	StocksModel.update({id: '0'}, {
        		$set: {stocks: stocks}
        	}, function(err, data) {
        		if (err) throw err;
        	})
        })
    });

    socket.on('remove-stock', function(data) {
    	io.sockets.emit('remove-stock', data);

    	StocksModel.findOne({id: '0'}, function(err, dbData) {
        	if (err) throw err;
        	let stocks = dbData.stocks;
        	let indexToRemove = stocks.indexOf(data.stock);
        	stocks.splice(indexToRemove, 1);
        	StocksModel.update({id: '0'}, {
        		$set: {stocks: stocks}
        	}, function(err, data) {
        		if (err) throw err;
        	})
        })
    })

})


