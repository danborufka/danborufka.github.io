/* game engine for loading SVG skeletons */
Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options || {};
	self.files 			= { 
		'ani.json': {
			 name: 'untitled.json', 
			 loaded: false,
			 saved: false 
		},
	};
	self.symbols 		= [];

	self.reset = function() {
		this.dragging = false;
	};

	/* 	internal omnipotent helper to determine which supplied file is which.  
		examples:
		_resolveFiles({ svg: 'image.svg' }) 	-> { svg: { path: 'image.svg' } 		}
		_resolveFiles('<svg>…</svg>') 			-> { svg: { content: '<svg>…</svg>'}	}
		_resolveFiles('jQuery.ready(…);') 		-> { js:  { content: 'jQuery.ready(…);'}}
		_resolveFiles('image.svg') 				-> { svg: { path: 'image.svg' } 		}
		_resolveFiles('image.svg', 'script.js') -> { svg: { path: 'image.svg' }, js: { path: 'script.js' }}
	*/
	self._resolveFiles = function(files) {
		var resolved = {};

		switch(typeof files) {
			case 'object':
				if(_.isArray(files)) {
					return _.merge.apply(_, _.map(files, self._resolveFiles));
				}
				return files;	
			case 'string':
				var extension = files.match(/\.([a-zA-Z0-9]{2,5})$/g);
				if(extension) {
					// add to loading queue
					resolved[extension[0].slice(1)] = { path: files, saved: true, loaded: false };
					return resolved;
				}
				// if inline SVG
				if(files.match(/<svg.*>/g)) {
					return { svg: { content: files, saved: true, loaded: true } };
				}
				// if inline JS
				if(files.match(/\n/g)) {
					return { js: { content: files, saved: true, loaded: true } };
				}
			default:
		}
		return false;
	};

	var _resize;

	self.onResize = function(event) {
		_resize && _resize(event);
	}

	/* omnipotent file loader - triggered by filedrop on body */
	self.load = function(files) {
		files = self._resolveFiles(files);
		
		if(files) {
			// add passed files to game's file object, overwriting only on a per-filetype basis
			_.extend(_.get(self, 'files', {}), files);

			if(files.svg) {
				project.clear();
				project.view.update();
				Danimator.import(files.svg.content || files.svg.path, {
					expandShapes: 	true,
					onLoad: 		function() {
										files.svg.loaded = true;

										self.scene = this;
										self.container = this.item;

										(_resize = function(event) {
											var screenCenter = new paper.Point(event.size).multiply(0.5);
											var halfSize 	 = new paper.Point(self.container.bounds.size).multiply(0.5).add(project.view.bounds.point);

											self.container.position = paper.Point.max(screenCenter, halfSize);
										})({size: project.view.viewSize});

										// hide all UI elements
										if(self.scene.UI)
											_.each(self.scene.UI.item.children, function(uiElement) {
												uiElement.visible = false;
											});

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
				if(files.js.path) {
					jQuery.getScript({
				        url: files.js.path,
				        dataType: 'script',
				        success: function() { 
				        	files.js.loaded = true;
				        	console.log('success! arguments', arguments, files);
				        }
				    });
				} else {
					$('<script>' + files.js.content + '</script>').appendTo('body');
					files.js.loaded = true;
				}
			}
		}
	}

	self.load(self.file);

	return this;
}

/* ### finish refactor
Game = function Game(config) {
	var self = this;

	self.completed = false;
	self.rounds = [];
	self.round = 0;

	_.extend(self, config);

	self.roundCompleted = function() {
		if(self.round === self.rounds.length) {
			self.completed = true;
			self.onGameCompleted();
		} else {
			self.round++;
		}
	}
}*/