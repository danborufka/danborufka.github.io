//jQuery(document).ready(function($) {

	// TODO: multistroke support
	// TODO: make fur agnostic
	// TODO: dot support (arabic strokes e.g.)
	// TODO: config file support w/ separate sound file

	var SOUNDS = {
		PURR: new Howl({ src: ['audio/purr.m4a'], vol: .2 })
	};

	var GOAL = 1;
	var TOLERANCE  	  	= 20;
	var STATE_RANGE   	= 3;

	var symbols 	  	= {};
	var animatables   	= [];
	var muted 		  	= false;

	var lastOffset 	  	= 0;
	var direction 	  	= 0;
	var steps 		  	= 1;
	var dragging 	  	= false;
	var lastStateOffset = -1;

	var container;
	var scene;
	var path;
	var sound;

	var win;
	var winTimeout;
	var eyes;

	function _limit(nr, mi, ma) {
		if(mi > ma) {
			mi = mi ^ ma;
			ma = mi ^ ma;
			mi = mi ^ ma;
		}
		return Math.max(Math.min(nr, ma), mi);
	}

	function _reset() {
		scene.A.onMouseMove({ point: scene.A.position });
		dragging = false;
		lastOffset = 0;
		scene.A.position = path.segments[0].point;
	}

	function _blink(closed) {
		eyes.visible = closed ? 0 : 100;
	}

	function _changeState(ratio) {
		var states = scene.fur.children;
		var range  = [parseInt(-STATE_RANGE/2), parseInt(STATE_RANGE/2)];
		var stateOffset = states.length - (ratio * states.length);
		
		for(var i=range[0]; i <=range[1]; i++) {
			var current = _limit(parseInt(stateOffset) + i, 0, states.length-1);
			
			if(states[current].data.aniTimeout) {
				clearTimeout(states[current].data.aniTimeout);
			}

			states[current].definition = project.symbolDefinitions[1];

			states[current].data.aniTimeout = setTimeout(function(){
				states[current].definition = project.symbolDefinitions[0];
			}, 300);

			
			// reset the old ones
			if(lastStateOffset >= 0) {
				var last = _limit(parseInt(lastStateOffset) + i, 0, states.length-1);
				setTimeout(function(){
					states[last].definition = project.symbolDefinitions[0];
				}, 200);
			}
		}
		lastStateOffset = stateOffset;
	}

	Item.prototype.animate = function(property, fr, to, duration, done, delay) {
		var item = this;
		setTimeout(function(){
			animatables.push({
			item: 		item,
			property: 	property,
			duration: 	duration || 1,
			from: 		fr,
			to: 		to,
			delay: 		delay,
			done: 		done
			});
		}, (delay || 0) * 1000);
	}

	onResize = function(event) {
		if(scene) {
			container.position = event.size/2;
		}
	}

	onFrame = function(event) {
		if(scene) {
			if(dragging) {
				_blink(true);
			} else {
				_blink(event.count % 90 < 10);
			}

			_.each(animatables, function(animatable, index){
				var item = animatable.item;
				var ascending = animatable.to > animatable.from;
				var value = item[animatable.property];
				var isDone = ascending ? 
								value >= animatable.to : 
								value <= animatable.to;

				if(isDone) {
					animatables = _.without(animatables, animatable);
					value = animatable.to;
					animatable.value = value;
					if(animatable.done) { 
						if(animatable.done === 'reverse') {
							item.animate(animatable.property, animatable.to, animatable.from, animatable.duration, null, animatable.delay || 0);
						} else animatable.done(animatable);
					};
				} else {
					value += (animatable.to - animatable.from) * event.delta;
					value = _limit(value, animatable.from, animatable.to);
				}
				item[animatable.property] = value;
			});
		}
	}

	project.importSVG('svg/purrly.svg', function (item) {

		container 		= item;
		scene 			= container.children;
		path 			= scene.strokes.children[scene.strokes.children.length-1];
		eyes 			= item.getItem({ name: 'eyes' });

		scene.UI.visible = false;

		// let's get closer!
		view.zoom = 1.5;

		// remove all clippingMasks
		project.getItem({ clipMask: true }).remove();

		var soundTimeout = 0;

		_.each(project.symbolDefinitions, function(definition){
			if(definition.item.name)
				symbols[definition.item.name] = definition.item;
		});
		/*
		scene.A.onMouseEnter = function() {		this.opacity = 0.4;		}
		scene.A.onMouseLeave = function() { 	this.opacity = 0.1;		}
		*/
		scene.A.onMouseDown = function() {
	    	dragging = true;

	    	if(!muted) {
				// init sound:
	    		sound = SOUNDS.PURR.play();
	    		SOUNDS.PURR.stop(sound);
	    	}
		}
		scene.A.onMouseMove = function(data) {
			if(dragging) {
				var hits = project.hitTest(data.point, { 
					class: 		Path,
					fill: 		false,
					stroke: 	true,
					segments: 	true,
					tolerance: 	TOLERANCE
				});

				if(hits && hits.item == path) {
					var location  = path.getNearestLocation(data.point);
					var newOffset = location.offset / path.length;

					direction = lastOffset - newOffset;

					// kill last sound playback
					clearTimeout(soundTimeout);

					if(!muted)
						if(newOffset > .07) {
							soundTimeout = setTimeout(function(){
								SOUNDS.PURR.stop(sound);
							}, 800);

							// playback sound from current position (path acts as "scrubber")
							var duration = SOUNDS.PURR.duration();
							SOUNDS.PURR.seek(duration * newOffset, sound).play(sound);
						}

					// if jump is too big ("cheating") or if user moved against the path's direction
					if(Math.abs(lastOffset - newOffset) >= 0.2 || direction >= 0.008) {
						dragging = false;
						_reset();
					} else {
						scene.A.position = location.point;

						var test = scene.fur.hitTestAll(data.point, {
							className: 	Path,
							fill: 		true,
							stroke: 	true,
							segments: 	false,
							tolerance: 	TOLERANCE
						});

						_changeState(newOffset);
						path.data.newOffset = lastOffset = newOffset;
					}
				} else _reset();
			}
		}
		scene.A.onMouseUp = function(data) {
			var newOffset = path.data.newOffset;
			if(newOffset === 1) {
				// all strokes done
				if(steps === GOAL) {
					//alert('Yeah! you rock.');
					SOUNDS.PURR.stop(sound);
					setTimeout(function() { SOUNDS.PURR.play(); }, 800);

					scene.UI.visible = true;
					scene.UI.children.phonetics.opacity = 0;
					scene.UI.children.phonetics.animate('opacity', 0,1, .3, 'reverse', 1);
				} else {
					clearTimeout(winTimeout);
					winTimeout = setTimeout(function(){
						steps++;
					}, 100);
				}
			}
			_reset();
		};
		onResize({size: view.viewSize});
		_reset();
	});

//});