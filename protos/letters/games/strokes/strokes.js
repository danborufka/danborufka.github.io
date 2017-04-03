// strokeGame

var lastOffset 	  	= 0;
var direction 	  	= 0;
var step 		  	= 1;
var currentStroke 	= 0;

var stepTimeout;

var strokes;
var stroke;

function _reset(game) {
	lastOffset = 0;
	game.dragging = false;
	if(game.scene) {
		var position = strokes[currentStroke].segments[0].point;
		game.scene.control.position = position;
		game.scene.control.onMouseMove({ point: position });
	}
}

function strokeGame(project, level, options, onLoad) {
	var strokeLoader = function(scene, container) {

		strokes 		= scene.strokes.children;
		stroke 			= strokes[currentStroke];

		// let's get closer!
		project.view.zoom = 1.5;

		// remove all clippingMasks
		project.getItem({ clipMask: true }).remove();

		scene.control.onMouseDown = function(data) {
	    	self.dragging = true;

	    	if(stroke.segments.length === 1) {
	    		stroke.data.newOffset = 1;
	    	} else {
	    		stroke.data.newOffset = 0;
	    	}

	    	self.onStrokeStart && self.onStrokeStart(data, self);
		};

		scene.control.onMouseMove = _.throttle(function(data) {
			if(self.dragging && stroke.segments.length > 1) {

				var hits = project.hitTest(data.point, { 
					class: 		paper.Path,
					fill: 		false,
					stroke: 	true,
					segments: 	true,
				});

				if(hits && hits.item == stroke) {
					var location  = stroke.getNearestLocation(data.point);
					var newOffset = location.offset / stroke.length;

					direction = lastOffset - newOffset;

					var wrongDirection = direction >= 0.008;
					var cheating 	   = Math.abs(lastOffset - newOffset) >= 0.4;

					// if jump is too big ("cheating") or if user moved against the path's direction
					if(cheating || wrongDirection) {
						self.dragging = false;
						_reset(self);
					} else {
						scene.control.position = location.point;
						stroke.data.newOffset = lastOffset = newOffset;
					}

					self.onStroke && self.onStroke(data, newOffset, wrongDirection, cheating, direction, self);

				} else _reset(self);
			}
		}, 100);

		scene.control.onMouseUp = function(data) {
			var newOffset = stroke.data.newOffset;

			if(newOffset === 1) {
				
				self.onStrokeEnd && self.onStrokeEnd(data, currentStroke, strokes, self);

				if(currentStroke === strokes.length - 1) {
					// all strokes done
					if(step === (options.repetitions || 1)) {

						var phonetics = scene.UI.children.phonetics;
						phonetics.opacity = 0;
						phonetics.visible = true;
						animate(phonetics, 'opacity', 0,1, .3, 'reverse', 1);

						self.onGameEnd && self.onGameEnd(data);

					} else {
						clearTimeout(stepTimeout);
						stepTimeout = setTimeout(function(){
							step++;
						}, 100);
					}
				}

				currentStroke = ++currentStroke % strokes.length;
				stroke 		  = strokes[currentStroke];
			}
			_reset(self);
		};

		_reset(self);

		if(onLoad) onLoad(scene, container, self);
	}
	options.type = 'strokes';

	var self = Game.call(this, project, options.letter, options, strokeLoader);
	return self;
};