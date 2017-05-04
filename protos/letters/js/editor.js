// animation editor engine
// TODOS:
// • #properties panel: single keys / merged keys
// • #properties panel: change ani keyframes
// • snap to segments: collect all snappables ;)
// • snap keyframes to scrubber
// • snappable panels
// • (add node module for packaging)
// • node module for server-side saving & loading of JSON
// • dynamic timeScaling (UI)
// • abstract sound system + separate module

var tracks   		= {};
var events 			= {};
var sounds 			= {};

var QUERY;
var GAME;

var TIME_FACTOR 	= 10;

var layerTemplate;
var keyItemTemplate;
var propItemTemplate;
var audioTemplate;

var selectionId;

var $time;
var $animationValue;

var playing 		= false;
var _frameDragging 	= false;

var _anchorViz;

var _ANIMATABLE_COLORS = {
	saturation: {
		range: [0,1],
		type: Number
	},
	brightness: {
		range: [0,1],
		type: Number
	},
	hue: {
		range: [0,360],
		type: Number
	},
	alpha: {
		range: [0,1],
		type: Number
	}
}

var _ANIMATABLE_GEOMETRY = {
	fillColor: 		_asGroup(_ANIMATABLE_COLORS),
	strokeColor: 	_asGroup(_ANIMATABLE_COLORS),
	strokeWidth: 	{	range: [0,100], type: Number  },
};
var _ANIMATABLE_PIVOT = {
	_x: 	{ type: Number },
	_y: 	{ type: Number },
};
var _ANIMATABLE_POS = {
	x: 	{ type: Number },
	y: 	{ type: Number },
};
var _ANIMATABLE_SIZE = {
	width: 	{ type: Number },
	height: { type: Number },
};
var _ANIMATABLE_RECT = _.extend({}, _ANIMATABLE_POS, _ANIMATABLE_SIZE, {
	left: 	{ type: Number },
	top: 	{ type: Number },
	right: 	{ type: Number },
	bottom: { type: Number },
	point: 	_asGroup(_ANIMATABLE_POS),
});

