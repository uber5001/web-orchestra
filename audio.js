window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
try {
	context = new AudioContext();
} catch (e) {
	document.write("Your browser does not support the Web Audio API");
}
var comp = context.createDynamicsCompressor();
comp.connect(context.destination);

function NotePlayer(val, vel) {
	if (vel === undefined || vel === null) {
		vel = 1;
	}
	this.analyser = context.createAnalyser();
	this.analyser.connect(comp);
	this.play = function() {
		var osc = context.createOscillator();
		osc.frequency.value = 440*Math.pow(2, (val-69)/12);
		osc.type = "triangle";
		var gain = context.createGain();

		gain.gain.setValueAtTime(vel, context.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime+1);
		gain.gain.setValueAtTime(0, context.currentTime+1.01);

		osc.connect(gain);
		gain.connect(this.analyser);

		osc.start(context.currentTime);

		setTimeout(function() {
			osc.disconnect();
			gain.disconnect();
			osc.stop(0);
		}, 10000);
	}
}

function playNote(val, vel) {
	if (vel === undefined || vel === null) {
		vel = 1;
	}
	var osc = context.createOscillator();
	osc.frequency.value = 440*Math.pow(2, (val-69)/12);
	osc.type = "triangle";
	var gain = context.createGain();

	gain.gain.setValueAtTime(vel, context.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime+1);
	gain.gain.setValueAtTime(0, context.currentTime+1.01);

	osc.connect(gain);
	gain.connect(comp);

	osc.start(context.currentTime);

	setTimeout(function() {
		osc.disconnect();
		gain.disconnect();
		osc.stop(0);
	}, 10000);
}

function iOSFix() {
	playNote(0, 0.01);
	document.body.removeEventListener("click", iOSFix);
}

document.body.addEventListener("click", iOSFix);