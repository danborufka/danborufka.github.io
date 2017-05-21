// animation editor engine
// TODOS:
// o load files properly on "bodyDrop"
// o #properties panel: refactor from ranges (keyframe pairs) to single keyframes
// ø #properties panel: fix positional props like pivot
// o #keyframes panel:  fix changing of animation keyframes' timing from there (dragging of keys)
// o #layer panel: keep track of layer visibility
// o performance: use _createTrack, _createProp, and _createLayer for single elements rather than rerendering the whole panel every time
// o audio panel: tie sound timing to global game time
// o (add node module for packaging)
// o node module for server-side saving & loading of JSON

var tracks   		= {};
var events 			= {};

var currentGame;

var TIME_FACTOR 	= 10;

var layerTemplate;
var keyItemTemplate;
var propItemTemplate;
var audioTemplate;

var selectionId;

var $time;
var $animationValue;

var snapKeyframes 	= new Snappables(.4);

var _playing 		= false;
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

function _getAnimationName(item, property, type) {

	var fx = type && type.match(/^Danimator(.*)$/);
	fx = fx && _.lowerFirst(fx[1]);

	if(fx === 'then') fx = false;

	property = property.replace(/\./g, '_');

	return (item.name || ('layer' + item.id)) + '_' + (fx || property);
}
function _resetSelection() {
	$('#layers')
		.find('.layer').removeClass('selected').end()
		.find('#layer-' + selectionId).removeClass('open');//.parentsUntil('ul.main').removeClass('open');

	selectionId = false;
	currentGame.project.deselectAll();
	_anchorViz.visible = false;
	$('#properties')
		.find('.type').text('').end()
		.find('ul.main').html('<li><label>Waiting for a selection …</label></li>');
}
function alert(msg) 	{
	console.log('ALEEEERT!', msg);
}
function slug(name) 	{ return name.replace(/[^a-z0-9_\-]+/g, '_'); }
function noop(anything) { return anything; };

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

function Snappables(tolerance) {
	var self = this;
	
	self.list 		= [];
	self.tolerance 	= tolerance;

	self.add = function(snap) {
		if(!_.isArray(snap)) snap = [snap];
		self.list = _.union(self.list, snap);
		return self;
	};
	self.remove = function(snap) {
		self.list = _.pull(self.list, snap);
		return self;
	};
	self.snap = function(value) {
		var result = value;
		self.list = self.list.sort();
		_.each(self.list, function(item) {
			if(Math.abs(item - value) < self.tolerance) {
				result = item;
				return false;
			}
		});
		return result;
	};
	return self;
}

/* override animate method to add animations to animation stack for keyframes panel */
Danimator.animate = function DanimatorAnimate(item, property, fr, to, duration, options) {

	var ease 	  = (property === 'frame' ? null : 'cubicOut');
	var startTime = (options && options.delay) || 0;
	var caller 	  = arguments.callee.caller.caller.name;

	if(caller.match(/^Danimator([A-Z].*)?$/g) || caller === 'onGameStart' || !caller.length) {
		caller = 'root';
	}

	var track = tracks[item.id] || {
			item: 		item,
			properties: {},
			startTime: 	(new Date).getTime() - Danimator.startTime,
		};

	var propertyTrack 	= _.get(track.properties, property, []);
	var options 		= _.defaults(options, { delay: 0, easing: ease });

	var key = {
		from: 		fr,
		to: 		to,
		initValue: 	_.get(item, property),
		duration: 	duration || 1,
		options: 	options,
		caller: 	caller,
		name: 		_getAnimationName(item, property, Danimator.caller && Danimator.caller.name),
		id: 		propertyTrack.length
	};

	var duplicate = _.find(propertyTrack, {options: { delay: options.delay }});
	// make sure start of ani isn't existing already
	if(duplicate) {
		_.pull(propertyTrack, duplicate);
	}
	propertyTrack.push(key);

	/* calc max duration on track-level */
	track.maxDuration   = Math.max(track.maxDuration || 0, options.delay + (duration || 1));
	/* calc max duration on global level */
	Danimator.maxDuration = Math.max((Danimator.maxDuration || 0), track.maxDuration);

	track.properties[property] = propertyTrack;
	tracks[item.id] = track;

	_.debounce(_createTracks, 1000)();

	/* return handles for easier chaining of animations */
	return {
		then: function DanimatorThen(item, property, fr, to, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator(item, property, fr, to, duration, newOptions);
		},
		thenFadeIn: function DanimatorThenFadeIn(item, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator.fadeIn(item, duration, newOptions);
		},
		thenFadeOut: function DanimatorThenFadeOut(item, duration, newOptions) {
			Danimator._mergeDelays(options, newOptions);
			return Danimator.fadeOut(item, duration, newOptions);
		},
		stop: noop
	}
};

