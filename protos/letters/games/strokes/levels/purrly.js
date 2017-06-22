// strokeGame: "purrly"

var STATE_RANGE = 3;

var lastStateOffset = -1;

var purringSound;
var eyes;
var frown;
var mouth;

/* helper to switch out "caressed" fur */
function _changeState(offset, game) {
	var states = game.scene.fur.ordered;
	var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
	var stateOffset = states.length - (offset * states.length);

	for(var i=range[0]; i <=range[1]; i++) {
		if(_.inRange(parseInt(stateOffset) + i, 0, states.length-1)) {
			var current = parseInt(stateOffset) + i;
			
			if(states[current].item.data.aniTimeout) {
				clearTimeout(states[current].item.data.aniTimeout);
			}

			states[current].item.definition = game.scene.symbols['fur-caressed'];

			states[current].item.data.aniTimeout = setTimeout(function(){
				states[current].item.definition = game.scene.symbols['fur-flat'];
			}, 300);

			// reset the old ones
			if(lastStateOffset >= 0) {
				var last = parseInt(lastStateOffset) + i;
				setTimeout(function(){
					states[last].item.definition = game.scene.symbols['fur-flat'];
				}, 200);
			}
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

		eyes  = scene.purrly.face.eyes.item;
		frown = scene.purrly.face.frown.item;
		mouth = scene.purrly.face.mouth_open.item;

		var UI 			= scene.UI.explainer;
		var path 		= UI.explainerStroke.item;
		var start 		= UI.start.item;
		var end 		= UI.end.item;
		var label 		= UI.label.item;
		var endColor 	= end && (end.fillColor.hue + 0);

		end.visible = false;
		path.growth = 0;

		/* animate short explainer */
		Danimator.fadeIn(UI.item, 	.3, { from: 0, delay: 1.5 });
		Danimator.fadeIn(end, 		.3, { from: 0, delay: 2.5 });

		Danimator(path, 'growth', 0, 1, 3, {
			onStep: 	function(step) {
							end.position = path.getPointAt(step * path.length);
							return step;
						},
			delay: 		2.5
		})
		.then('fadeOut', UI.item, 1, { 
			delay: 		1.5
		});

		Danimator(path, 'strokeColor.hue', null, endColor, 2, {
			delay: 		2.5,
			onStep: 	function(step) { 
							end.fillColor = path.strokeColor;
							return step; 
						}
		});

		Danimator.fadeOut(start, .6, {
			onStep: 	function(step) {
							//label.opacity = step;
							return step;
						},
			delay: 		3
		});

		/* show progress color onMouseDrag */
		container.onMouseDown = function onContainerMousedown(event) {
			if(_.has(scene.UI, 'status')) {
				scene.UI.status.item.fillColor.hue = start.fillColor.hue;
				Danimator.fadeIn(scene.UI.status.item, .3, { from: 0 });
			}
			Danimator.stopAll(UI.item);
	    	Danimator.fadeOut(UI.item, .3);
		}
		container.onMouseUp = function onContainerMouseUp() {
			if(_.has(scene.UI, 'status')) {
				Danimator.stopAll(scene.UI.status.item);
				Danimator.fadeOut(scene.UI.status.item, .3);
			}
		}

		game.onStrokeStart = function onStrokeStart(data) {
			// init sound:
    		purringSound = Danimator.sound('letters/rolling-r', { volume: 0.2, loop: true, fadeIn: 600 });
	    	scene.UI.explainer.item.visible = false;
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

			scene.UI.status.item.fillColor.hue = start.fillColor.hue + (end.fillColor.hue - start.fillColor.hue) * offset;
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
onResize = purrlyGame.onResize;