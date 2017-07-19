
// Make connection
let socket = io.connect('http://localhost:3000');

// Query DOM
let message = document.getElementById('message');
let handle = document.getElementById('handle');
let btn = document.getElementById('btn');
let output = document.getElementById('output');
let feeback = document.getElementById('feedback');

// Emit Events
btn.addEventListener('click', function() {
	socket.emit('chat', {
		message: message.value,
		handle: handle.value
	})
})

message.addEventListener('keypress', function() {
	socket.emit('typing', handle.value);
})

// Listen for events

socket.on('chat', function(data) {
	output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
	feedback.innerHTML = '';
})

socket.on('typing', function(data) {
	feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
})