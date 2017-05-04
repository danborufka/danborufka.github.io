// animation and game engine
// TODOS:
// • separate game & animation engine
// • performance optimizations
// • more sophisticated sound system

var animations   	= [];
var events 			= {};
var QUERY;

function limit(nr, mi, ma) {
	if(mi > ma) {
		var tweener = mi + 0;
		mi = ma + 0;
		ma = tweener + 0;
		delete tweener;
	}
	return Math.max(Math.min(nr, ma), mi);
}

/* add frame capability to Items */
paper.Item.inject({
	getFrame: function() {
		if(!this.data._frame) {
			this.data._frame = 1;
		}
		return this.data._frame;
	},
	setFrame: function(nr) {
		var frame 		 = parseInt(nr);
		var currentFrame = this.children['f' + (this.data._frame || 1)] || this.data._frameLayer;
		var newFrame 	 = this.children['f' + limit(frame, 0, this.frames)] || this.data._frameLayer;

		if(currentFrame) {
			this.data._frameLayer = currentFrame;
			currentFrame.visible = false;
		}

		if(newFrame) {
			newFrame.visible = true;
		}
		this.data._frame = frame;
	},
	getFrames: function() {
		var children = _.map(this.children, function(child) {
			return parseInt( child.name.split('f')[1]) || 0;
		});
		children.sort();
		children.reverse();
		return children[0];
	}
});

/* add animation to animation stack of passed item */
animate = function(item, property, fr, to, duration, options) {
	if(!_animateFrame) {
		function _animateFrame(event) {
			var item = this;

			_.each(item.data._animate, function(animatable) {
				if(animatable) {
					var t = ((new Date).getTime() - (animatable.startTime || 0)) / (animatable.duration * 1000);
					var animation = animate.step(animatable, t);
					var range 	  = animatable.to - animatable.from;

					if(animation.done) {
						_.pull(item.data._animate, animatable);

						if(!item.data._animate.length) {
							item.off('frame', _animateFrame);
							delete item.data._animate;
						}

						if(animatable.options.onDone) { 
							if(typeof animatable.options.onDone === 'string') {
								if(animatable.property === 'frame') {
									animatable.item.data._playing = true;
									animatable.options.delay = animatable.duration / range;
								}
							}

							switch(animatable.options.onDone) {

								case 'reverse':
									delete animatable.options.onDone;
								case 'pingpong':
									animate(item, animatable.property, animatable.to, animatable.from, animatable.duration, animatable.options);
									break;
									
								case 'loop':
									animate(animatable.item, animatable.property, animatable.from, animatable.to, animatable.duration, animatable.options);
									break;

								default:
									animatable.options.onDone && animatable.options.onDone(animatable);
									break;
							}
						}
					}
				}
			})
		}
	}

	/* setTimeout to cover delay parameter */
	var aniTimeout = animations[item.id] = setTimeout(function() {
		if(!item.data._animate) {
			item.data._animate = [];
			item.on('frame', _animateFrame);
		}

		var ease = (property === 'frame' ? null : 'cubicOut');
		var animatable = {
			item: 		item,
			property: 	property || 'opacity',
			duration: 	duration || 1,
			from: 		fr,
			to: 		to !== undefined ? to : 1,
			startTime: 	(new Date).getTime(),
			options: 	_.defaults(options, { delay: 0, easing: ease })
		};

		if(fr !== null) _.set(item, animatable.property, fr);
		item.data._animate.push(animatable);

	}, ((options && options.delay) || 0) * 1000);

	/* return handles for easier chaining of animations */
	return {
		then: function(item, property, fr, to, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate(item, property, fr, to, duration, newOptions);
		},
		thenFadeIn: function(item, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate.fadeIn(item, duration, newOptions);
		},
		thenFadeOut: function(item, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate.fadeOut(item, duration, newOptions);
		},
		stop: function() {
			clearTimeout(aniTimeout);
		}
	};
};

/* internal calculations */
animate._mergeDelays = function(options, newOptions) {
	newOptions.delay = _.get(newOptions, 'delay', 0) + ((options && options.delay) || 0);
}

