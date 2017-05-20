// animation and game engine
// TODOS:
// • performance optimizations:
// 		* minifying & concatenation of files
// • add support for nested frame animations
// • compress SVGs

var animations   	= [];

/* class for easier iteration over maps */
function IteratableMap(map) {
	var self = this;

	self.done 	 = false;
	self.sort 	 = false;
	self.map 	 = map || {};
	self.keys 	 = [];
	self.indexed = [];
	self.index 	 = 0;
	self.length  = 0;

	self._makeIteratable = function(index, key, value) {
		return { 
				index: 	 index,
				key: 	 key,
				parent:  self,
				prev: 	 function() {
					self.index = index;
					self.key = key;
					return self.prev();
				},
				next: 	 function() {
					self.index = index;
					self.key = key;
					return self.next();
				},
				isFirst: function() {
					return this.index == 0;
				},
				isLast: function() {
					return this.index === self.ubound;
				},
				value: value
			};
	};

	self.init = function() {
		self.keys 	 = _.keys(self.map);
		self.indexed = [];
		self.key 	 = self.keys[0];
		self.length  = self.keys.length;
		self.ubound  = self.length - 1;

		var order = _.range(self.ubound);

		if(self.sort) {
			console.log('order', order, _.zip(self.keys, order));
		}

		_.each(self.keys, function(key, index) {
			self.indexed.push(self.map[key]);
			self[index] = self._makeIteratable(index, key, self.map[key]);
		});
		return self;
	};
	self.reset = function() {
		self.index = 0;
		self.done = false;
		self.key = self.keys[0];
		return self;
	}

	self.get = function(offset) {
		if(offset === undefined) offset = 0;
		return self.indexed[self.index + offset];
	};
	self.set = function(key, value) {
		self.map[key] = value;
		return self.init();
	};
	self.push = function(value) {
		var index = self.length+1;
		self.map[index] = value;
		return self.init();
	};
	self.pull = function(key) {
		delete self.map[key];
		return self.init();
	}

	self.first = function() {
		return self.indexed[0];
	};
	self.last = function() {
		return self.indexed[self.ubound];
	};
	self.prev = function() {
		self.index = Math.max(self.index - 1, 0);
		self.key = self.keys[self.index];
		self.done = false;
		return self.get();
	};
	self.next = function() {
		if(self.index + 1 >= self.length) {
			self.done = true;
			return false;
		}

		self.index++;
		self.key = self.keys[self.index];
		if(self.index === self.ubound) self.done = true;
		return self.get();
	};

	if(map) self.init();

	return self;
}

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
	},
	getFrames: function() {
		var children = _.map(this.children, function(child) {
			return parseInt( child.name.slice(1) ) || 0;
		});
		children.sort();
		children.reverse();
		return children[0];
	},
	getState: function(childname) {
		if(childname) {
			return this.getItem({
				match: 		Danimator.matchBase(childname),
				recursive: 	true
			}).getState();
		}
		return this.data._state || 0;
	},
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
	},
	getStates: function() {
		var self = this;
		if(!this.data._states) {
			this.data._states = [];
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
		function _animateFrame(event) {
			var item = this;

			/* walk thru all keyframes but the last one */
			if(item.data._animate)
				_.each(item.data._animate, function(animatable) {
					if(animatable && !animatable.isLast()) {
						var animation 	 = { done: true };
						
						var keyframe 	 = animatable.value;
						var nextKeyframe = animatable.next() || { time: keyframe.time };

						var range 	  	 = Math.abs(nextKeyframe.value - keyframe.value);
						var duration 	 = (nextKeyframe.time - keyframe.time);
						var time 		 = ((new Date).getTime() - _.get(keyframe, 'startTime', Danimator.startTime)) / 1000;
						var step 		 = time / duration;

						if(duration && _.inRange(step, 0, 1)) {
							animation = Danimator.step(animatable, step);
						}

						console.log('each', animation.done);

						if(animation.done) {
							// TODO: actually pull!
							keyframe.item.data._animate.pull(keyframe.time).reset();
							console.log('_animate', keyframe.item.data._animate);

							if(!item.data._animate.length) {
								item.off('frame', _animateFrame);
								delete item.data._animate;
							}

							if(keyframe.options.onDone) { 
								if(typeof keyframe.options.onDone === 'string') {
									if(keyframe.property === 'frame') {
										keyframe.item.data._playing = true;
										keyframe.options.delay = (nextKeyframe.value === 1 ? 0 : duration / range);
									} 

									switch(keyframe.options.onDone) {
										case 'reverse':
											delete keyframe.options.onDone;
										case 'pingpong':
											var xfer = _.clone(nextKeyframe.value);
											nextKeyframe.value = _.clone(keyframe.value);
											keyframe.value = xfer;
										default: // loop
											if(!keyframe.item.data._loops) keyframe.item.data._loops = 0;
											if(keyframe.options.onLoop) keyframe.options.onLoop(keyframe, keyframe.item.data._loops++ );
											return Danimator.animate(keyframe.item, keyframe.property, keyframe.value, nextKeyframe.value, duration, keyframe.options);
									}
								} else {
									keyframe.options.onDone && keyframe.options.onDone(keyframe);
								}

							}
						}
					}
				})
			}
	}

	/* setTimeout to cover delay parameter */
	var aniTimeout = animations[item.id] = setTimeout(function() {
		var _needsHandler = false;

		if(!item.data._animate) {
			item.data._animate = new IteratableMap;
			_needsHandler = true;
		}

		var ease = (property === 'frame' ? null : 'cubicOut');

		var key = {
			item: 		item,
			property: 	property || 'opacity',
			initValue: 	_.get(item, property),
			options: 	_.defaults(options, { delay: 0, easing: ease })
		};

		var keyIn = _.extend({
			index: 		item.data._animate.length,
			startTime: 	(new Date).getTime(),
			time: 		options.delay || 0,
			value: 		fr
			
		}, key);

		var keyOut = _.extend({
			index: 		keyIn.index + 1,
			startTime: 	keyIn.startTime + duration,
			time: 		keyIn.time + duration,
			value: 		to
		}, key);

		if(fr !== null) _.set(item, property, fr);
		item.data._animate.set(keyIn.time, keyIn);
		item.data._animate.set(keyOut.time, keyOut);

		if(_needsHandler) item.on('frame', _animateFrame);

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
Danimator.matchBase = function(base) {
	return function(item) {
		return !!(item.name && item.name.match(new RegExp('^' + base + '([-_]\d+)?' , 'i')));
	};
}

/* TODO: rewrite entirely to use KF instead of ranges */
/* calculate single step of animation */
Danimator.step = function(animatable, progress) {
	var keyframe 	 = animatable.value;
	var nextKeyframe = animatable.next() || animatable.value;

	var value = _.get(keyframe.item, keyframe.property);

	console.log('progress', progress);

	if(keyframe.value == undefined) 			keyframe.value 		= value;
	if(typeof nextKeyframe.value === 'string') 	nextKeyframe.value 	= keyframe.value + Number(nextKeyframe.value);

	var ascending = nextKeyframe.value > keyframe.value;
	var range 	  = nextKeyframe.value - keyframe.value;
	var newValue  = nextKeyframe.value;
	var isDone 	  = ascending ? 
					value >= nextKeyframe.value : 
					value <= nextKeyframe.value;

	if(Danimator.interactive) {
		isDone = false;
	}

	if(isDone) {
		if(keyframe.property === 'frame')
			keyframe.item.data._playing = false;
	} else {
		if(keyframe.options.easing) {
			try {
				var easing = (typeof keyframe.options.easing === 'string' ? Ease[keyframe.options.easing] : keyframe.options.easing);
				if(easing) {
					progress = easing(progress);
				}
			} catch(e) {
				console.warn('Easing helpers not loaded!');
			}
		}
		
		newValue = Danimator.limit(keyframe.value + (range * progress), keyframe.value, nextKeyframe.value);

		if(keyframe.options.onStep) {
			newValue = keyframe.options.onStep(newValue, progress, keyframe);
		}

		//console.log('stepping thru…');
		_.set(keyframe.item, keyframe.property, newValue);

		paper.project.view.requestUpdate();
	}

	if(Danimator.onStep) Danimator.onStep(keyframe, newValue);

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