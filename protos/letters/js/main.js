//jQuery(document).ready(function($) {

	// TODO: make fur/eye/mouth/etc agnostic
	// TODO: config file support w/ separate sound file
	// TODO: perfect centering for xs devices

	var SOUNDS = {
		HISS: 		new Howl({ src: ['audio/hiss.m4a']}),
		PURR: 		new Howl({ src: ['audio/purr.m4a'], volume: 1 }),
		PURR_LOOP: 	new Howl({ src: ['audio/purr.m4a'], volume: 0.2, loop: true })
	};

	var REPETITIONS 	= 1;
	var TOLERANCE  	  	= 20;
	var STATE_RANGE   	= 3;

	var symbols 	  	= {};

	var muted 		  	= false;
	var dragging 	  	= false;

	var lastOffset 	  	= 0;
	var direction 	  	= 0;
	var step 		  	= 1;
	var currentStroke 	= 0;
	var lastStateOffset = -1;
	var currentScene;

	var strokes;
	var stroke;
	var sound;

	var win;
	var winTimeout;
	var eyes;

	function _reset(scene) {
		dragging = false;
		lastOffset = 0;
		scene.control.position = strokes[currentStroke].segments[0].point;
		scene.control.onMouseMove({ point: scene.control.position });
	}

	function _changeState(ratio, scene) {
		var states = scene.fur.children;
		var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
		var stateOffset = states.length - (ratio * states.length);
		
		for(var i=range[0]; i <=range[1]; i++) {
			var current = limit(parseInt(stateOffset) + i, 0, states.length-1);
			
			if(states[current].data.aniTimeout) {
				clearTimeout(states[current].data.aniTimeout);
			}

			states[current].definition = project.symbolDefinitions[1];

			states[current].data.aniTimeout = setTimeout(function(){
				states[current].definition = project.symbolDefinitions[0];
			}, 300);

			// reset the old ones
			if(lastStateOffset >= 0) {
				var last = limit(parseInt(lastStateOffset) + i, 0, states.length-1);
				setTimeout(function(){
					states[last].definition = project.symbolDefinitions[0];
				}, 200);
			}
		}
		lastStateOffset = stateOffset;
	}

	onFrame = function(event) {
		if(eyes)
			if(dragging) {
				eyes.visible = false;
			} else {
				eyes.visible = !(event.count % 90 < 10);
			}

		animate.frame(event);
	};

	var strokeGame = new Game(project, 'purrly', function(scene, container) {

		currentScene 	= container; 
		strokes 		= scene.strokes.children;
		stroke 			= strokes[currentStroke];
		eyes 			= container.getItem({ name: 'eyes' });

		onResize({size: view.viewSize});

		container.position = view.center;

		// let's get closer!
		view.zoom = 1.5;

		// remove all clippingMasks
		project.getItem({ clipMask: true }).remove();

		var soundTimeout = 0;

		_.each(project.symbolDefinitions, function(definition) {
			if(definition.item.name)
				symbols[definition.item.name] = definition.item;
		});

		scene.control.onMouseDown = function() {
	    	dragging = true;

	    	container.getItem({ name: 'mouth.open' }).visible = false;

	    	if(stroke.segments.length === 1) {
	    		stroke.data.newOffset = 1;
	    	} else {
	    		stroke.data.newOffset = 0;
	    	}

	    	if(!muted) {
				// init sound:
	    		sound = SOUNDS.PURR_LOOP.play();
	    		SOUNDS.PURR_LOOP.fade(0, .2, 600, sound);
	    	}
		};

		scene.control.onMouseMove = _.throttle(function(data) {
			if(dragging && stroke.segments.length > 1) {

				var hits = project.hitTest(data.point, { 
					class: 		Path,
					fill: 		false,
					stroke: 	true,
					segments: 	true,
					tolerance: 	TOLERANCE
				});

				if(hits && hits.item == stroke) {
					var location  = stroke.getNearestLocation(data.point);
					var newOffset = location.offset / stroke.length;

					direction = lastOffset - newOffset;

					SOUNDS.PURR_LOOP.volume(Math.max(newOffset, .2) * .6);

					if(!muted)
						if(newOffset > .07 && Math.abs(direction) < 0.1) {
							navigator && navigator.vibrate(300);
							setTimeout(function() {
								SOUNDS.PURR_LOOP.fade(.6, 0, 600, sound);
							}, 300);
						}

					var wrongDirection = direction >= 0.008;

					// if jump is too big ("cheating") or if user moved against the path's direction
					if(Math.abs(lastOffset - newOffset) >= 0.4 || wrongDirection) {
						dragging = false;
						_reset(scene);

						if(wrongDirection) {
							container.getItem({ name: 'frown' 		}).visible = true;
							container.getItem({ name: 'mouth.open'  }).visible = true;
							SOUNDS.HISS.play();

							setTimeout(function(){
								container.getItem({ name: 'frown' 	   }).visible = false;
								container.getItem({ name: 'mouth.open' }).visible = false;
							}, 1000);
						}
					} else {
						scene.control.position = location.point;
						_changeState(newOffset, scene);
						stroke.data.newOffset = lastOffset = newOffset;
					}
				} else _reset(scene);
			}
		}, 100);

		scene.control.onMouseUp = function(data) {
			var newOffset = stroke.data.newOffset;

			SOUNDS.PURR_LOOP.stop(sound);

			if(newOffset === 1) {
				if(currentStroke === strokes.length - 1) {
					// all strokes done
					if(step === REPETITIONS) {
						//alert('Yeah! you rock.');
						container.getItem({ name: 'mouth.open' }).visible = true;
						setTimeout(function() { SOUNDS.PURR.play(); }, 800);

						scene.UI.visible = true;
						scene.UI.children.phonetics.opacity = 0;
						animate(scene.UI.children.phonetics, 'opacity', 0,1, .3, 'reverse', 1);

						setTimeout(function(){ container.getItem({ name: 'mouth.open' }).visible = false; }, 2200)
					} else {
						clearTimeout(winTimeout);
						winTimeout = setTimeout(function(){
							step++;
						}, 100);
					}
				}

				currentStroke = ++currentStroke % strokes.length;
				stroke 		  = strokes[currentStroke];
			}
			_reset(scene);
		};

		_reset(scene);
	});

	onResize = function(event) {
		strokeGame.resize(event);
	}

//});