/* calculate single step of animation */
animate.step = function(animatable, progress) {
	var value = _.get(animatable.item, animatable.property);

	if(animatable.from == undefined) 		animatable.from = value;
	if(typeof animatable.to === 'string') 	animatable.to 	= animatable.from + Number(animatable.to);

	var ascending = animatable.to > animatable.from;
	var range 	  = animatable.to - animatable.from;
	var isDone 	  = ascending ? 
					value >= animatable.to : 
					value <= animatable.to;

	if(animatable.property === 'frame')
		if(animatable.item.frame === animatable.item.frames || !animatable.item.data._playing) {
			isDone = true;
			animatable.item.data._playing = false;
		}

	if(!isDone) {		
		if(animatable.options.easing) {
			try {
				var easing = (typeof animatable.options.easing === 'string' ? Ease[animatable.options.easing] : animatable.options.easing);
				if(easing) {
					progress = easing(progress);
				}
			} catch(e) {
				console.warn('Easing helpers not loaded!');
			}
		}
		value = limit(animatable.from + (range * progress), animatable.from, animatable.to);

		if(animatable.options.onStep) {
			value = animatable.options.onStep(value, progress, animatable);
		}
		_.set(animatable.item, animatable.property, value);
		paper.project.view.requestUpdate();
	}

	return {
		done: isDone
	};
}

animate.startTime = (new Date).getTime();

/* fx */
animate.fadeIn = function(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	} else fromv = null;
	item.visible = true;
	return animate(item, 'opacity', fromv, _.get(options, 'to', 1), duration, options);
};
animate.fadeOut = function(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	} else fromv = null;
	item.visible = true;
	return animate(item, 'opacity', fromv, _.get(options, 'to', 0), duration, options);
};

/* basic frame animation support */
animate.play = function(item, options) {
	var frames = item.frames;
	var range = frames - item.frame;
	var duration = range / (options && options.fps || 12);

	item.data._playing = true;
	options.frameDuration = duration / range;

	return animate(item, 'frame', item.frame, frames, duration, options);
}

/* interrupt frame animations */
animate.stop = function(item) {
	item.data._playing = false;
}

/* stop all animations on passed item */
animate.stopAll = function(item) {
	_.each(animations[item.id], function(ani, id){
		clearTimeout(ani);
		delete animations[id];
	});
	delete item.data._animate;
};

/* helper for punctiform visual highlighting */
highlight = function(position, color, stay) {
	var highlighter = new paper.Path.Circle({
		center: 	position, 
		radius: 	10,
		strokeWidth: 0,
		fillColor: color,
		opacity: 	 .5,
	}).bringToFront();
	
	highlighter.radius = 10;

	if(!stay) {
		animate(highlighter, 'opacity', .5, 0);
	}
	return highlighter;
}

/* game engine for loading SVG skeletons */
Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options || {};
	self.sounds 		= {};
	self.symbols 		= [];

	self.playSound = function(name, options) {
		var config = _.extend({ name: name, src: ['audio/' + name] }, options);
		var sound  = _.get(self.sounds, name);

		config.src = _.map(config.src, function(src) {
			if(!src.match(/.*\/.+$/i)) {
				src = 'audio/' + src;
			}
			if(!src.match(/.*\.[^\.]+$/i)) {
				return src + '.m4a';
			}
			return src;
		});

		if(!sound) {
			sound = self.sounds[name] = {
				source: new Howl(config)
			};
		}

		return sound.instance = sound.source.play();
	};
	self.stopSound = function(name) {
		self.sounds[name].source.stop(self.sounds[name].instance);
	}

	self.resize = function(event) {
		if(self.container)
			self.container.position = project.view.center;
	};

	self.reset = function() {
		self.dragging = false;
	}

	project.importSVG(self.file, function(item) {
		self.container 		= item;
		self.scene 			= self.container.children;

		_.each(project.symbolDefinitions, function(definition) {
			if(definition.item.name)
				self.symbols[definition.item.name] = definition;
		});

		if(self.scene.UI) {
			_.each(self.scene.UI.children, function(ui) {
				ui.visible = false;
			});
		}

		self.resize({size: project.view.viewSize});
		item.position = project.view.center;

		if(onLoad) onLoad(self.scene, self.container);
	});

	return this;
}