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
			 saved: false 
		} 
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
				var extension = files.match(/\.([^\.]{2,5})$/g);
				if(extension) {
					resolved[extension[0].slice(1)] = { path: files, saved: true };
					return resolved;
				}
				/* if SVG */
				if(files.match(/<svg.*>/g)) {
					return { svg: { content: files, saved: true } };
				}
				if(files.match(/\n/g)) {
					return { js: { content: files, saved: true } };
				}
			default:
		}
		return false;
	};

	/* omnipotent file loader - triggered by filedrop on body */
	self.load = function(files) {
		files = self._resolveFiles(files);
		
		if(files) {
			// add passed files to game's file object, overwriting only on a per-filetype basis
			self.files = _.extend(_.get(self, 'files', {}), files);

			if(files.svg) {
				project.clear();
				project.view.update();
				project.importSVG(files.svg.content || files.svg.path, {
					expandShapes: 	true,
					onLoad: 		function() {
										self.scene = this;
										self.container 	= self.scene.item;

										(self.resize = function(event) {
											self.container.position = new paper.Rectangle(new paper.Point(0,0), event.size).center;
										})({size: project.view.viewSize});

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