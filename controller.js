'use strict'

let googleFinance = require('google-finance');
/*const mongoose = require('mongoose');

// Setup Mongoose & MLAB
mongoose.connect(process.env.MLAB_URL);
let userSchema = new mongoose.Schema({
    id: String,
    name: String,
})
let rsvpSchema = new mongoose.Schema({
    id: String,
    rsvps: Object
})
let UserModel = mongoose.model('users', userSchema);
let RsvpModel = mongoose.model('rsvps', rsvpSchema);

*/

module.exports = function(app) {

	app.get("/", function(req, res) {
        
        googleFinance.historical({
            symbol: 'NASDAQ:AAPL',
            from: '2014-01-01',
            to: '2014-12-31'
        }, function (err, quotes) {
            if (err) throw err;

            res.render("index", {
                quotes: quotes
            });
        });
        
	})
}

