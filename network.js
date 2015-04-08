//convenience
var socket = new WebSocket("ws://" + location.hostname + ":8082");
socket.onmessage = function(message) {
	message = JSON.parse(message.data);
	if (responses[message.type]) {
		responses[message.type](message.data);
	} else {
		throw "Message type " + message.type + " not handled!";
	}
}
function respond(messageType, dataObject) {
	socket.send(JSON.stringify({
		type:messageType,
		data:dataObject
	}));
}

//message handlers
var responses = {
	"error": function(message) {
		alert(message.message);
	},
	"host-success": function(message) {
		showScreen('server-screen');
	},
	"join-success": function(message) {
		showScreen('client-screen');
	}
};