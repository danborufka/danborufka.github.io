// animation and game engine
// TODOS:
// • add frame label support
// • add support for nested frame animations
// • performance optimizations:
// 		* only rerender separate tracks/layers/props when needed instead of full re-render
// 		* minifying & concatenation of files
// 		* refactor all games to use internal sound manager

var animations   	= [];
var events 			= {};
var QUERY;

/* add frame capability to paperjs Items */
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
		var newFrame 	 = this.children['f' + Danimator.limit(frame, 0, this.frames)] || this.data._frameLayer;

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

/* create Danimator as main object and in the same time shortcut to Danimator.animate */
if(!this.Danimator) {
	Danimator = function Danimator() { return Danimator.animate.apply(Danimator, arguments); };
}

/* core animation function (adds animation to animatable stack) */
Danimator.animate = function DanimatorAnimate(item, property, fr, to, duration, options) {
	if(!_animateFrame) {
		function _animateFrame(event) {
			var item = this;

			_.each(item.data._animate, function(animatable) {
				if(animatable) {
					var t = ((new Date).getTime() - (animatable.startTime || 0)) / (animatable.duration * 1000);
					var animation = Danimator.step(animatable, t);
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
									Danimator(item, animatable.property, animatable.to, animatable.from, animatable.duration, animatable.options);
									break;
									
								case 'loop':
									Danimator(animatable.item, animatable.property, animatable.from, animatable.to, animatable.duration, animatable.options);
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

	if(Danimator.onAnimate) Danimator.onAnimate();

	/* return handles for easier chaining of animations */
	return {
		then: function(item, property, fr, to, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator(item, property, fr, to, duration, newOptions);
		},
		thenFadeIn: function(item, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator.fadeIn(item, duration, newOptions);
		},
		thenFadeOut: function(item, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator.fadeOut(item, duration, newOptions);
		},
		stop: function() {
			clearTimeout(aniTimeout);
		}
	};
}

/* internal calculations */
Danimator._mergeDelays = function(options, newOptions) {
	newOptions.delay = _.get(newOptions, 'delay', 0) + ((options && options.delay) || 0);
}

/* helper */
Danimator.limit = function(nr, mi, ma) {
	if(mi > ma) {
		var tweener = mi + 0;
		mi = ma + 0;
		ma = tweener + 0;
		delete tweener;
	}
	return Math.max(Math.min(nr, ma), mi);
}

/* calculate single step of animation */
Danimator.step = function(animatable, progress) {
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

	if(Danimator.interactive) {
		isDone = false;
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
		
		var newValue = Danimator.limit(animatable.from + (range * progress), animatable.from, animatable.to);

		if(animatable.options.onStep) {
			newValue = animatable.options.onStep(newValue, progress, animatable);
		}

		_.set(animatable.item, animatable.property, newValue);

		paper.project.view.requestUpdate();
	}

	if(Danimator.onStep) Danimator.onStep(animatable, newValue);

	return {
		done: 	isDone,
		value: 	newValue
	};
}

/* fx */
Danimator.fadeIn = function(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	} else fromv = null;
	item.visible = true;
	return Danimator(item, 'opacity', fromv, _.get(options, 'to', 1), duration, options);
};
Danimator.fadeOut = function(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	} else fromv = null;
	item.visible = true;
	return Danimator(item, 'opacity', fromv, _.get(options, 'to', 0), duration, options);
};

/* basic frame animation support */
Danimator.play = function(item, options) {
	var frames = item.frames;
	var range = frames - item.frame;
	var duration = range / (options && options.fps || 12);

	item.data._playing = true;
	options.frameDuration = duration / range;

	return Danimator(item, 'frame', item.frame, frames, duration, options);
}

/* interrupt frame animations */
Danimator.stop = function(item) {
	item.data._playing = false;
}

/* stop all animations on passed item */
Danimator.stopAll = function(item) {
	_.each(animations[item.id], function(ani, id){
		clearTimeout(ani);
		delete animations[id];
	});
	delete item.data._animate;
};

Danimator.load = function(aniName) {
	var filename = aniName + '.animations.json';

	$.getJSON(filename, null, function(json, status) {
		if(status === 'success') {
			console.log('json', json);
			_.each(json, function(track, id) {
				if(!isNaN(Number(id))) id = Number(id);
				track.item = GAME.find(id);
			})
			tracks = _.extend(tracks, json);
			_createTracks();
		} else {
			console.warn('Animations "' + filename + '" couldn\'t be loaded :(');
		}
	}).fail(function(promise, type, error){ console.error(error); });
}

Danimator.sound = function(name, options) {
	var config 	= _.extend({ 
		name: 	name, 
		src: 	['audio/' + name] 
	}, options);
	var sound  	= _.get(Danimator.sounds, name);
	var fadeIn 	= 0;
	var fadeOut = 0;

	/* add default path + file extension if not supplied */
	config.src = _.map(config.src, function(src) {
		if(!src.match(/^\/?audio\/.+$/g)) {
			src = 'audio/' + src;
		}
		if(!src.match(/.*\.[^\.]+$/g)) {
			name += '.m4a';
			return src + '.m4a';
		}
		return src;
	});

	if(config.fadeIn) {
		fadeIn = config.fadeIn;
		delete config.fadeIn;
	}
	if(config.fadeOut) {
		fadeOut = config.fadeOut;
		delete config.fadeOut;
	}

	if(!sound) {
		sound = Danimator.sounds[name] = {
			source: new Howl(config),
			get: function(param) {
				return this.source['_' + param];
			},
			set: function(param, value) {
				this.source[param](value, this.instance);
			},
			play: function() {
				this.stopped = false;
				Danimator._activeSound = this;
				return this.instance = this.source.play();
			},
			stop: function() {
				this.source.stop(this.instance);
				this.stopped = true;
				if(Danimator.onSoundStop) Danimator.onSoundStop(this);
			},
			fadeIn: function(duration) {
				var volume = this.source.volume(null, this.instance);
				this.source.fade(0, volume, duration, this.instance);
				return volume;
			},
			fadeOut: function(duration) {
				var volume = this.source.volume(null, this.instance);
				this.source.fade(volume, 0, duration, this.instance);
				return volume;
			}
		};
	}

	if(!Danimator.interactive) {
		sound.play();
		
		if(fadeIn) {
			sound.fadeIn(fadeIn);
		}
		if(fadeOut) {
			sound.fadeOut(fadeOut);
		}
	} else {
		Danimator._activeSound = sound;
	}

	if(Danimator.onSound) {
		Danimator.onSound(name, options);
	}

	return sound;
};

Danimator.sounds 		= {};
Danimator.interactive 	= false;	// interactive mode suppresses checks of animationEnd and thus never removes them from stack
Danimator.startTime 	= (new Date).getTime();

/* game engine for loading SVG skeletons */
Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options || {};
	self.symbols 		= [];

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
		if(Game.onLoad) Game.onLoad.call(self, project, name, options);
	});

	return this;
}