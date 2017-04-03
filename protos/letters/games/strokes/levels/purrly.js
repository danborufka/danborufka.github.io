// strokeGame: "purrly"

var QUERY = {};
var SOUNDS = {
	HISS: 		new Howl({ src: ['audio/hiss.m4a']}),
	PURR: 		new Howl({ src: ['audio/purr.m4a'], volume: 1 }),
	PURR_LOOP: 	new Howl({ src: ['audio/purr.m4a'], volume: 0.2, loop: true })
};
var STATE_RANGE = 3;

var muted = false;
var lastStateOffset = -1;

var sound;
var eyes;
var frown;
var mouth;

location.search.slice(1).split('&').forEach(function(param){
	param = param.split('=');
	QUERY[param[0]] = param[1];
});

function _changeState(offset, game) {
	var states = game.scene.fur.children;
	var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
	var stateOffset = states.length - (offset * states.length);
	
	console.log('game.symbols', game.symbols);

	for(var i=range[0]; i <=range[1]; i++) {
		var current = limit(parseInt(stateOffset) + i, 0, states.length-1);
		
		if(states[current].data.aniTimeout) {
			clearTimeout(states[current].data.aniTimeout);
		}
		states[current].definition = game.symbols['fur-caressed'];

		states[current].data.aniTimeout = setTimeout(function(){
			states[current].definition = game.symbols['fur-flat'];
		}, 300);

		// reset the old ones
		if(lastStateOffset >= 0) {
			var last = limit(parseInt(lastStateOffset) + i, 0, states.length-1);
			setTimeout(function(){
				states[last].definition = game.symbols['fur-flat'];
			}, 200);
		}
	}
	lastStateOffset = stateOffset;
}

var purrlyGame = new strokeGame(project, 
	'purrly', 
	{ 
		letter: 	QUERY.letter || 'ru/р',
		tolerance: 	20
	}, 
	function(scene, container, game) {
		eyes  = container.getItem({ name: 'eyes' });
		frown = container.getItem({ name: 'frown' });
		mouth = container.getItem({ name: 'mouth.open' });

		game.onStrokeStart = function(data) {
			if(!muted) {
				// init sound:
	    		sound = SOUNDS.PURR_LOOP.play();
	    		SOUNDS.PURR_LOOP.fade(0, .2, 600, sound);
	    	}
		};

		game.onStroke = function(data, offset, wrongDirection, cheating, delta) {

			SOUNDS.PURR_LOOP.volume(Math.max(offset, .2) * .6);

			if(!muted)
				if(offset > .07 && delta < 0.1) {
					navigator && navigator.vibrate(300);
					setTimeout(function() {
						SOUNDS.PURR_LOOP.fade(.6, 0, 600, sound);
					}, 300);
				}

			if(wrongDirection || cheating) {
				frown.visible = mouth.visible = true;
				SOUNDS.HISS.play();

				setTimeout(function(){
					frown.visible = mouth.visible = false;
				}, 1000);
			} else _changeState(offset, game);
		};

		game.onStrokeEnd = function(data) {
			SOUNDS.PURR_LOOP.stop(sound);
		};

		game.onGameEnd = function(data) {
			mouth.visible = true;
			setTimeout(function() { SOUNDS.PURR.play();    }, 800);
			setTimeout(function() { mouth.visible = false; }, 2200)
		}
	}
);

onFrame = function(event) {
	if(eyes)
		if(purrlyGame.dragging) {
			eyes.visible = false;
		} else {
			eyes.visible = !(event.count % 90 < 10);
		}
	animate.frame(event);
}
onResize = purrlyGame.resize;