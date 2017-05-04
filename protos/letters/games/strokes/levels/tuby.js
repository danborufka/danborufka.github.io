// strokeGame: "tuby"

var SOUNDS = {
	BUTTON_DOWN: 	new Howl({ src: ['audio/buttons/down.m4a'] }),
	BUTTON_UP: 		new Howl({ src: ['audio/buttons/up.m4a'] }),

	OPEN: 			new Howl({ src: ['audio/door-open.wav'] }),
	ENTER: 			new Howl({ src: ['audio/flop.wav'] }),

	RESET: 			new Howl({ src: ['audio/suck.m4a'] }),
	WRONG: 			new Howl({ src: ['audio/wrong.m4a'], volume: 0.8 }),

	RESULT: 		new Howl({ src: ['audio/letters/kha.m4a'], volume: 1 }),

	DRAG_LOOP: 		new Howl({ src: ['audio/drag-thru-tube.m4a'], volume: 0.1, loop: true }),
};

var muted = false;

var sound;

var button;
var door;
var hamster;
var eye;
var body;
var bodyLength = 0;

// helper to bend hamster into form and keep features in place
function _changeState(offset, game) {
	var bodyOffset = bodyLength/2;
	var offsetA = Math.max(offset - bodyOffset, 0);						// beginning of hamster relative to stroke len
	var offsetB = Math.min(offset + bodyOffset, game.stroke.length);	// ending of hamster relative to stroke len

	// copy tangents over to hamster body
	body.firstSegment.point 	= game.stroke.getPointAt(offsetB);
	body.firstSegment.handleIn 	= game.stroke.getTangentAt(offsetA) * -10;
	body.firstSegment.handleOut = game.stroke.getTangentAt(offsetA) * 10;

	body.lastSegment.point  	= game.stroke.getPointAt(offsetA);
	body.lastSegment.handleIn 	= game.stroke.getTangentAt(offsetB) * -10;
	body.lastSegment.handleOut 	= game.stroke.getTangentAt(offsetB) * 10;

	_.each(hamster.children, function(child) {
		// use suffix of layer name to determine which segment to attach it to
		var segmentId = child.name.match(/\-(\d+)$/);
		if(segmentId && (segmentId = segmentId[1])) {
			var segment = body.segments[segmentId].point;
			// reposition layer and rotate according to segment's normal
			child.position = segment + child.data._bodyDistance;
			child.rotation = game.stroke.getNormalAt([offsetA, offsetB][segmentId]).angle-90;
		}
	});
}

