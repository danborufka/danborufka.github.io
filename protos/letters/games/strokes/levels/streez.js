// strokeGame: "streez"

var SOUNDS = {

	OPEN: 			new Howl({ src: ['audio/door-open.wav'] }),
	ENTER: 			new Howl({ src: ['audio/flop.wav'] }),

	RESET: 			new Howl({ src: ['audio/suck.m4a'] }),
	WRONG: 			new Howl({ src: ['audio/wrong.m4a'], volume: 0.8 }),

	RESULT: 		new Howl({ src: ['audio/letters/kha.m4a'], volume: 1 }),

	DRAG_LOOP: 		new Howl({ src: ['audio/drag-thru-tube.m4a'], volume: 0.1, loop: true }),
};

var HUMAN_SPEED = 2;

var muted = false;
var human;
var sound;

alert('Streez began!');

var streezGame = new strokeGame(project, 
	'streez', 
	{ 
		letter: 			'ja/オ',
		strokeTolerance: 	20,		// how far off the stroke (px) can we move?
		cheatTolerance: 	.2,		// how far are we allowed to jump ahead?
		directionTolerance: 1,		// how far can we move into the wrong direction?
	}, 
	function(scene, container, game) {

		project.view.zoom = 2;

		human = container.getItem({ name: 'human' });

		Danimator.play(human, { 
			fps: 6 * HUMAN_SPEED, 
			onDone: 'pingpong'
		});

		var cars 	= container.getItem({ name: 'cars' });
		var car 	= cars.firstChild;
		var moPath 	= container.getItem({ name: 'carPath1' });

		car.attachToPath(moPath);
		cars.children[1].attachToPath( container.getItem({ name: 'carPath3' }) );
		cars.children[2].attachToPath( container.getItem({ name: 'carPath2' }) );

		Danimator(car, 'offsetOnPath', 0, 1, 10);
		Danimator(cars.children[1], 'offsetOnPath', 0, 1, 10, { delay: 1 });
		Danimator(cars.children[2], 'offsetOnPath', 0, 1, 10, { delay: 2 });
  
		game.onStrokeStart = function(data, stroke) {
			switch(stroke) {
				case 0:
					
					break;
				case 1:
					
			    	break;
			}
	    	//scene.UI.children.explainer.visible = false;
		};

		game.onStroke = function(data, offset, wrongDirection, cheating, delta) {

			// fade out sound if movement stopped
			if(offset > .07 && delta < 0.1) {
				navigator && navigator.vibrate(300);
				if(!muted)
					setTimeout(function() {
						SOUNDS.DRAG_LOOP.fade(.1, 0, 200, sound);
					}, 300);
			}

			if(!wrongDirection && !cheating)
			{
				// …
			}
			else {
				SOUNDS.DRAG_LOOP.stop(sound);
				SOUNDS.WRONG.play();
				// show menacing X if user cheated or went into wrong direction
				if(false)
				scene.UI.children.no.set({
					position: data.point,
					visible: true
				});
			}
		};

		game.onStrokeStop = function(data, offset, stroke, strokes) {
			switch(stroke) {
				case 0:
					break;

				case 1:
					SOUNDS.DRAG_LOOP.stop(sound);
					if(false)
					scene.UI.children.no.visible = false;
			}
		};

		game.onGameEnd = function(data) {
			setTimeout(function(){ SOUNDS.RESULT.play(); }, 500);
			setTimeout(function(){ location.reload(); }, 2500);
		}
	}
);

onFrame = function() {
	if(human)
		human.position += [-.03 * HUMAN_SPEED, .03 * HUMAN_SPEED];
}

onResize = streezGame.resize;