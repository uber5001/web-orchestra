var wss = new (require('ws').Server)({ port: 8082 });

wss.broadcast = function broadcast(messageType, messageObject) {
	wss.clients.forEach(function each(client) {
		client.send(JSON.stringify({
			type: messageType,
			data: messageObject
		}));
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
			responses[message.type].call(ws, message.data);
		}
	});
	
	ws.respond = function(messageType, messageObject) {
		ws.send(JSON.stringify({
			type: messageType,
			data: messageObject
		}));
	};
});

var servers = {};

//message handlers
var responses = {
	"host": function(message) {
		if (servers[message.code]) {
			this.respond("error", {
				message: "That code is already in use!"
			});
		} else {
			this.code = message.code;
			servers[message.code] = [this];
			this.respond("host-success",{});
		}
	},
	"join": function(message) {
		if (servers[message.code]) {
			servers[message.code].push(this);
			this.respond("join-success",{});
		} else {
			this.respond("error", {
				message: "That code does not link to any server!"
			});
		}
	}
}