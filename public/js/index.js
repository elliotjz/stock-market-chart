
// Make connection
let socket = io.connect('http://localhost:3000');

// Query DOM
let message = document.getElementById('message');
let handle = document.getElementById('handle');
let btn = document.getElementById('btn');
let output = document.getElementById('output');

// Emit Events
btn.addEventListener('click', function() {
	console.log('click');
	socket.emit('chat', {
		message: message.value,
		handle: handle.value
	})
})

// Listen for events

socket.on('chat', function(data) {
	output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
})