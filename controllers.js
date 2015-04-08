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
// spacings gotten from: http://www.quadibloc.com/other/cnv05.htm
var octaveWidth = 7*35;
var blackPercentHeight = .6;
for (var i = 0; i < 127; i++) {
	var note = i%12;
	var octave = (i - note)/12 - 1; //midi starts at C-1
	
	var element = document.createElement('div');
	element.setAttribute('data-octave', octave);
	element.classList.add("key-" + note);
	element.classList.add("octave-" + octave);
	
	element.onclick = (function() {
		var midiValue = i;
		return function() {
			alert('Not yet implemented! DEBUG: ' + midiValue);
		}
	})();
	$("#chord-editor").appendChild(element);
}
