window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var comp = context.createDynamicsCompressor();
comp.connect(context.destination);


function playNote(val, vel) {
	if (vel === undefined || vel === null) {
		vel = 1;
	}
	var osc = context.createOscillator();
	osc.frequency.value = 440*Math.pow(2, (val-69)/12);
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

function iOSFix(target) {
	playNote(0, 0.01);
	document.body.removeChild(target);
}