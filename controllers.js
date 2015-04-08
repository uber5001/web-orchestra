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
	respond("host", {
		code: $("#host-code").value
	});
}
$("#host-code-random").onclick = function() {
	alert('not yet implemented!');
}

//join-screen
$("#join-screen .back").onclick = function() {
	showScreen('host-join-screen');
}
$("#join-code-submit").onclick = function() {
	respond("join", {
		code: $("#join-code").value
	});
}

//client-screen


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
		$("#note-" + note).classList.toggle("active");
		if (current[note])
			delete current[note]
		else
			current[note] = true;
		this.onchange();
	}
	this.getNotes = function() {
		var notes = [];
		for (var i in current)
			note.push(i);
		return notes;
	}
	this.setNotes = function(array) {
		for (var i in current)
			$("#note-" + i).classList.toggle("active");
		var current = {};
		for (var i = 0; i < array.length; i++)
			this.toggle(array[i]) = true;
	}
}();

//chord-list
$("#new-chord").onclick = function() {
	var chord = {
		name: "untitled chord",
		notes: []
	}

	var item = document.createElement('li');
	var link = document.createElement('a');
	
	link.innerHTML = chord.name;
	link.setAttribute("href", "");
	link.onclick = function(e) {
		e.preventDefault();
		//show chord
		
	}
	
	item.appendChild(link);
	$("#chord-list ul").appendChild(item);
}