function _asGroup(config) {
	return { 
		content: config,
		type: 'group'
	};
}
function _decimalPlaces(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max( 0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
}
function _changeProp(prop, value) {
	var $input = $('#properties').find('input[data-prop="' + prop + '"]');
	if(typeof value === 'boolean') {
		$input.prop('checked', value);
	} else {
		$input.val(value);
	}
}

var _ANIMATABLE_DEFAULTS = {
	blendMode: {
					allowedValues: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source- over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'],
					type: String
				},
	bounds: 	_asGroup(_ANIMATABLE_RECT),
	frame: 		{
					range: [0,Math.Infinity],
					type: 	Number
				},
	offsetOnPath: {
					range: [0,1],
					type: 	Number
				},
	opacity: 	{
					range: [0,1],
					type: 	Number
				},
	//pivot: 		_asGroup(_ANIMATABLE_POS),
	position: 	_asGroup(_ANIMATABLE_POS),
	rotation: 	{
					range: [-360,360],
					type: 	Number
				},
	visible: 	{
					type: 	Boolean
				}
}
var ANIMATABLE_PROPERTIES = {
	Shape: 		_.extend({}, _ANIMATABLE_DEFAULTS, _ANIMATABLE_GEOMETRY, {
					radius: {
						range: [0, Math.Infinity],
						type: Number
					},
					size: _asGroup(_ANIMATABLE_SIZE)
				}),
	Path: 		_.extend({}, _ANIMATABLE_DEFAULTS, _ANIMATABLE_GEOMETRY, {
					growth: {
						range: [0,1],
						type: Number
					},
					segments: {
						type: 	'elements'
					}
				}),
	Segment: 	_asGroup({
					point: 		_asGroup(_ANIMATABLE_PIVOT),
					handleIn: 	_asGroup(_ANIMATABLE_PIVOT),
					handleOut: 	_asGroup(_ANIMATABLE_PIVOT),
				}),
	SymbolItem: _ANIMATABLE_DEFAULTS,
	Group: 		_ANIMATABLE_DEFAULTS,
	PointText: 	_.extend({}, _ANIMATABLE_DEFAULTS, _ANIMATABLE_GEOMETRY)
}
var PANEL_TOLERANCE = 10;

function limit(nr, mi, ma) {
	if(mi > ma) {
		var tweener = mi + 0;
		mi = ma + 0;
		ma = tweener + 0;
		delete tweener;
	}
	return Math.max(Math.min(nr, ma), mi);
}

function noop(anything) { return anything };

/* jQuery helpers */
$.fn.left = function(x) {
	var $this = $(this);
	if(x) return $this.offset({ left: x });
	return $this.offset().left;
}
$.fn.right = function(x) {
	var $this = $(this);
	if(x) return $this.offset({ left: x - $this.width() });
	return $this.offset().left + $this.width();
}
$.fn.top = function(y) {
	var $this = $(this);
	if(y) return $this.offset({ top: y });
	return $this.offset().top;
}
$.fn.bottom = function(y) {
	var $this = $(this);
	if(y) return $this.offset({ top: y - $this.height() });
	return $this.offset().top + $this.height();
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

function _getAnimationName(item, property, type) {

	var fx = type.match(/^animate(.*)$/);
	fx = fx && _.lowerFirst(fx[1]);

	if(fx === 'then') fx = false;

	property = property.replace(/\./g, '_');

	return (item.name || ('layer' + item.id)) + '_' + (fx || property);
}

function slug(name) {
	return name.replace(/[^a-z0-9_\-]+/g, '_');
}

function _resetSelection() {
	$('#layers')
		.find('.layer').removeClass('selected').end()
		.find('#layer-' + selectionId).removeClass('open').parentsUntil('ul.main').removeClass('open');

	selectionId = false;
	GAME.project.deselectAll();
	_anchorViz.visible = false;
	$('#properties')
		.find('.type').text('').end()
		.find('ul.main').html('<li><label>Waiting for a selection …</label></li>');
}

/* add animations to animation stack for keyframes panel */
animate = function animate(item, property, fr, to, duration, options) {

	var ease 	  = (property === 'frame' ? null : 'cubicOut');
	var startTime = (options && options.delay) || 0;
	var caller 	  = arguments.callee.caller.caller.name;
	//var caller 	  = arguments.callee.caller.name; //animate.caller.name.split(/[A-Z]/g)[0];

	if(caller.match(/^animate([A-Z].*)?$/g) || caller === 'onGameStart' || !caller.length) {
		caller = 'root';
	}

	var track = tracks[item.id] || {
			item: 		item,
			properties: {},
			startTime: 	(new Date).getTime() - animate.startTime,
		};

	var propertyTrack = _.get(track.properties, property, []);
	var options = _.defaults(options, { delay: 0, easing: ease });

	//options.delay += (track.startTime / 1000);

	var keys = {
		from: 		fr,
		to: 		to,
		initValue: 	_.get(item, property),
		duration: 	duration || 1,
		options: 	options,
		caller: 	caller,
		name: 		_getAnimationName(item, property, animate.caller.name),
	};

	var duplicate = _.find(propertyTrack, {options: { delay: options.delay }});

	// make sure start of ani isn't existing already
	if(duplicate) {
		_.pull(propertyTrack, duplicate);
	}
	propertyTrack.push(keys);

	/* calc max duration on track-level */
	track.maxDuration   = Math.max(track.maxDuration || 0, options.delay + (duration || 1));
	/* calc max duration on global level */
	animate.maxDuration = Math.max((animate.maxDuration || 0), track.maxDuration);

	track.properties[property] = propertyTrack;

	tracks[item.id] = track;
	
	_createTracks();

	/* return handles for easier chaining of animations */
	return {
		then: function animateThen(item, property, fr, to, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate(item, property, fr, to, duration, newOptions);
		},
		thenFadeIn: function animateThenFadeIn(item, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate.fadeIn(item, duration, newOptions);
		},
		thenFadeOut: function animateThenFadeOut(item, duration, newOptions) {
			animate._mergeDelays(options, newOptions);
			return animate.fadeOut(item, duration, newOptions);
		},
		stop: noop
	}
};

/* internal calculations */
animate._mergeDelays = function(options, newOptions) {
	newOptions.delay = _.get(newOptions, 'delay', 0) + ((options && options.delay) || 0);
}

animate.load = function(aniName) {
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
	
	var newValue = limit(animatable.from + (range * progress), animatable.from, animatable.to);

	if(animatable.options.onStep) {
		newValue = animatable.options.onStep(newValue, progress, animatable);
	}

	_.set(animatable.item, animatable.property, newValue);

	if(animatable.item.id === selectionId) {
		_changeProp(animatable.property, newValue);
	}

	paper.project.view.requestUpdate();

	return {
		done: 	isDone,
		value: 	newValue
	};
}

animate.startTime = (new Date).getTime();

/* fx */
animate.fadeIn = function animateFadeIn(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	}
	item.visible = true;
	return animate(item, 'opacity', fromv, _.get(options, 'to', 1), duration, options);
};
animate.fadeOut = function animateFadeOut(item, duration, options) {
	var fromv = options && options.from;
	if(fromv !== undefined) {
		item.opacity = fromv;
		delete options.from;
	}
	item.visible = true;
	return animate(item, 'opacity', fromv, _.get(options, 'to', 0), duration, options);
};

/* basic frame animation support */
animate.play = function(item, options) {
	var frames = item.frames;
	var range = frames - item.frame;
	var duration = range / (options && options.fps || 12);

	options.frameDuration = duration / range;
	return animate(item, 'frame', item.frame, frames, duration, options);
}

animate.stop = noop;
animate.stopAll = noop;

/* panel events */
jQuery(function($){
	var downPoint;
	var draggingVisibles;
	var draggingMaster;
	var timeScrubbing;
	var playInterval;
	var lastTime;
	var lastOffset;

	var $keyframesPanel = $('#keyframes');
	var $propertiesPanel = $('#properties');

	$(document)
		/* general panel handling */
		.on('click', '.panel > label .toggle', function(event) {
			var $panel = $(this).closest('.panel');
			$panel.toggleClass('collapsed');
			localStorage.setItem('editor-panels-' + $panel[0].id + '-collapsed', $panel.is('.collapsed'));
		})
		.on('dblclick', '.panel > label', function(event) {
			$(this).find('.toggle').click();
		})
		.on('click', '.panel li .toggleGroup', function(event) {
			$(this).closest('li').toggleClass('open');

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* layer-specific events */
		.on('click', '.panel .layer', function(event) {
			$(this).trigger($.Event('selected', {
				item: GAME.find($(this).data('id'))
			}));

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		.on('selected', '.panel .layer', function(event) {
			var $layer 	 = $(this);
			var id 		 = $layer.data('id');
			var selected = !$layer.is('.selected');

			_resetSelection();

			event.item.selected = selected;

			var $allParents = $layer.parentsUntil('.main').andSelf().filter('.layer').toggleClass('selected', selected);

			if(event.handpicked) {
				$allParents.toggleClass('open', selected);
			}

			$keyframesPanel.toggleClass('hasSelection', selected);

			if(selected) {
				selectionId = id;
				$propertiesPanel.find('.type').text(' OF ' + event.item.className + ' ' + (event.item.name || ''));
				_createProperties(ANIMATABLE_PROPERTIES[event.item.className], $propertiesPanel.find('ul.main').empty(), event.item);

				_anchorViz.position = event.item.pivot || event.item.bounds.center;
				_anchorViz.visible = true;
			}

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* handle visibility of layers */
		.on('mousedown', '.panel .layer .visible', function(event) {
			draggingVisibles = $(this).closest('.layer').is('.hidden') + 0;
			draggingMaster   = this;
		})
		.on('mouseenter', '.panel .layer .visible:visible', function(event) {
			if(draggingVisibles > -1) {

				var $layer = $(this).closest('.layer');
				var hidden = !$layer.is('.hidden');

				if(hidden != draggingVisibles) {
					$layer.find('.visible').click();
				}
			};
		})
		.on('mouseleave', '.panel .layer .visible', function(event) {
			if(draggingVisibles > -1) {
				if(draggingMaster === this) {
					$(this).closest('.layer').toggleClass('hidden', draggingVisibles);
				}
			};
		})
		.on('click', '.panel .layer .visible', function(event) {
			var $layer 	= $(this).closest('.layer');
			var id 		= $layer.data('id');
			var hidden 	= !$layer.is('.hidden');

			$layer.toggleClass('hidden');
			GAME.findAndModify(id, { visible: !hidden });

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* timeline handling */
		.on('mousedown', '.timeline .track', function(event) {

			if($(event.target).is('.keyframe')) {
				_frameDragging = true;
			}

			if(!_frameDragging) {
				timeScrubbing = true;
				event.type = 'mousemove';
				$(this).trigger(event);
				$keyframesPanel.removeClass('hasSelection');
			}
		})
		.on('mousemove', '.timeline .track', function(event) {
			if(!_frameDragging)
				if(timeScrubbing) {

					var $this = $(event.currentTarget);
					var x = event.clientX - $this.offset().left - 1;
					var t = x / TIME_FACTOR;

					if(event.shiftKey) {
						var property = $this.closest('li.timeline').data('property');
						var id 		 = $this.closest('li.item').data('id');
						var myTracks = tracks[id].properties[property].slice(0);

						var snapKeys = _.flatMap(myTracks, function(track) {
							return [_getStartTime(track), _getEndTime(track)];
						});
						snapKeys.push(0);
						snapKeys.push(animate.maxDuration);
						
						t = _.reduce(snapKeys, function(prev, curr) {
							return Math.abs(curr - t) < Math.abs(prev - t) ? curr : prev;
						});
					}
					GAME && GAME.setTime(t, $this);
				}
		})
		.on('dblclick', '#keyframes .keyframe', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;

			$('#layers').find('#layer-' + item.id).trigger($.Event('selected', {item: item}));
			$('#properties').find('input[data-prop="' + prop + '"]').focus();

			GAME.setTime($this.data('time'));

			event.stopImmediatePropagation();
		})
		.on('dblclick', '#keyframes .track', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;
			var value 	= _.get(item, prop);

			animate(item, prop, value, value, -1, { delay: GAME.time });
		})
		.on('click', '#keyframes .animate-btn', function(event) {
			var item = GAME.find(selectionId);
			var track = {
				item: 		item,
				properties: {
					test: [{
						from: 	  0,
						to:  	  1,
						initValue: 0,
						duration: 1,
						options: { delay: 0.5 }
					}]
				},
				startTime: 	animate.startTime,
			};
			alert('Not yet implemented.');
			//tracks[item.name] = track;
			//_createTracks();
		})
		/* interactivity of property inputs */
		.on('change', '#properties :input', function(event) {
			var $this = $(this);
			var oldValue = $this.data('oldValue') || this.defaultValue;
			var value = $this.is(':checkbox') ? $this.is(':checked') : $this.val();
			var prop  = $this.data('prop');
			var index = 0;
			var props = {};
			var item  = GAME.find(selectionId);

			if(index = prop.match(/^segments\.(\d+)\.(.*)/)) {

				new Undoable(function() {
					_.set( item.segments[parseInt(index[1])], index[2], value );
					_changeProp(index[2], value);
				}, function() {
					_.set(item.segments[parseInt(index[1])], index[2], oldValue);
					_changeProp(index[2], oldValue);
				});

			} else {
				props[prop] = value;

				new Undoable(function() {
					_.set(item, prop, value);
					_changeProp(prop, value);
				}, function() {
					_.set(item, prop, oldValue);
					_changeProp(prop, oldValue);
				});
			}

			$this.data('oldValue', value);
		})
		.on('keyup', '#properties :input', function(event) {
			if(event.shiftKey) {
				var delta = 0;
				switch(event.key) {
					case 'ArrowDown':
						delta = -9;
						break;
					case 'ArrowUp':
						delta = 9;
						break;
					default: break;
				}
				if(delta !== 0) {
					var $this = $(this);
					var step  = parseFloat($this.attr('step'));
					var range = [parseFloat($this.attr('min')), parseFloat($this.attr('max'))];
					var value = parseFloat($this.val()) + step * delta;

					if(isNaN(range[0])) range[0] = -10000;
					if(isNaN(range[1])) range[1] = 10000;

					// we limit to min/max attrs and hack rounding errors by setting a limit on the decimals
					$this.val( _.round( limit(value, range[0], range[1]), _decimalPlaces(step * 10)) );
				}
			}
		})
		/* allow number manipulation using the mousewheel (with a small lag) */
		.on('mousewheel', '#properties :input', _.debounce(function(event) {
			$(this).trigger('change');
		}, 600))
		.on('click', '.panel .audio', function() {
			$(this).data('wave').play();
		})
		/* all resets onMouseUp */
		.on('mouseup', function() {
			timeScrubbing = false;
			_frameDragging = false;
			draggingVisibles = -1;
			delete draggingMaster;
			$animationValue.text('');
		})
		.on('keyup', function(event) {
			if(!$(event.target).is(':input'))
				switch(event.key) {
					/* play/pause on spacebar */
					case ' ':
						playing = !playing;

						if(playing) {
							lastTime = (new Date).getTime();
							playInterval = setInterval(function(){
								if(GAME.time >= animate.maxDuration) {
									clearInterval(playInterval);
									GAME.setTime(0);
								} else {
									var delta = ((new Date).getTime() - lastTime) / 1000;
									GAME.setTime(GAME.time + delta);
									lastTime = (new Date).getTime();
								}
							}, 1000/12);
						} else {
							clearInterval(playInterval);
						}
						return false;
					/* prevFrame */
					case ',':
						GAME.setTime( limit(GAME.time - 1/12, 0, animate.maxDuration) );
						return false;
					/* nextFrame */
					case '.':
						GAME.setTime( limit(GAME.time + 1/12, 0, animate.maxDuration) );
						return false;
					/* prevFrame * 10 */
					case ';':
						GAME.setTime( limit(GAME.time - 1/2, 0, animate.maxDuration) );
						return false;
					/* nextFrame * 10 */
					case ':':
						GAME.setTime( limit(GAME.time + 1/2, 0, animate.maxDuration) );
						return false;	
					/* zoomIn */
					case '+':
						GAME.project.view.zoom += .1;
						_anchorViz.scale(0.9);
						return false;
					/* zoomOut */
					case '-':
						GAME.project.view.zoom -= .1;
						_anchorViz.scale(1.1);
						return false;
					/* zoomReset */
					case '0':
						if(event.ctrlKey || event.metaKey) {
							GAME.project.view.zoom = 1.5;
							_anchorViz.scale(1);
							return false;
						}
						break;
					case 'o':
						if(selectionId) {
							$('#properties input[data-prop=opacity]').focus()[0].select();
						}
						break;
					case 'r':
						if(selectionId) {
							$('#properties input[data-prop=rotation]').focus()[0].select();
						}
						break;
					case 'z':
						if(event.ctrlKey || event.metaKey) {
							history.back();
						}
						break;
					case 'u':
						if(event.ctrlKey || event.metaKey) {
							history.forward();
						}
						break;
				}
		})
		/* time control with cmdKey + mousewheelX */
		.on('mousewheel', function(event) {
			if(event.metaKey) {
				var delta = { x: event.originalEvent.deltaX, y: event.originalEvent.deltaY };

				if(Math.abs(delta.x) > 0.1) {
					GAME.setTime(GAME.time + delta.x * 1/24);
				}

				event.preventDefault();
				event.stopImmediatePropagation();
			}
		})
		/* file dropping */
		.on('dragover', function(event) { 
			event.preventDefault();
			$('#dummy').addClass('dropping'); 
		})
		.on('drop', 	function(event) { 
			$('#dummy').removeClass('dropping'); 
		})
		.on('dragleave', '#dropzone', function(event) {
			event.preventDefault();
			$('#dummy').removeClass('dropping'); 	
		});

	/* temporarily save all DOM "reactive" elements */
	layerTemplate 	 = $('template#layer-panel-item')[0].content.children[0].outerHTML;
	keyItemTemplate  = $('template#keyframe-panel-item')[0].content.children[0].outerHTML;
	propItemTemplate = $('template#property-panel-item')[0].content.children[0].outerHTML;
	audioTemplate 	 = $('template#audio-panel-item')[0].content.children[0].outerHTML;
	$time 			 = $('#keyframes .description time');
	$animationValue  = $('#keyframes .description output');
});

/* create layers (UI) for layer panel */
function _createLayers(layers, $layers) {
	var layerTmpl  = _.template(_.unescape(layerTemplate));

	_.each(layers, function(layer) {
		if(layer) {
			var $layer = $(layerTmpl({
							name: 			layer.name || ('[Layer ' + layer.id + ']'),
							hasChildren: 	!!(layer.children && layer.children.length),
							hidden: 		!layer.visible,
							id: 			layer.id
						})).data('id', layer.id);

			if(layer.children && layer.children.length) {
				var $sublayers = $('<ul>').appendTo($layer);
				_createLayers(layer.children, $sublayers);
			}

			$layers.append($layer);
		}
	});
}

/* create timeline tracks (UI) for keyframes panel */
function _createTracks() {
	var keyItemTmpl = _.template(_.unescape(keyItemTemplate));
	var $tracks 	= $('#keyframes ul.main').empty();

	_.each(tracks, function(track) {
		if(track) {

			var properties = _.mapValues(track.properties, _.partial(_.sortBy, _, 'options.delay'));

			var $keys = $(keyItemTmpl({
					maxDuration: 	_.round(track.maxDuration, 2),
					name: 			track.item.name,
					type: 			track.item.className,
					properties: 	properties,
					TIME_FACTOR: 	TIME_FACTOR,
					getTrigger: 	function(range) { 
						switch(range.caller) {
							case '':
							case 'root':
								return '';
						}
						return ' triggered';
					}
				})).data({id: track.item.id, track: track, element: $keys });
			
			var $frames = $tracks.append($keys).find('.keyframe');

			$frames.each(function() {
				var $this = $(this);
				var y = $this.top() - 7;

				var $lastRange = $this.prev('.range');
				var $nextRange = $this.next('.range');

				$this.draggable({ 
					containment: [ $lastRange.left() + 1, y, $nextRange.right() - 1, y],
					cursor: 'pointer',
					start: 	function() { _frameDragging = true; },
					stop: 	function() { 
						_frameDragging = false; 
						_createTracks();
					},
					drag: 	function(event, ui) { 
						_frameDragging = true;

						var index 	 		= $this.closest('.track').find('.keyframe').index($this);
						var property 		= $this.closest('li.timeline').data('property');
						var trackIndex 		= parseInt(index/2);
						var currentTrack 	= $this.closest('li.item').data('track').properties[property];
						var currentKey 		= currentTrack[trackIndex];

						var x 				= ui.position.left - 1;
						var t 				= x / TIME_FACTOR;

						var $nextRange 		= $this.next('.range');
						var $prevRange 		= $this.prev('.range');

						$nextRange.css({left: x});

						if(index % 2) {
							currentKey.duration = t - _getStartTime(currentKey);

							$prevRange.width(x+1-_getStartTime(currentKey) * TIME_FACTOR);

							if(currentTrack[trackIndex+1]) {
								$nextRange.width((_getStartTime(currentTrack[trackIndex+1]) - t) * TIME_FACTOR);
							}
						} else {
							currentKey.duration += (currentKey.options.delay - t);
							currentKey.options.delay = t;
							$prevRange.width(x+1);
							$nextRange.width(currentKey.duration * TIME_FACTOR);
						}
					}
				});
			});
		}
	});
}

/* create properties (UI) for properties panel */
function _createProperties(properties, $props, item, subitem, path) {
	var propTmpl  = _.template(_.unescape(propItemTemplate));

	path = path ? _.trim(path, '.') + '.' : '';

	_.each(properties, function(prop, name) {
		if(name !== 'type') {
			var step 	  = 1;
			var keyed  	  = '';

			/* create step for numeric inputs */
			switch(name) {
				default:
					if(prop.range) {
						step = (prop.range[1] - prop.range[0]) / 100;
					}
					break;
				case 'frame':
				case 'rotation':
					step = 1;
					break;
			}

			/* highlighting of animated/triggered properties */
			var property 	  = path + name;
			var propertyTrack = tracks[item.id] && _.get(tracks[item.id].properties, property);

			if(propertyTrack) {
				keyed += ' animated';
				if(_.reject(propertyTrack, { caller: 'root' }).length) {
					keyed += ' triggered';
				}
			}

			/* actual creation of property visualization */
			var config = _.extend({}, { 
							name: 		name + '',
							item: 		item,
							path: 		path,
							keyed:  	keyed,
							range: 		['', ''],
							step: 		step,
							type: 		prop.type,
							value: 		_.get(subitem || item, property)
						}, prop);
			var $prop = $(propTmpl(config));

			if(config.type === 'elements') {
				var elements = {};

				_.each(_.get(subitem || item, name), function(element, key) {
					elements[key] = ANIMATABLE_PROPERTIES[element.className];
				});

				config.content = elements;
				config.type = 'group';
			}

			if(config.type === 'group') {
				var $subprops = $('<ul>').appendTo($prop);
				_createProperties(config.content, $subprops, item, _.get(item, name), property);
			}
			$props.append($prop);
		}
	});
}

/* create waves (UI) for audio panel */
function _createAudio() { 
	var $sounds 	= $('.panel#audio').find('ul.main').empty();
	var audioTmpl 	= _.template(_.unescape(audioTemplate));
	var wave 		= false;

	_.each(GAME.sounds, function(sound, name) {

		var $sound = $(audioTmpl({
			name: name,
			slug: slug(name)
		}));

		$sounds.append($sound);

		wave = WaveSurfer.create({
			container: '#audio_' + slug(name),
			cursorColor: 	'crimson',
			height: 		40,
			normalize: 		true,
			progressColor: 	'crimson',
			waveColor: 		'white'
		});
		wave.load('audio/' + name);
		$sound.data('wave', wave);
	});

	wave.on('ready', function() { wave.play(); });
}

/* colorisation & gradient styles for timeline tracks in keyframes panel */
function _getStartStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/\.([^\.]+)$/, '.content.$1'));

	if(propertyConfig) {
		var currentTrack = tracks[key];
		var value;

		if(_.isEqual(propertyConfig.range, [0,1])) {
			if(key === 0) {
			 	value = currentTrack.initValue;
			} else {
				value = _.get(currentTrack, 'from', tracks[key-1].to);
			}
			var color = _.repeat(parseInt(value * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			color = new paper.Color({hue: value, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}

		return 'background:#' + color;
	} else console.error('No config found for', property, property.replace(/\.([^\.]+)$/, '.content.$1'), ANIMATABLE_PROPERTIES[type]);
}
function _getEndStyle(property, track, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/\.([^\.]+)$/, '.content.$1'));

	if(propertyConfig) {
		if(propertyConfig.range && _.isEqual(propertyConfig.range, [0,1])) {
			var color = _.repeat(parseInt(track.to * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			var color = new paper.Color({hue: track.to, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}
		return 'background:#' + color;
	}
}
function _getRangeStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/\.([^\.]+)$/, '.content.$1'));

	if(propertyConfig) {

		var currentKey 	= tracks[key];
		var lastKey 	= tracks[key-1];
		var to 			= currentKey.to;
		var begin;
		var end;

		if(key === 0) {
			currentKey.from = currentKey.initValue;
		} else {
			currentKey.from = _.isNil(currentKey.from) ? lastKey.to : currentKey.from;
		}

		if(propertyConfig.range && _.isEqual(propertyConfig.range, [0,1])) {
			begin = _.repeat(parseInt(currentKey.from * 15).toString(16), 3);
			end   = _.repeat(parseInt(to * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			begin = new paper.Color({hue: currentKey.from, saturation: 1, lightness: .5}).toCSS(true).slice(1);
			end   = new paper.Color({hue: to, 			   saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}

		if(begin && end) {
			return 'background:linear-gradient(90deg,#' + begin + ',#' + end + ')';
		}
	}
}

function _getStartTime(track) 	{ return track.options.delay; 					}
function _getEndTime(track) 	{ return _getStartTime(track) + track.duration; }

/* game engine for loading SVG skeletons, extended to editing capabilities */
Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options || {};
	self.symbols 		= [];
	self.sounds 		= {};
	self.time 			= 0;

	GAME = self;

	self.playSound = function(name, options) {
		var config = _.extend({ name: name, src: [name] }, options);
		var sound  = _.get(self.sounds, name);

		config.src = _.map(config.src, function(src) {
			if(!src.match(/.*\.[^\.]+$/i)) {
				name += '.m4a';
				return 'audio/' + src + '.m4a';
			}
			return src;
		});

		if(!sound) {
			sound = self.sounds[name] = {
				source: new Howl(config)
			};
		}
		_createAudio();
	};
	self.stopSound = noop;

	self.resize = function(event) {
		if(self.container)
			self.container.position = project.view.center;
	};

	self.reset = function() {
		self.dragging = false;
	}

	self.setTime = function(seconds, $target) {
		var time = Math.max(seconds, 0);

		self.time = time;

		var $inputs = $('#properties').find('li').removeClass('keyed');

		$('.timeline .scrubber').each(function(){
			var $scrubber 	= $(this);
			var data 		= $scrubber.closest('li.item').data();
			var property 	= $scrubber.closest('li.timeline').data('property');
			var currentTrack;

			$time.text(_.round(time, 2) + 's');
			$scrubber.css('left', time * TIME_FACTOR);

			var allTracks = tracks[data.id].properties[property];

			currentTracks = _.sortBy(_.filter(allTracks, function(track) {
				return track.options.delay <= time + _.get(track.options, 'frameDuration', 1/24);
			}), 'options.delay');

			_.each(currentTracks, function(track, id) {
				if(_.inRange(time, _getStartTime(track), _getEndTime(track) + _.get(track.options, 'frameDuration', 1/24))) {
					currentTrack = track;
					currentTrack.id = id;
					return false;
				}
			});

			var $track  	= $scrubber.closest('.track');
			var hasActives 	= false;
			$track.find('.keyframe').removeClass('active');

			if(currentTrack) {
				var isFirstFrame = (time - _getStartTime(currentTrack)) <= 0.05;
				var isLastFrame  = (_getEndTime(currentTrack) - time)   <= 0;

				if(isFirstFrame) {
					$track.find('.keyframe').eq( currentTrack.id * 2 ).addClass('active');
				} else if(isLastFrame) {
					$track.find('.keyframe').eq( currentTrack.id * 2 + 1).addClass('active');
				}

				hasActives = isFirstFrame || isLastFrame;
			} else {
				currentTrack = _.maxBy(allTracks, 'options.delay');
			}

			if(currentTrack) {
				var startTime 	= _getStartTime(currentTrack);
				var endTime 	= _getEndTime(currentTrack);
				var t 			= Math.max((time - startTime) / (endTime - startTime), 0);

				currentTrack.item 		= tracks[data.id].item;
				currentTrack.property 	= property;
				
				if(hasActives) {
					if(data.id === selectionId) {
						$inputs.find('input[data-prop="' + property + '"]').parent().addClass('keyed');
					}
				}

				var ani = animate.step(currentTrack, t);

				if($target && $target.length)
					if($.contains($target[0], $scrubber[0])) {
						$animationValue.text(property + ' = ' + _.round(ani.value,2));
					}
			}
		});

		self.time = time;
	}

	project.importSVG(self.file, function(item) {
		self.container 		= item;
		self.scene 			= self.container.children;

		self.find = function(id) {
			return self.container.getItem({ id: id });
		};

		self.findAndModify  = function(id, props) {
			return self.find(id).set(props);
		};

		_.each(project.symbolDefinitions, function(definition) {
			if(definition.item.name)
				self.symbols[definition.item.name] = definition;
		});

		var layers = self.scene.slice(0).reverse();
		var $borderDummy = $('#border-dummy');

		self.resize({size: project.view.viewSize});
		item.position = project.view.center;

		// selection of elements (by clicking them)
		project.view.onMouseDown = function onCanvasMouseDown(event) {
			if(!(event.event.altKey || event.event.metaKey)) {
				if(!isNaN(event.target.id)) {
					$('#layer-' + event.target.id).trigger($.Event('selected', { item: event.target, handpicked: true }));
				}
				else _resetSelection();
			} else {
				event.event.preventDefault();
				event.event.stopImmediatePropagation();
			}
		};
		// allow moving of canvas when commandKey is held
		project.view.onMouseDrag = function onCanvasMouseDrag(event) {
			if(event.event.metaKey) {
				if(selectionId) {
					var selectedItem = self.find(selectionId);
					selectedItem.position = selectedItem.position.add(event.delta);

					if(selectedItem.pivot) {
						//_changeProp('pivot.x', selectedItem.pivot.x);
						//_changeProp('pivot.y', selectedItem.pivot.y);
						_anchorViz.position = selectedItem.pivot;
					} else {
						_anchorViz.position = selectedItem.bounds.center;
					}

					_changeProp('position.x', selectedItem.position.x);
					_changeProp('position.y', selectedItem.position.y);
				} else {
					item.position = item.position.add(event.delta);
				}

				event.event.preventDefault();
				event.event.stopImmediatePropagation();
			}
		};

		if(onLoad) onLoad(self.scene, self.container);

		_anchorViz = new paper.Group([
			new paper.Path.Circle({
				center: 		project.view.center,
				radius: 		2,
				strokeWidth: 	2.5,
				strokeColor: 	'rgba(127,127,127,.4)',
				fillColor: 		'rgba(255,255,255,.4)',
			}),
			new paper.Path.Circle({
				center: 		project.view.center,
				radius: 		2,
				strokeColor: 	'cyan'
			}),
			new paper.Path.Line({
				from: 	project.view.center.subtract(new paper.Point(0, 2)), 
				to: 	project.view.center.subtract(new paper.Point(0, 4)),
				strokeColor: 	'cyan'
			}),
			new paper.Path.Line({
				from: 	project.view.center.add(new paper.Point(0, 2)), 
				to: 	project.view.center.add(new paper.Point(0, 4)),
				strokeColor: 	'cyan'
			}),
			new paper.Path.Line({
				from: 	project.view.center.subtract(new paper.Point(2, 0)), 
				to: 	project.view.center.subtract(new paper.Point(4, 0)),
				strokeColor: 	'cyan'
			}),
			new paper.Path.Line({
				from: 	project.view.center.add(new paper.Point(2, 0)), 
				to: 	project.view.center.add(new paper.Point(4, 0)),
				strokeColor: 	'cyan'
			})
		]);

		_anchorViz.visible = false;

		_anchorViz.onMouseDown = function(event) {
			if(event.event.altKey) {
				this.data.oldPosition = event.point; 
			}
		};

		_anchorViz.onMouseDrag = function(event) {
			if(event.event.altKey) {
				this.position = event.point;
				GAME.findAndModify(selectionId, { pivot: this.position });
			}
		};

		_anchorViz.onMouseUp = function(event) {
			var item = this;

			if(event.event.altKey)
				new Undoable(function(){ 
					item.position = event.point;
					GAME.findAndModify(selectionId, { pivot: item.position });
				}, function(){ 
					if(item.data.oldPosition) {
						item.position = item.data.oldPosition;
						GAME.findAndModify(selectionId, { pivot: item.position });
					}
				}, 'Setting pivot of ' + GAME.find(selectionId).name, true);
		};

		self.container.appendTop(_anchorViz);

		_createLayers(layers, $('.panel#layers ul').empty());

		$('.panel').each(function() {
			var $panel = $(this);
			var collapsed = localStorage.getItem('editor-panels-' + this.id + '-collapsed');

			$panel
				.draggable({ 
					handle: 		'>label', 
					containment: 	[0, 0, $(window).width() - $panel.width(), $(window).height() - $panel.height()],
					drag: function(event, ui) {

						$borderDummy.prop('class', '');

						if(ui.position.left < PANEL_TOLERANCE) {
							$borderDummy.addClass('snappable-left');
						} else if($panel.right() > $(window).width() - PANEL_TOLERANCE) {
							$borderDummy.addClass('snappable-right');
						} else if(ui.position.top < PANEL_TOLERANCE) {
							$borderDummy.addClass('snappable-top');
						} else if($panel.bottom() > $(window).height() - PANEL_TOLERANCE) {
							$borderDummy.addClass('snappable-bottom');
						}
					},
					stop: function() { $borderDummy.prop('class', ''); }
				})
				.toggleClass('collapsed', collapsed == 'true');
		});
	});

	return this;
}