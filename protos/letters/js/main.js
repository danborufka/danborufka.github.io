//jQuery(document).ready(function($) {

	var SOUNDS = {
		PURR: new Howl({ src: ['audio/purr.m4a'], vol: .2 })
	};

	var GOAL = 1;
	var STYLES = {
		CURSOR: {
			fillColor: 	'black',
			strokeWidth: 0,
		}
	};
	var TOLERANCE  	  = 20;

	var startingColor = new Color({hue: 0, lightness: .5, saturation: 1});
	var startingPoint = new Point();
	var endPoint 	  = new Point();
	var topLeft 	  = new Point(0,0);

	var lastOffset 	= 0;
	var direction 	= 0;
	var steps 		= 1;
	var dragging 	= false;

	var container;
	var scene;
	var path;
	var sound;

	var win;
	var winTimeout;
	var eyes;

	function _reset() {
		dragging = false;
		lastOffset = 0;
		scene.A.position = path.segments[0].point;
		//scene.A.style.fillColor = startingColor;
	}

	function _blink(closed) {
		eyes.opacity = closed ? 0 : 100;
	}

	onResize = function(event) {
		if(scene) {
			container.position = event.size/2;
		}
	}

	onFrame = function(event) {
		if(scene) {
			_blink(event.count % 90 < 10);
		}
	}

	project.importSVG('svg/purrly.svg', function (item) {

		container 		= item;
		scene 			= container.children;
		path 			= scene.strokes.children[0];
		startingPoint 	= path.segments[0].point;
		eyes 			= scene.purrly.children.head.children.eyes;

		//scene.A.bounds.width = TOLERANCE;
		//scene.A.bounds.height = TOLERANCE;
		//scene.A.position = startingPoint;

		container.scale(1.5);

		// remove all clippingMasks
		project.getItem({ clipMask: true }).remove();

		var soundTimeout = 0;
		
		scene.A.onMouseEnter = function() {		this.opacity = 1;		}
		scene.A.onMouseLeave = function() { 	this.opacity = 0.6;		}

		scene.A.onMouseDown = function() {
	    	dragging = true;

	    	// init sound:
	    	sound = SOUNDS.PURR.play();
	    	SOUNDS.PURR.stop(sound);
		}
		scene.A.onMouseMove = function(data) {
			if(dragging) {
				var hits = project.hitTest(data.point, { 
					fill: 		false,
					stroke: 	true,
					segments: 	true,
					tolerance: 	TOLERANCE
				});

				if(hits && hits.item === path) {
					var location  = path.getNearestLocation(data.point);
					var newOffset = location.offset / path.length;

					direction = lastOffset - newOffset;

					// kill last sound playback
					clearTimeout(soundTimeout);

					if(newOffset > .05) {
						soundTimeout = setTimeout(function(){
							SOUNDS.PURR.stop(sound);
						}, 300);

						// playback sound from current position (path acts as "scrubber")
						var duration = SOUNDS.PURR.duration();
						SOUNDS.PURR.seek(duration * newOffset, sound).play(sound);
					}

					// if jump is to big (cheating) or if user moved against the path's direction
					if(Math.abs(lastOffset - newOffset) >= 0.2 || direction >= 0.008) {
						dragging = false;
						_reset();
					} else {
						scene.A.position = location.point;
						//scene.A.style.fillColor.hue = newOffset * 90;

						if(newOffset === 1) {
							
							//win.bringToFront();
							//win.opacity = 1;

							if(steps === GOAL) {
								alert('Yeah! you rock.');
							} else {
								clearTimeout(winTimeout);
								winTimeout = setTimeout(function(){
									/*
									win.sendToBack();
									win.opacity = 0;
									*/
									steps++;
									_reset();
								}, 100);
							}

						} else {
							lastOffset = newOffset;
						}
					}
				} else {
					_reset();
				}
			}
		}
		scene.A.onMouseUp = function() {
			dragging = false;
		}

		onResize({size: view.viewSize});
	});

//});