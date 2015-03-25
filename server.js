var wss = new (require('ws').Server)({ port: 8082 });

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
    });
};

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		try {
			message = JSON.parse(message);
		} catch (e) {
			//console.log(e);
			return;
		}
		if (responses[message.type]) {
			responses[message.type](ws, message);
		}
	});
});

var responses = {
	"time": function(ws, message) {
		ws.send(JSON.stringify({
			type: "time",
			data: Date.now() //time in ms
		}));
	},
	"note": function(ws, message) {
		wss.broadcast(JSON.stringify({
			type: "note",
			data: message.data
		}));
	}
}