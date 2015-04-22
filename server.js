var WS = require('ws');
var wss = new (WS.Server)({ port: 8082 });

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
	
	ws.broadcast = function(messageType, messageObject) {
		if (this.code !== undefined)
			for (var i = 0; i < servers[this.code].length; i++)
				try {
					servers[this.code][i].send(JSON.stringify({
						type: messageType,
						data: messageObject
					}));
				} catch (e) {
					if (servers[this.code][i].readyState == ws.CLOSED) {
						servers[this.code].splice(i, 1);
					} else {
						console.log(e);
					}
				}
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
			
			this.onclose = function() {
				for (var i = 0; i < servers[this.code].length; i++) {
					servers[this.code][i].close();
				}
				delete servers[this.code];
			}
		}
	},
	"join": function(message) {
		if (servers[message.code]) {
			servers[message.code].push(this);
			this.respond("join-success",{});
			for (var i = 0; i < servers[message.code].length; i++) {
				if (servers[message.code][i].lastChord) {
					this.respond("chord",{
						notes:servers[message.code][i].lastChord,
						color:servers[message.code][i].lastColor
					});
				}
			}
		} else {
			this.respond("error", {
				message: "That code does not link to any server!"
			});
		}
	},
	"chord": function(message) {
		if (this.code === undefined) {
			console.log("someone is trying to hijack the server!");
			return;
		}
		this.broadcast("chord", message);
		this.lastChord = message.notes;
		this.lastColor = message.color;
	}
}