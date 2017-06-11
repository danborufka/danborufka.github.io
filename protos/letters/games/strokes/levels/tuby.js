// strokeGame: "tuby"
// ###TODO: fix

var tubeSound;

var button;
var door;
var hamster;
var eye;
var body;
var bodyLength = 0;
var fadeTimeout;

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

		var hamster_front = scene.find('hamster_front')[0].item;

		button 	= scene.find('button-top')[0].item;

		door 	= scene.find('door_1_')[0].item;			// clipping items have automatic renaming, thus door_1_ instead of "door"
		hamster = scene.find('hamster')[0].item;
		body 	= scene.find('hamsterbody')[0].item;
		eye  	= scene.find('eye')[0].item;

		bodyLength = body.length;

		// animate hamster popping into tube
		hamster_front.opacity = 0;
		hamster.opacity = 0;
		hamster_front.rotation = scene.strokes.item.lastChild.getNormalAt(0).angle-270;

		//Danimator.load('games/strokes/levels/tuby');

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
					button.position.y += 2;
					button.opacity = .8;

					Danimator.sound('buttons/down');
					break;
				case 1:
					// init hamster-dragging sound:
		    		tubeSound = Danimator.sound('drag-thru-tube', { volume: 0.2, loop: true, fadeIn: 600 });
			    	break;
			}
	    	scene.UI.explainer.item.visible = false;
		};

		game.onStroke = function onStroke(data, offset, wrongDirection, cheating, delta) {

			hamster.visible = true;

			clearTimeout(fadeTimeout);
			
			fadeTimeout = setTimeout(function() {
				tubeSound.fadeOut(200);
			}, 300);

			// fade out sound if movement stopped
			if(offset <= .07 || Math.abs(delta) >= 0.01) {
				clearTimeout(fadeTimeout);
				tubeSound.set('volume', .2);
			}

			if(wrongDirection && cheating) {
				tubeSound.stop();
				Danimator.sound('wrong');
				// show menacing X if user cheated or went into wrong direction
				scene.UI.no.item.set({
					position: data.point,
					visible: true
				});
			} else {
				_changeState(data.location.offset, game);
			}
		};

		game.onStrokeStop = function onStrokeStop(data, offset, stroke, strokes) {
			switch(stroke) {
				case 0:
					// button animation
					Danimator.stopAll(button);
					button.position.y -= 2;
					button.opacity = 1;
					Danimator(container.getItem({ name: 'open-button' }), 'opacity', 1, .6, 1);

					Danimator.sound('buttons/up');

					hamster.position = hamster_front.position = door.position + [0, 0];
					game.locked = true;

					// animate opening door
					Danimator(door, 'bounds.height', null, 0.1, 1, { 
						delay: .2,
						onDone: function() {

							// 1. frame animation of hamster entering door
							setTimeout(function() { 
								Danimator.sound('flop.wav');

								hamster_front.opacity = 1; 
								hamster_front.visible = true; 

								Danimator.play(hamster_front, { 
									onDone: function() {
										setTimeout(function(){ hamster_front.visible = false; }, 500);
									}
								});
								Danimator.fadeIn(hamster, .05, { delay: .2 });

							}, 800);

							hamster.data._strokePosition = 0;

							// 2. animate hamster entering along stroke
							Danimator(hamster, 'data._strokePosition', 0, 6, .1 , {
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

							scene.UI.explainer.item.opacity = 0;
							scene.UI.explainer.item.visible = true;
							Danimator.fadeIn(scene.UI.explainer.item, .4, { delay: 1 });
						} 
					});
					Danimator.sound('door-open.wav');
					break;

				case 1:
					tubeSound.stop();
					scene.UI.no.item.visible = false;

					// if we haven't reached the end of the stroke
					if(offset < game.options.completionTolerance) {
						hamster.data._strokePosition = offset * strokes[stroke].item.length;
						// retract the hamster back to his original position

						Danimator(hamster, 'data._strokePosition', null, 6, .6, {
							easing: 'linear',
							onStep: function(step) {
								_changeState(step, game);
								return step;
							}
						});
						Danimator.sound('suck');
					}
			}
		};


		var steps = [ 	container.getItem({ name: 'open-button' }), 
						container.getItem({ name: 'pipes_and_stuff' })
					];

		game.onReset = function onReset(step) {
			Danimator(steps[step], 'opacity', .8, 1, 1);
		}

		game.onGameEnd = function onGameEnd(data) {
			// hide hamster's features
			hamster.getItem({ name: 'face-0' }).visible = false;
			hamster.getItem({ name: 'bobble-1' }).visible = false;
			hamster.getItem({ name: 'legs-1' }).visible = false;

			// move hamster into hole!
			Danimator(body, 'lastSegment.point.x', null, body.firstSegment.point.x - 1, .1);
			Danimator(body, 'lastSegment.point.y', null, body.firstSegment.point.y - 1, .1);
			Danimator.fadeOut(hamster, .2, { delay: .2 });
			Danimator.sound('flop.wav');

			setTimeout(function(){ Danimator.sound('letters/kha'); }, 500);
			setTimeout(function(){ location.reload(); }, 2500);
		}
	}
);

onFrame = function(event) {
	eye && (eye.visible = !(event.count % 90 < 10));
}
onResize = tubyGame.resize;