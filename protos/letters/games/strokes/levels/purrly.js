// strokeGame: "purrly"

var STATE_RANGE = 3;

var lastStateOffset = -1;

var purringSound;
var eyes;
var frown;
var mouth;

/* helper to switch out "caressed" fur */
function _changeState(offset, game) {
	var states = game.scene.fur.children;
	var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
	var stateOffset = states.length - (offset * states.length);

	for(var i=range[0]; i <=range[1]; i++) {
		var current = Danimator.limit(parseInt(stateOffset) + i, 0, states.length-1);
		
		if(states[current].data.aniTimeout) {
			clearTimeout(states[current].data.aniTimeout);
		}

		states[current].definition = game.symbols['fur-caressed'];

		states[current].data.aniTimeout = setTimeout(function(){
			states[current].definition = game.symbols['fur-flat'];
		}, 300);

		// reset the old ones
		if(lastStateOffset >= 0) {
			var last = Danimator.limit(parseInt(lastStateOffset) + i, 0, states.length-1);
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

		/* animate short explainer */
		Danimator.fadeIn(scene.UI.children.explainer, .3, { from: 0, delay: 1.5 });
		Danimator.fadeIn(end, .3, { from: 0, delay: 2.5 });

		Danimator(path, 'growth', 0, 1, 3, {
			onStep: 	function(step) {
							end.position = path.getPointAt(step * path.length);
							return step;
						},
			delay: 		2.5
		})
		.then('animate', path, 'strokeColor.hue', null, endColor, 2, {
			onStep: 	function(step) { 
							end.fillColor = path.strokeColor;
							return step; 
						}
		})
		.then('fadeOut', start, .6, {
			onStep: 	function(step) {
							label.opacity = step;
							return step;
						},
			delay: 		.5
		})
		.then('fadeOut', scene.UI.children.explainer, 1, { 
			delay: 		1.5
		});

		/* show progress color onMouseDrag */
		container.onMouseDown = function onContainerMousedown(event) {
			if(_.has(scene.UI.children, 'status')) {
				scene.UI.children.status.fillColor.hue = start.fillColor.hue;
				Danimator.fadeIn(scene.UI.children.status, .3, { from: 0 });
			}
			Danimator.stopAll(scene.UI.children.explainer);
	    	Danimator.fadeOut(scene.UI.children.explainer, .3);
		}
		container.onMouseUp = function onContainerMouseUp() {
			if(_.has(scene.UI.children, 'status')) {
				Danimator.stopAll(scene.UI.children.status);
				Danimator.fadeOut(scene.UI.children.status, .3);
			}
		}

		game.onStrokeStart = function onStrokeStart(data) {
			// init sound:
    		purringSound = Danimator.sound('letters/rolling-r', { volume: 0.2, loop: true, fadeIn: 600 });
	    	scene.UI.children.explainer.visible = false;
		};

		game.onStroke = function onStroke(data, offset, wrongDirection, cheating, delta) {

			purringSound.set('volume', Math.max(offset, .2) * .6);

			if(offset > .07 && delta < 0.1) {
				navigator && navigator.vibrate(300);
				setTimeout(function() {
					purringSound.fadeOut(600);
				}, 300);
			}

			if(wrongDirection || cheating) {
				frown.visible = mouth.visible = true;
				Danimator.sound('hiss.m4a');

				setTimeout(function(){
					frown.visible = mouth.visible = false;
				}, 1000);
			} else _changeState(offset, game);

			scene.UI.children.status.fillColor.hue = start.fillColor.hue + (end.fillColor.hue - start.fillColor.hue) * offset;
		};

		game.onStrokeStop = function(data) {
			purringSound.stop();
		};

		game.onGameEnd = function(data) {
			mouth.visible = true;
			setTimeout(function() { Danimator.sound('letters/rolling-r', { volume: 1 });    }, 800);
			setTimeout(function() { mouth.visible = false; }, 2200);
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