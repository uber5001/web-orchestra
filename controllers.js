//targeting convenience
function $(target) {return document.querySelector(target);}
function $$(target) {return document.querySelectorAll(target);}

//screen switching
var screenElements = $$('body > .screen');
var screenIds = [];
for (var i = 0; i < screenElements.length; i++) {
	screenIds[i] = screenElements[i].id;
}
function showScreen(screenName) {
	for (var i = 0; i < screenIds.length; i++) {
		document.body.classList.remove(screenIds[i]);
	}
	document.body.classList.add(screenName);
	if (screenName == "server-screen") {
		$("#chord-editor").scrollLeft = 980;
		
		//start with a chord
		
		$("#chord-list ul li:first-child").click();
	}
}

//loading-screen
socket.onclose = function() {
	showScreen('connection-error-screen');
}
socket.onopen = function() {
	showScreen('host-join-screen');
}

//host-join-screen
$("#host").onclick = function() {
	showScreen('host-screen');
}
$("#join").onclick = function() {
	showScreen('join-screen');
}

//host-screen
$("#host-screen .back").onclick = function() {
	showScreen('host-join-screen');
}
$("#host-code-submit").onclick = function() {
	if (this.hasAttribute("disabled")) return;
	respond("host", {
		code: $("#host-code").value.toUpperCase().match(/[A-Z0-9]*/)[0]
	});
}
$("#host-code").onkeyup = function() {
	if (this.value.length > 0) {
		$("#host-code-submit").removeAttribute("disabled");
	} else {
		$("#host-code-submit").setAttribute("disabled","");
	}
}
/*
function autoNext() {
	for (var i = 1; i < arguments.length; i++) {
		var prev = arguments[Math.max(i-2, 0)];
				
		var cur = arguments[i-1];
		var nex = arguments[i];
		(function() {
			var previous = prev;
			var current = cur;
			var next = nex;
			current.onfocus = function() {
				
			}
			current.onblur = function() {
				var lastchar = this.value.match(/[a-zA-Z0-9]$/)
				if (lastchar === null) lastchar = "";
				else lastchar = lastchar[0].toUpperCase();
				this.value = lastchar;
			}
			current.onkeydown = function(e) {
				if (e.keyCode !== 229) e.preventDefault();
				if 
				(
					(e.keyCode >= 65 && e.keyCode <= 90)
					|| (e.keyCode >= 48 && e.keyCode <= 57)
				)
				{
					this.value = String.fromCharCode(e.keyCode);
					next.focus();
				}
				else if (e.keyCode == 229) {
					var lastchar = this.value.match(/[a-zA-Z0-9]/)
					if (lastchar === null) lastchar = "";
					else lastchar = lastchar[0].toUpperCase();
					this.value = lastchar;
					
					if (lastchar != "") next.focus();
				} else if (e.keyCode == 8) {
					//backspace
					if (this.value == "") {
						previous.focus();
						previous.value = "";
					} else {
						this.value = "";
					}
				} else if (e.keyCode == 37) {
					//left arrow
					previous.focus();
				} else if (e.keyCode == 39) {
					//right arrow
					next.focus();
				}
			}
		})()
	}
}
*/

//join-screen
$("#join-screen .back").onclick = function() {
	showScreen('host-join-screen');
}
$("#join-code-submit").onclick = function() {
	if (this.hasAttribute("disabled")) return;
	respond("join", {
		code: $("#join-code").value.toUpperCase().match(/[A-Z0-9]*/)[0]
	});
}
$("#join-code").onkeyup = function() {
	if (this.value.length > 0) {
		$("#join-code-submit").removeAttribute("disabled");
	} else {
		$("#join-code-submit").setAttribute("disabled","");
	}
}

