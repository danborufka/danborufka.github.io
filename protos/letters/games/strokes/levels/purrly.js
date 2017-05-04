// strokeGame: "purrly"

var SOUNDS = {
	HISS: 		new Howl({ src: ['audio/hiss.m4a']}),
	PURR: 		new Howl({ src: ['audio/letters/rolling-r.m4a'], volume: 1 }),
	PURR_LOOP: 	new Howl({ src: ['audio/letters/rolling-r.m4a'], volume: 0.2, loop: true })
};
var STATE_RANGE = 3;

var muted = false;
var lastStateOffset = -1;

var sound;
var eyes;
var frown;
var mouth;

function _changeState(offset, game) {
	var states = game.scene.fur.children;
	var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
	var stateOffset = states.length - (offset * states.length);

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
		letter: 			'ru/р',
		strokeTolerance: 	20,
		cheatTolerance: 	.4
	}, 
	function onGameStart(scene, container, game) {
		eyes  = container.getItem({ name: 'eyes' });
		frown = container.getItem({ name: 'frown' });
		mouth = container.getItem({ name: 'mouth.open' });

		var path 		= scene.UI.getItem({ name: 'explainerStroke' });
		var start 		= scene.UI.getItem({ name: 'start' 	});
		var end 		= scene.UI.getItem({ name: 'end' 	});
		var label 		= scene.UI.getItem({ name: 'label' 	});
		var endColor 	= end && (end.fillColor.hue + 0);

		end.visible = false;
		path.growth = 0;

		animate.fadeIn(scene.UI.children.explainer, .3, { from: 0, delay: 1.5 });
		animate.fadeIn(end, .3, { from: 0, delay: 2.5 });

		animate(path, 'growth', 0, 1, 3, {
			onStep: 	function(step) {
							end.position = path.getPointAt(step * path.length);
							return step;
						},
			delay: 		2.5
		})
		.then(path, 'strokeColor.hue', null, endColor, 2, {
			onStep: 	function(step) { 
							end.fillColor = path.strokeColor;
							return step; 
						}
		})
		.thenFadeOut(start, .6, {
			onStep: 	function(step) {
							label.opacity = step;
							return step;
						},
			delay: 		.5
		})
		.thenFadeOut(scene.UI.children.explainer, 1, { 
			delay: 		1.5
		});

		container.onMouseDown = function onContainerMousedown(event) {
			if(_.has(scene.UI.children, 'status')) {
				scene.UI.children.status.fillColor.hue = start.fillColor.hue;
				animate.fadeIn(scene.UI.children.status, .3, { from: 0 });
			}
			animate.stopAll(scene.UI.children.explainer);
	    	animate.fadeOut(scene.UI.children.explainer, .3);
		}
		container.onMouseUp = function onContainerMouseUp() {
			if(_.has(scene.UI.children, 'status')) {
				animate.stopAll(scene.UI.children.status);
				animate.fadeOut(scene.UI.children.status, .3);
			}
		}

		game.onStrokeStart = function onStrokeStart(data) {
			if(!muted) {
				// init sound:
	    		sound = SOUNDS.PURR_LOOP.play();
	    		SOUNDS.PURR_LOOP.fade(0, .2, 600, sound);
	    	}
	    	scene.UI.children.explainer.visible = false;
		};

		game.onStroke = function onStroke(data, offset, wrongDirection, cheating, delta) {

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
				if(!muted) game.playSound('hiss.m4a');

				setTimeout(function(){
					frown.visible = mouth.visible = false;
				}, 1000);
			} else _changeState(offset, game);

			scene.UI.children.status.fillColor.hue = start.fillColor.hue + (end.fillColor.hue - start.fillColor.hue) * offset;
		};

		game.onStrokeStop = function(data) {
			SOUNDS.PURR_LOOP.stop(sound);
		};

		game.onGameEnd = function(data) {
			mouth.visible = true;
			setTimeout(function() { if(!muted) SOUNDS.PURR.play();    }, 800);
			setTimeout(function() { mouth.visible = false; 			  }, 2200);
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
}
onResize = purrlyGame.resize;