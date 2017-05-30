
// strokeGame
var currentStroke 	= 0;
var lastOffset 	  	= 0;
var direction 	  	= 0;
var step 		  	= 1;

var stepTimeout;
var strokes;
var stroke;

function _reset(game) {
	lastOffset = 0;
	game.dragging = false;

	if(game.scene) {
		var position = strokes[currentStroke].firstSegment.point;
		game.scene.control.position = position;
		game.scene.control.onMouseMove({ point: position });

		game.onReset && game.onReset(currentStroke);
	}
}

function strokeGame(project, level, options, onLoad) {
	var strokeLoader = function(scene, container) {

		strokes 		= scene.strokes.children;
		stroke 			= strokes[currentStroke];
		self.stroke   	= stroke;

		// remove all clippingMasks
		project.getItem({ clipMask: true }).remove();

		// let's get closer!
		self.zoom(1.5);

		scene.control.onMouseDown = function(data) {
			if(!self.locked) {
		    	self.dragging = true;

		    	if(stroke.segments.length === 1) {
		    		stroke.data.newOffset = 1;
		    	} else {
		    		stroke.data.newOffset = 0;
		    	}

		    	self.onStrokeStart && self.onStrokeStart(data, currentStroke, self);
			}
		};

		scene.control.onMouseMove = _.throttle(function(data) {
			if(!self.locked)
				if(self.dragging && stroke.segments.length > 1) {

					scene.control.position = data.point;

					var hits = project.hitTest(data.point, { 
						class: 		paper.Path,
						fill: 		false,
						stroke: 	true,
						segments: 	true,
						tolerance: 	options.strokeTolerance || 20,
					});

					if(hits && hits.item == stroke) {
						var location  = stroke.getNearestLocation(data.point);
						var newOffset = location.offset / stroke.length;

						data.location = location;

						direction = lastOffset - newOffset;

						var wrongDirection = direction >= (options.directionTolerance || 0.008);
						var cheating 	   = Math.abs(lastOffset - newOffset) >= (options.cheatTolerance || 0.2);

						// if jump is too big ("cheating") or if user moved against the path's direction
						if(cheating || wrongDirection) {
							self.dragging = false;
							_reset(self);
						} else {
							stroke.data.newOffset = lastOffset = newOffset;
						}

						self.onStroke && self.onStroke(data, newOffset, wrongDirection, cheating, direction, self);

					} else {
						self.onStroke && self.onStroke(data, lastOffset, true, true, 1, self);
						_reset(self);
					}
				}
		}, 100);

		scene.control.onMouseUp = function(data) {
			if(!self.locked) {
				var newOffset = stroke.data.newOffset;

				self.onStrokeStop && self.onStrokeStop(data, newOffset, currentStroke, strokes, self);

				if(newOffset > self.options.completionTolerance) {
					
					self.onStrokeEnd && self.onStrokeEnd(data, currentStroke, strokes, self);

					if(currentStroke === strokes.length - 1) {
						// all strokes done
						if(step === (options.repetitions || 1)) {

							var phonetics = scene.UI.children.phonetics;

							Danimator.fadeIn(phonetics, .3, {
								from: 0,
								delay: 	1, 
								onDone: 'reverse'
							});

							self.onGameEnd && self.onGameEnd(data);

							self.dragging = false;

						} else {
							clearTimeout(stepTimeout);
							stepTimeout = setTimeout(function(){
								step++;
							}, 100);
						}
					}

					currentStroke = ++currentStroke % strokes.length;
					stroke 		  = strokes[currentStroke];
					self.stroke   = stroke;
				};
				_reset(self);
			}
		};
		_reset(self);

		if(onLoad) onLoad(scene, container, self);
	}
	options.type = 'strokes';
	options.completionTolerance = (options.completionTolerance || .97);

	var self = Game.call(this, project, options.letter, options, strokeLoader);
	return self;
};