//client-screen
responses["chord"] = function(message) {
	var notes = message.notes;
	var color = message.color;
	var ul = $("#client-screen ul");
	
	for (var i = 0; i < ul.children.length; i++) {
		ul.children[i].kill();
	}
	
	ul.innerHTML = "";
	for (var i = 0; i < notes.length; i++) {
		var canvas = document.createElement("canvas");
		canvas.classList.add("key-canvas");
		canvas.width = 256;
		canvas.height = 256;
		//a.innerHTML = notes[i];
		(function() {
			var alive = true;
			canvas.kill = function() {
				alive = false;
			}
			
			var width = 256;
			var height = 256;
			var notePlayer = new NotePlayer(notes[i]);
			var buffer = new Uint8Array(notePlayer.analyser.frequencyBinCount); 
			var context = canvas.getContext('2d');
			var scalar = 1;
			var phase = 0;
			var oldTime = Date.now();
			canvas.onclick = function(e) {
				e.preventDefault();
				notePlayer.play();
			}
			function animate() {
				if (!alive) return;
				var newTime = Date.now();
				var deltaTime = newTime - oldTime;
				oldTime = newTime;
				phase += Math.floor(deltaTime/4);
				
				requestAnimationFrame(animate);
				notePlayer.analyser.getByteTimeDomainData(buffer);
				context.clearRect(0, 0, width, height);
				context.strokeStyle = "#" + color;
				context.lineWidth = 2;
				context.beginPath();
				
				var offset = 0;
				var offset2 = 0;
				var phaseLength = 0;
				while (
					!(
						buffer[offset] <= 127
						&& buffer[offset+1] > 127
					)
					&& offset < 1000
				) {offset++};
				if (offset == 1000){
					offset = 0;
					phase = 0;
				} else {
					offset2 = offset + 1
					while (
						!(
							buffer[offset2] <= 127
							&& buffer[offset2+1] > 127
						)
						&& offset2 < 1000
					) {offset2++};
					phaseLength = offset2 - offset;
					if (phaseLength < phase) {
						phase = phase % phaseLength;
					}
				}
				
				for (var i = 0; i < width; i++) {
					var val = buffer[i*scalar + offset + phase];
					val = (val-128) * Math.sin(Math.PI*(i/width)) + 128;
					if (i === 0) {
						context.moveTo(i, val);
					} else {
						context.lineTo(i, val);
					}
				}
				context.stroke();
			}
			animate();
		})();
		ul.appendChild(canvas);
	}
}

//server-screen
//chord-editor
//generate keyboard
// spacings gotten from: http://www.quadibloc.com/other/cnv05.htm
var octaveWidth = 7*35;
var blackPercentHeight = .6;
for (var i = 0; i < 127; i++) {
	var note = i%12;
	var octave = (i - note)/12 - 1; //midi starts at C-1
	
	var element = document.createElement('div');
	element.setAttribute('data-octave', octave);
	element.classList.add("key");
	if (note == 1 || note == 3 || note == 6 || note == 8 || note == 10)
		element.classList.add("black");
	else
		element.classList.add("white");
	element.classList.add("key-" + note);
	element.classList.add("octave-" + octave);
	element.setAttribute("id","note-" + i);
	
	element.onclick = (function() {
		var midiValue = i;
		return function() {
			//on press of piano key
			Keyboard.toggle(midiValue);
		}
	})();
	$("#chord-editor").appendChild(element);
}

var Keyboard = new function() {
	var current = {};
	this.onchange = function() {}
	this.toggle = function(note) {
		if (current[note]) {
			delete current[note];
			$("#note-" + note).classList.remove("active");
		} else {
			current[note] = true;
			$("#note-" + note).classList.add("active");
		}
		this.onchange();
	}
	this.getNotes = function() {
		var notes = [];
		for (var i in current)
			notes.push(i);
		return notes;
	}
	this.setNotes = function(array) {
		for (var i in current)
			$("#note-" + i).classList.remove("active");
		current = {};
		for (var i = 0; i < array.length; i++) {
			current[array[i]] = true;
			$("#note-" + array[i]).classList.add("active");
		}
	}
}();

//chord-list
var chordColors = [
	"F00",
	"F70",
	"FF0",
	"7F0",
	"0F0",
	"0F7",
	"0FF",
	"07F",
	"00F",
	"70F",
	"F0F",
	"F07"
]
for (var i = 0; i < chordColors.length; i++) {
	(function() {
		var color = chordColors[i];
		var notes = [];

		var item = document.createElement('li');
		item.style.backgroundColor = "#" + color;
		
		item.onclick = function(e) {
			e.preventDefault();
			//show chord
			
			Keyboard.onchange = function() {};
			Keyboard.setNotes(notes);
			Keyboard.onchange = function() {
				notes = Keyboard.getNotes();
				updateServerChords();
			}
			
			updateServerChords = function() {
				respond("chord", {
					notes: notes,
					color: color
				});
			}
			updateServerChords();
		}
		$("#chord-list ul").appendChild(item);
	})();
}

var updateServerChords = function() {}

window.onerror = function() {
	$("#connection-error-screen").innerHTML = "";
	$("#connection-error-screen").appendChild(document.createTextNode("Either the server closed, or something VERY unexpected occurred. If this is unexpected, please report this error:\n\n" + JSON.stringify(arguments) + "\n\n"));
	showScreen("connection-error-screen");
}