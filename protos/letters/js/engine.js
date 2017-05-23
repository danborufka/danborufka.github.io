// animation and game engine
// TODOS:
// o fix autocenter of stage when resizing window
// o performance optimizations:
// 		* minifying & concatenation of files
// o test morphs + chaining
// o add support for nested frame animations
// o compress SVGs

var animations   	= [];

paper.Item.inject({
	/* frame animation capability for paperjs Items */
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

		if(this.data._frame === undefined) {
			_.each(this.children, function(child) {
				if(child.name.match(/^f\d+/g)) {
					if(parseInt( child.name.slice(1) ) != frame) {
						child.visible = false;
					}
				}
			});
		} else if(currentFrame) {
			this.data._frameLayer = currentFrame;
			currentFrame.visible = false;
		}

		if(newFrame) {
			newFrame.visible = true;
		}
		this.data._frame = frame;
		this.data.onFrameChanged && this.data.onFrameChanged(frame);
	},
	getFrames: function() {
		var children = _.map(this.children, function(child) {
			return parseInt( child.name.slice(1) ) || 0;
		});
		children.sort();
		children.reverse();
		return children[0];
	},
	/* state capability */
	getState: function(childname) {
		if(childname) {
			return this.getItem({
				match: 		Danimator.matchBase(childname),
				recursive: 	true
			}).getState();
		}
		return this.data._state || 0;
	},
	// example: bear.setState('open', 'snout') vs. bear.setState('closed', 'snout') will hide layer #open of bear's childrens starting with "snout" (so snout-1, snout-2, …)
	setState: function(state, childname) {
		var self = this;
		if(childname) {
			return _.each(self.getItems({
						match: 		Danimator.matchBase(childname),
						recursive: 	true
					}), function(item) {
						item.setState(state);
					});
		} else {
			var states = self.getStates();

			if(self.data._state === undefined) {
				self.data._state = _.keys(states)[0];
				_.each(states, function(state) {
					state.visible = false;
				});
			} else {
				states[self.data._state].visible = false;
			}
			states[state].visible = true;
			self.data._state = state;
		}
		self.data.onStateChanged && self.data.onStateChanged(state, childname);
		return self;
	},
	getStates: function() {
		var self = this;
		if(!this.data._states) {
			this.data._states = [];
			// find all children which names begin with either underscore (_) or hash (#) and save them as state
			_.each(this.children, function(child) {
				if(child.name.match(/^[#_][a-z0-9_-]+.*$/i)) {
					var name = child.name.match(/^[#_](.*?)(\-\d+)?$/)[1];
					self.data._states[name] = child;
					self.data._states.push(child); // add numeric index, too
					child.visible = false;
				}
			});
		}
		return this.data._states;
	},
});

/* create Danimator as main object and in the same time shortcut to Danimator.animate */
if(!this.Danimator) {
	Danimator = function Danimator() { return Danimator.animate.apply(Danimator, arguments); };
}

/* core animation function (adds animation to animatable stack) */
Danimator.animate = function DanimatorAnimate(item, property, fr, to, duration, options) {
	if(!_animateFrame) {
		/* create _animateFrame function to be executed every item.onFrame() */
		function _animateFrame(event) {
			var item = this;

			/* walk thru array of props to animate */
			_.each(item.data._animate, function(animatable) {
				if(animatable) {
					/* calculate current progress of animation (0…1) */
					var t = ((new Date).getTime() - (animatable.startTime || 0)) / (animatable.duration * 1000);
					var animation = Danimator.step(animatable, t);		// retrieve map with calculated step value and "done" flag
					var range 	  = Math.abs(animatable.to - animatable.from);

					if(animation.done) {
						/* remove animatable entry from said animate array */
						_.pull(item.data._animate, animatable);

						if(!item.data._animate.length) {
							/* remove frame handler from item and remove array */
							item.off('frame', _animateFrame);
							delete item.data._animate;
						}

						/* if onDone parameter provided as String */
						if(animatable.options.onDone) { 
							if(typeof animatable.options.onDone === 'string') {
								if(animatable.property === 'frame') {
									animatable.item.data._playing = true;
									/* calculate timing of animation iteration for frame-animations */
									animatable.options.delay = animatable.to === 1 ? 0 : animatable.duration / range;
								} 

								switch(animatable.options.onDone) {
									case 'reverse':
										/* turning looping off so it can behave like pingpong without loops */
										delete animatable.options.onDone;
									case 'pingpong':
										/* switch out from and to and then fall into normal loop behavior (no break) */
										var xfer = _.clone(animatable.to);
										animatable.to = _.clone(animatable.from);
										animatable.from = xfer;
									default: // loop
										if(!animatable.item.data._loops) animatable.item.data._loops = 0;
										/* handler to execute every loop: onLoop(numberOfLoops) */
										if(animatable.options.onLoop) animatable.options.onLoop(animatable, animatable.item.data._loops++ );
										return Danimator.animate(animatable.item, animatable.property, animatable.from, animatable.to, animatable.duration, animatable.options);
								}
							} else {
								animatable.options.onDone && animatable.options.onDone(animatable);
							}

						}
					}
				}
			})
		}
	}

	/* setTimeout to cover delay parameter */
	var aniTimeout = animations[item.id] = setTimeout(function() {
		/* if this is the first time */
		if(!item.data._animate) {
			/* attach animatables array and frameHandler to item */
			item.data._animate = [];
			item.on('frame', _animateFrame);
		}

		var ease = (property === 'frame' ? null : 'cubicOut');	// default easing is cubicOut (or none for frame animations)
		/* animatables are the base of everything animated thru Danimator. They describe animations and come in pairs of keyframes to the editor */
		var animatable = {
			item: 		item,
			property: 	property || 'opacity',
			duration: 	duration || 1,
			from: 		fr,
			to: 		to !== undefined ? to : 1,
			startTime: 	(new Date).getTime(),
			options: 	_.defaults(options, { delay: 0, easing: ease })
		};

		if(fr !== null) _.set(item, animatable.property, fr);	// if "from" is set use it to initialize the item
		item.data._animate.push(animatable);					// and add animatable to item's new array

	}, ((options && options.delay) || 0) * 1000);				// delay is in seconds, so we turn into ms

	if(Danimator.onAnimate) Danimator.onAnimate();				// call hook if there is one

	/* return handles for easier chaining of animations */
	return {
		then: function() {
			var args = _.toArray(arguments);
			var action = args.shift();
			var newOptions = _.last(args);

			console.log('args', args, 'action', action, 'newOptions', newOptions);

			Danimator._mergeDelays(options, newOptions);

			return Danimator[action].apply(this, args);
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

/* limit number between two boundaries – like _.clamp except it accepts upper and lower border in arbitrary order */
// example: Danimator.limit(5, 10, 0) will return 5 while _.clamp(5, 10, 0) will return 10.
Danimator.limit = function(nr, mi, ma) {
	if(mi > ma) {
		var tweener = mi + 0;
		mi = ma + 0;
		ma = tweener + 0;
		delete tweener;
	}
	return Math.max(Math.min(nr, ma), mi);
}
/* returns an iteratee to check whether a collection's item's names starting with "base" */
// example: _.filter( collection, Danimator.matchBase('bear') ) only returns those items of collection starting with "bear"
Danimator.matchBase = function(base) {
	return function(item) {
		return !!(item.name && item.name.match(new RegExp('^' + base + '([-_]\d+)?' , 'i')));
	};
}

/* calculate single step of animation */
Danimator.step = function(animatable, progress) {
	var value = _.get(animatable.item, animatable.property);

	if(animatable.from == undefined) 		animatable.from = value;
	if(typeof animatable.to === 'string') 	animatable.to 	= animatable.from + Number(animatable.to);

	var ascending = animatable.to > animatable.from;	// check whether values are animated ascending or descending
	var range 	  = animatable.to - animatable.from;	// calculate range of animation values
	var isDone 	  = ascending ? 
					value >= animatable.to : 
					value <= animatable.to;

	if(Danimator.interactive) {
		isDone = false;
	}

	if(isDone) {
		if(animatable.property === 'frame')
			animatable.item.data._playing = false;
	} else {
		if(animatable.options.easing) {
			/* Easing requires easing.js to be loaded, too */
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
		/* force-updating canvas drawing */
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

/* morph between two shapes (works for subitems too) */
Danimator.morph = function DanimatorMorph(fromItem, toItem, duration, options) {
	var fromItems = [fromItem];
	var toItems   = [toItem];

	var newItem   = fromItem.clone();
	var newItems  = [newItem];

	if(fromItem.className !== 'Path') {
		fromItems = fromItem.getItems({	class: paper.Path});
		toItems   = toItem.getItems({ 	class: paper.Path});
		newItems  = newItem.getItems({ 	class: paper.Path});
	}

	fromItem.visible = toItem.visible = false;
	newItem.name = 'morph "' + fromItem.name.replace(/(^_|\-\d+$)/g, '') + '" to "' + toItem.name.replace(/(^_|\-\d+$)/g, '') + '"';
	newItem.insertAbove(fromItem);
	newItem.data.morphing = 0;

	if(Danimator.onMorph) Danimator.onMorph(newItem, options);

	Danimator(newItem, 'data.morphing', 0, 1, duration, {
		onStep: function(progress) {
			if(progress === 0 || progress === 1) {
				[fromItem, toItem][progress].visible = true;
				newItem.visible = false;
			} else {
				fromItem.visible = toItem.visible = false;
				newItem.visible = true;
				_.each(fromItems, function(fromPath, key) {
					var toPath  = toItems[key];
					var newPath = newItems[key];

					_.each(newPath.segments, function(segment, index) {
						var fromSegment = fromPath.segments[index];
						var toSegment 	= toPath.segments[index];

						if(segment && toSegment) {
							segment.point = 	fromSegment.point.add( 		toSegment.point.subtract( 		fromSegment.point ).multiply(progress) );
							segment.handleIn = 	fromSegment.handleIn.add( 	toSegment.handleIn.subtract( 	fromSegment.handleIn ).multiply(progress) );
							segment.handleOut = fromSegment.handleOut.add( 	toSegment.handleOut.subtract( 	fromSegment.handleOut ).multiply(progress) );
						}
					});
				});
			}
		}
	});
}

/* basic frame animation support */
Danimator.play = function(item, options) {
	var frames = item.frames;
	var range  = frames - item.frame;
	var duration = range / (options && options.fps || 12);	// calculate duration from fps and number of available frames

	item.data._playing = true;
	options.frameDuration = duration / range;				// calculating duration of single frame and passing it on for later reference

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

/* ###experimental: load animations from JSON files */
Danimator.load = function(aniName) {
	var filename = aniName + '.animations.json';

	$.getJSON(filename, null, function(json, status) {
		if(status === 'success') {
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

/* sound factory */
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

/* init values for Danimator props */
Danimator.sounds 		= {};
Danimator.interactive 	= false;					// interactive mode suppresses checks of animationEnd and thus never removes them from stack
Danimator.startTime 	= (new Date).getTime();		// when did Danimator get initialized?

/* game engine for loading SVG skeletons */
Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options || {};
	self.symbols 		= [];

	self.resize = function(event) {};

	self.reset = function() {
		this.dragging = false;
	};

	self._resolveFiles = function(files) {
		var resolved = {};

		switch(typeof files) {
			case 'object':
				if(_.isArray(files)) {
					return _.merge.apply(_, _.map(files, self._resolveFiles));
				}
				return files;	
			case 'string':
				var extension = files.match(/\.([^\.]{2,5})$/g);
				if(extension) {
					resolved[extension[0].slice(1)] = files;
					return resolved;
				}
				/* if SVG */
				if(files.match(/<svg.*>/g)) {
					return { svg: files };
				}
				if(files.match(/\n/g)) {
					return { js: files };
				}
			default:
		}
		return false;
	};

	self.load = function(files) {
		files = self._resolveFiles(files);
		
		if(files) {
			if(files.svg) {
				project.clear();
				project.view.update();
				project.importSVG(files.svg, {
					expandShapes: 	true,
					onLoad: 		function(item, svg) {
										self.container 	= item;
										self.scene 		= self.container.children;
										try {
											self.DOM = $(svg);
										} catch(e) {}

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

										try {
											if(onLoad) onLoad(self.scene, self.container, self);
											if(Game.onLoad) Game.onLoad.call(self, project, name, options);
											console.log('%c SVG loaded ', 'background-color:#444; color:#CCC', files.svg);
										} catch(e) {
											console.error('Game could not be properly initialized. %c ' + e + ' ', 'background-color:red; color: #fff;');
										}
									}
				});
			}

			if(files.js) {
				console.log('files.js', files.js);
				jQuery.ajax({
			        url: files.js,
			        dataType: 'script',
			        success: function(){ console.log('success! arguments', arguments); },
			        async: true
			    });
			}
		}
	}

	self.load(self.file);

	return this;
}