Danimator.onStep = function(animatable, value) {
	if(animatable.item.id === selectionId) {
		_changeProp(animatable.property, value);
	}
}
Danimator.onMorph = function() {
	_createLayers(Danimator.layers, $('.panel#layers ul').empty());
}

Danimator.interactive = true;

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
				item: currentGame.find($(this).data('id'))
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

			event.item.fullySelected = selected;

			var $allParents = $layer.parentsUntil('.main').andSelf().filter('.layer').toggleClass('selected', selected);

			// TODO: scroll layers to pos

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
			currentGame.findAndModify(id, { visible: !hidden });

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		.on('input', '.zoom', function(event) {
			var zoom = Danimator.limit($(this).val(), 1, 100)/100;
			TIME_FACTOR = 20 * zoom;
			_createTracks();
		})
		/* timeline handling */
		.on('mousedown', '.timeline .track', function(event) {

			if($(event.target).is('.keyframe')) {
				_frameDragging = true;
			}

			if(!_frameDragging) {
				timeScrubbing = true;
				event.type = 'mousemove';
				$(this).trigger(event).addClass('scrubbing');
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
						t = snapKeyframes.snap(t);
					}
					currentGame && currentGame.setTime(t, $this);
				}
		})
		.on('mouseup', '.timeline .track', function(event) {
			$(this).removeClass('scrubbing');
		})
		.on('dblclick', '#keyframes .keyframe', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;

			$('#layers').find('#layer-' + item.id).not('.selected').trigger($.Event('selected', {item: item}));
			
			var $input = $('#properties').find('input[data-prop="' + prop + '"]');
			$input.parentsUntil('ul.main').filter('li').addClass('open');
			$input.focus();

			currentGame.setTime($this.data('time'));

			event.stopImmediatePropagation();
		})
		.on('dblclick', '#keyframes .track', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;
			var value 	= _.get(item, prop);

			Danimator(item, prop, value, value, -1, { delay: currentGame.time });
		})
		.on('click', '#keyframes .animate-btn', function(event) {
			var item = currentGame.find(selectionId);
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
				startTime: 	Danimator.startTime,
			};
			alert('Not yet implemented.');
			//tracks[item.name] = track;
			//_createTracks();
		})
		/* interactivity of property inputs */
		.on('change', '#properties :input', function(event) {
			var $this 	 = $(this);
			var prop  	 = $this.data('prop');
			var data 	 = $this.closest('li').data();
			var oldValue = $this.data('oldValue') || this.defaultValue;
			var value 	 = $this.is(':checkbox') ? $this.is(':checked') : $this.val();
			var item  	 = currentGame.find(selectionId);

			var index 	 = 0;
			var props 	 = {};
			var converter;

			if(converter = _['to' + _.capitalize(data.type)]) {
				value = _['to' + _.capitalize(data.type)](value);
			}

			if($this.prop('type') === 'number') {
				value = Number(value);
			}

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

			if(data.track) {
				var currentTrack = tracks[selectionId].properties[prop][data.track.id];

				if(currentGame.time === _getStartTime(currentTrack)) {
					currentTrack.from = value;
					if(data.track.id === 0) {
						currentTrack.initValue = value;
					}
				} else {
					currentTrack.to = value;
				}
				_createTracks();
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
					$this.val( _.round( Danimator.limit(value, range[0], range[1]), _decimalPlaces(step * 10)) );
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
						_playing = !_playing;

						if(_playing) {
							lastTime = (new Date).getTime();
							playInterval = setInterval(function(){
								if(currentGame.time >= Danimator.maxDuration) {
									clearInterval(playInterval);
									currentGame.setTime(0);
								} else {
									var delta = ((new Date).getTime() - lastTime) / 1000;
									currentGame.setTime(currentGame.time + delta);
									lastTime = (new Date).getTime();
								}
							}, 1000/12);
						} else {
							clearInterval(playInterval);
						}
						return false;
					/* prevFrame */
					case ',':
						currentGame.setTime( Danimator.limit(currentGame.time - 1/12, 0, Danimator.maxDuration) );
						return false;
					/* nextFrame */
					case '.':
						currentGame.setTime( Danimator.limit(currentGame.time + 1/12, 0, Danimator.maxDuration) );
						return false;
					/* prevFrame * 10 */
					case ';':
						currentGame.setTime( Danimator.limit(currentGame.time - 1/2, 0, Danimator.maxDuration) );
						return false;
					/* nextFrame * 10 */
					case ':':
						currentGame.setTime( Danimator.limit(currentGame.time + 1/2, 0, Danimator.maxDuration) );
						return false;	
					/* zoomIn */
					case '+':
						currentGame.project.view.zoom += .1;
						_anchorViz.scale(0.9);
						return false;
					/* zoomOut */
					case '-':
						currentGame.project.view.zoom -= .1;
						_anchorViz.scale(1.1);
						return false;
					/* zoomReset */
					case '0':
						if(event.ctrlKey || event.metaKey) {
							currentGame.project.view.zoom = 1.5;
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
					var time = currentGame.time + delta.x * 1/24;
					if(event.shiftKey) {
						time = snapKeyframes.snap(time);
					}
					currentGame.setTime(time);
				}

				event.preventDefault();
				event.stopImmediatePropagation();
			}
		})
		// file dropping 
		.on('dragover', 'body', function(event) { 
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#dummy').addClass('dropping'); 
		})
		.on('drop', '#dummy', function(event) { 
			event.preventDefault();

			var data = new FormData();

			_.each(event.originalEvent.dataTransfer.items, function(item){
				console.log('item', item);
			});

	        _.each(event.originalEvent.dataTransfer.files, function(file, i) {
	        	var type 	  = file.type.split('/');
	        	var extension = _.last(file.name.split('.'));
	        	var reader 	  = new FileReader();

	        	reader.onload = function(event) {
	        		currentGame.load(event.target.result);

	        		switch(type[1]) {
		        		case 'javascript':
	        				console.log('script(s) on board.', extension, file);
		        			break;
		        		case 'svg+xml':
		        			console.log('vector on board.');
		        			break;
		        		default:
		        			console.error('not found!');
		        	}
	        		//currentGame.load({svg: event.target.result});
  				};

  				if(type[0] === 'text') {
  					reader.readAsText(file);
  				} else {
  					reader.readAsBinaryString(file);
  				}
	            data.append('file_' + i, file);
	        });
			$('#dummy').removeClass('dropping'); 
		})
		.on('dragleave', '#dummy', function(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#dummy').removeClass('dropping'); 	
		});
		//*/

	/* temporarily save all "reactive" DOM elements */
	layerTemplate 	 = $('template#layer-panel-item')[0].content.children[0].outerHTML;
	keyItemTemplate  = $('template#keyframe-panel-item')[0].content.children[0].outerHTML;
	propItemTemplate = $('template#property-panel-item')[0].content.children[0].outerHTML;
	audioTemplate 	 = $('template#audio-panel-item')[0].content.children[0].outerHTML;
	$time 			 = $('#keyframes .description time');
	$animationValue  = $('#keyframes .description output');
});