var tubyGame = new strokeGame(project, 
	'tuby', 
	{ 
		letter: 			'ar/kha',
		strokeTolerance: 	20,		// how far off the stroke (px) can we move?
		cheatTolerance: 	.2,		// how far are we allowed to jump ahead?
		directionTolerance: 1,		// how far can we move into the wrong direction?
	}, 
	function onGameStart(scene, container, game) {


		var hamster_front = container.getItem({ name: 'hamster.front' });

		button 	= container.getItem({ name: 'button-top' });
		door 	= container.getItem({ name: 'door_1_' });		// clipping items have automatic renaming
		hamster = container.getItem({ name: 'hamster' });
		body 	= container.getItem({ name: 'hamsterbody'});
		eye  	= container.getItem({ name: 'eye' });

		bodyLength = body.length;
		button.data._y = button.position.y;

		// animate hamster popping into tube
		hamster_front.opacity = 0;
		hamster.opacity = 0;
		hamster_front.rotation = scene.strokes.lastChild.getNormalAt(0).angle-270;

		//animate.load('games/strokes/levels/tuby');

		// readjust pivot point of hamster parts and save distance to its parent (bodySegment)
		_.each(hamster.children, function(child) {
			var segmentId = child.name.match(/\-(\d+)$/);
			if(segmentId && (segmentId = segmentId[1])) {
				var segment = body.segments[segmentId].point;
				child.pivot = segment;
				child.data._bodyDistance = child.position - segment;
			}
		});

		game.onStrokeStart = function onStrokeStart(data, stroke) {
			switch(stroke) {
				case 0:
					// push button animation
					button.position.y = button.data._y + 2;
					button.opacity = .8;

					game.playSound('buttons/down');
					break;
				case 1:
					if(!muted) {
						// init hamster-dragging sound:
			    		sound = SOUNDS.DRAG_LOOP.play();
			    		SOUNDS.DRAG_LOOP.fade(0, .2, 600, sound);
			    	}
			    	break;
			}
	    	scene.UI.children.explainer.visible = false;
		};

		game.onStroke = function onStroke(data, offset, wrongDirection, cheating, delta) {

			hamster.visible = true;

			// fade out sound if movement stopped
			if(offset > .07 && delta < 0.1) {
				navigator && navigator.vibrate(300);
				if(!muted)
					setTimeout(function() {
						SOUNDS.DRAG_LOOP.fade(.1, 0, 200, sound);
					}, 300);
			}

			if(!wrongDirection && !cheating)
				_changeState(data.location.offset, game);
			else {
				SOUNDS.DRAG_LOOP.stop(sound);
				game.playSound('wrong');
				// show menacing X if user cheated or went into wrong direction
				scene.UI.children.no.set({
					position: data.point,
					visible: true
				});
			}
		};

		game.onStrokeStop = function onStrokeStop(data, offset, stroke, strokes) {
			switch(stroke) {
				case 0:
					// button animation
					animate.stopAll(button);
					button.position.y = button.data._y;
					button.opacity = 1;
					animate(container.getItem({ name: 'open-button' }), 'opacity', 1, .6, 1);

					game.playSound('buttons/up');

					hamster.position = hamster_front.position = door.position + [0, 0];
					game.locked = true;

					// animate opening door
					animate(door, 'bounds.height', null, 0.1, 1, { 
						delay: .2,
						onDone: function() {

							// 1. frame animation of hamster entering door
							setTimeout(function() { 
								game.playSound('flop.wav');

								hamster_front.opacity = 1; 
								hamster_front.visible = true; 

								animate.play(hamster_front, { 
									onDone: function() {
										setTimeout(function(){ hamster_front.visible = false; }, 500);
									}
								});
								animate.fadeIn(hamster, .05, { delay: .2 });

							}, 800);

							hamster.data._strokePosition = 0;

							// 2. animate hamster entering along stroke
							animate(hamster, 'data._strokePosition', 0, 6, .1 , {
								delay: 1,
								onStep: function(step) {
									_changeState(step, game);
									if(!hamster.visible) hamster.visible = true;
									return step;
								}
							});

							setTimeout(function() {
								game.locked = false;
							}, 1100);

							scene.UI.children.explainer.opacity = 0;
							scene.UI.children.explainer.visible = true;
							animate.fadeIn(scene.UI.children.explainer, .4, { delay: 1 });
						} 
					});
					game.playSound('door-open.wav');
					break;

				case 1:
					SOUNDS.DRAG_LOOP.stop(sound);
					scene.UI.children.no.visible = false;

					// if we haven't reached the end of the stroke
					if(offset < game.options.completionTolerance) {
						hamster.data._strokePosition = offset * strokes[stroke].length;
						// retract the hamster back to his original position
						animate(hamster, 'data._strokePosition', null, 6, .6, {
							easing: 'linear',
							onStep: function(step) {
								_changeState(step, game);
								return step;
							}
						});
						game.playSound('suck');
					}
			}
		};


		var steps = [ 	container.getItem({ name: 'open-button' }), 
						container.getItem({ name: 'pipes_and_stuff' })
					];

		game.onReset = function onReset(step) {
			animate(steps[step], 'opacity', null, 1, 1);
		}

		game.onGameEnd = function onGameEnd(data) {
			// hide hamster's features
			hamster.getItem({ name: 'face-0' }).visible = false;
			hamster.getItem({ name: 'bobble-1' }).visible = false;
			hamster.getItem({ name: 'legs-1' }).visible = false;

			// move hamster into hole!
			animate(body, 'lastSegment.point.x', null, body.firstSegment.point.x - 1, .1);
			animate(body, 'lastSegment.point.y', null, body.firstSegment.point.y - 1, .1);
			animate.fadeOut(hamster, .2, { delay: .2 });
			game.playSound('flop.wav');

			setTimeout(function(){ game.playSound('letters/kha'); }, 500);
			setTimeout(function(){ location.reload(); }, 2500);
		}
	}
);

onFrame = function(event) {
	eye && (eye.visible = !(event.count % 90 < 10));
}
onResize = tubyGame.resize;