/* create layers (UI) for layer panel */
function _createLayers(layers, $layers) {
	var layerTmpl  = _.template(_.unescape(layerTemplate));	// create templating function from template#layer-panel-item

	_.each(layers, function(layer) {
		if(layer) {
			var $layer = $(layerTmpl({
							name: 			layer.name || ('[Layer ' + layer.id + ']'),
							hasChildren: 	!!(layer.children && layer.children.length),
							hidden: 		!layer.visible,
							id: 			layer.id
						})).data('id', layer.id);
			layer.data.onChangeVisibility = function() {
				$layer.toggleClass('');
			};

			/* sublayer support */
			if(layer.children && layer.children.length) {
				var $sublayers = $('<ul>').appendTo($layer);
				_createLayers(layer.children, $sublayers);
			}
			$layers.append($layer);
		}
	});
}

/* UI helpers for keyframes panel */
function _getStartTime(track) 	{ return track.options.delay; 					}
function _getEndTime(track) 	{ return _getStartTime(track) + track.duration; }

/* colorisation & gradient styles for timeline tracks in keyframes panel */
function _getStartStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

	if(propertyConfig) {
		var currentTrack = tracks[key];
		var value;

		if(_.isEqual(propertyConfig.range, [0,1])) {					// if min/max of prop between 0 and 1
			if(key === 0) {
			 	value = currentTrack.initValue;
			} else {
				value = _.get(currentTrack, 'from', tracks[key-1].to);
			}
			var color = _.repeat(parseInt(value * 15).toString(16), 3);	// show property as black/white gradient
		} else if(_.last(property.split('.')) === 'hue') {				// show hue as colored gradient
			color = new paper.Color({hue: value, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}

		return 'background:#' + color;
	} //else console.error('No config found for', property, property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'), ANIMATABLE_PROPERTIES[type]);
}
function _getRangeStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

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
function _getEndStyle(property, track, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

	if(propertyConfig) {
		if(propertyConfig.range && _.isEqual(propertyConfig.range, [0,1])) {
			var color = _.repeat(parseInt(track.to * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			var color = new paper.Color({hue: track.to, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}
		return 'background:#' + color;
	}
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

				snapKeyframes.add( $this.data('time') );

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

						if(event.shiftKey) {
							t = snapKeyframes.snap(t);
							x = t * TIME_FACTOR;
							ui.position.left = x + 1;
						}
						currentGame.setTime(t);

						var $nextRange 		= $this.next('.range');
						var $prevRange 		= $this.prev('.range');

						$nextRange.css({left: x});	// position "range" right after keyframe

						if(index % 2) {	// every other keyframe ends a "range"
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
			var keyed  	  = [];

			/* calc step for numeric inputs */
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
				keyed.push('animated');

				var isKey = _.find(propertyTrack, {options: { delay: currentGame.time }});

				if(!isKey) {
					isKey = _.some(propertyTrack, function(track) {
						return _getEndTime(track) === currentGame.time;
					});
				}
				
				if(isKey) keyed.push('keyed');

				if(_.reject(propertyTrack, { caller: 'root' }).length) {
					keyed.push('triggered');
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
			var $prop = $(propTmpl(config)).data('track', _.first(propertyTrack));

			/* special case for Segments and other "subelements" of items */
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

	_.each(Danimator.sounds, function(sound, name) {
		var config = {
			container: 		'#audio_' + slug(name),
			cursorColor: 	'crimson',
			fillParent: 	false,
			loop: 			sound.get('loop'),
			height: 		40,
			width: 			200,
			minPxPerSec: 	80,
			normalize: 		true,
			progressColor: 	'crimson',
			waveColor: 		'white'
		};
		var $sound = $(audioTmpl({
			name: name,
			id: 'audio_' + slug(name)
		}));

		$sounds.append($sound);

		wave = WaveSurfer.create(config);
		var currentWave = wave;

		wave.on('finish', function(event) { 
			currentWave.seekTo(0); 
			
			if(config.loop) {
				if(!Danimator.sounds[name].stopped) {
					currentWave.play();
				}
			}
		});

		if(sound === Danimator._activeSound) {
			currentWave.on('ready', function() { 
				currentWave.play();
			});
		}

		wave.load('audio/' + name);
		$sound.data('wave', wave);
	});

	if(wave) {
		
	}
}

Danimator.onSound = _.debounce(_createAudio, 100);

/* game engine for loading SVG skeletons, extended to editing capabilities */
Game.onLoad = function(project, name, options, scene, container) {

	var self = this;
	currentGame = self;

	self.time 	= 0;

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

			/* retrieve all tracks before current time and sort them chronologically */
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

			/* highlight the keyframe that corresponds to the current time */
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

			/* update current track in animation panel and property in properties panel */
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

				var ani = Danimator.step(currentTrack, t);

				if($target && $target.length)
					if($.contains($target[0], $scrubber[0])) {
						$animationValue.text(property + ' = ' + _.round(ani.value,2));
					}
			}
		});

		self.time = time;
	}

	self.find = function(id) {
		return self.container.getItem({ id: id });
	};

	self.findAndModify  = function(id, props) {
		return self.find(id).set(props);
	};

	var layers = Danimator.layers = self.scene.slice(0).reverse();
	var $borderDummy = $('#border-dummy');

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
					_changeProp('pivot.x', selectedItem.pivot.x);
					_changeProp('pivot.y', selectedItem.pivot.y);
					_anchorViz.position = selectedItem.pivot;
				} else {
					_anchorViz.position = selectedItem.bounds.center;
				}

				_changeProp('position.x', selectedItem.position.x);
				_changeProp('position.y', selectedItem.position.y);
			} else {
				self.container.position = self.container.position.add(event.delta);
			}

			event.event.preventDefault();
			event.event.stopImmediatePropagation();
		}
	};

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
			currentGame.findAndModify(selectionId, { pivot: this.position });
		}
	};

	_anchorViz.onMouseUp = function(event) {
		var item = this;

		if(event.event.altKey)
			new Undoable(function(){ 
				item.position = event.point;
				currentGame.findAndModify(selectionId, { pivot: item.position });
			}, function(){ 
				if(item.data.oldPosition) {
					item.position = item.data.oldPosition;
					currentGame.findAndModify(selectionId, { pivot: item.position });
				}
			}, 'Setting pivot of ' + currentGame.find(selectionId).name, true);
	};

	self.container.appendTop(_anchorViz);

	_createLayers(layers, $('.panel#layers ul').empty());

	/* initialize panels! */
	$('.panel').each(function() {
		var $panel = $(this);
		var collapsed = localStorage.getItem('editor-panels-' + this.id + '-collapsed');

		$panel
			.draggable({ 
				handle: 		'>label', 
				containment: 	[0, 0, $(window).width() - $panel.width(), $(window).height() - $panel.height()],
				stop: 			function() {
					localStorage.setItem('editor-panels-' + $panel[0].id + '-pos', JSON.stringify($panel.offset()));
				}
			})
			.toggleClass('collapsed', collapsed == 'true');

		var pos = localStorage.getItem('editor-panels-' + $panel[0].id + '-pos');
		if(pos = pos && JSON.parse(pos)) {
			$panel.css(pos);
		}
	});

	$('body').addClass('ready');

	return this;
}