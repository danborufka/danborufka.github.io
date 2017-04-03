// animation and game engine

var animatables   	= [];
var events 			= {};

function limit(nr, mi, ma) {
	if(mi > ma) {
		mi = mi ^ ma;
		ma = mi ^ ma;
		mi = mi ^ ma;
	}
	return Math.max(Math.min(nr, ma), mi);
}

animate = function(item, property, fr, to, duration, done, delay) {
	setTimeout(function(){
		animatables.push({
		item: 		item,
		property: 	property,
		duration: 	duration || 1,
		from: 		fr,
		to: 		to,
		delay: 		delay,
		done: 		done
		});
	}, (delay || 0) * 1000);
};

animate.frame = function(event) {
	_.each(animatables, function(animatable, index){
		var item 	  = animatable.item;
		var fromv 	  = isNaN(animatable.from) ? value:  animatable.from;
		var ascending = animatable.to > fromv;
		var value 	  = item[animatable.property];
		var isDone 	  = ascending ? 
						value >= animatable.to : 
						value <= animatable.to;

		if(isDone) {
			animatables = _.without(animatables, animatable);
			value = animatable.to;
			animatable.value = value;
			if(animatable.done) { 
				if(animatable.done === 'reverse') {
					animate(item, animatable.property, animatable.to, fromv, animatable.duration, null, animatable.delay || 0);
				} else animatable.done(animatable);
			};
		} else {
			value += (animatable.to - fromv) * event.delta;
			value = limit(value, fromv, animatable.to);
		}
		item[animatable.property] = value;
	});
}

Game = function(project, name, options, onLoad) {

	var self 			= this;
	self.name 			= name;
	self.type 			= options.type;
	self.file 			= 'games/' + self.type + '/' + name + '.svg';
	self.project 		= project;
	self.options 		= options;
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

		_.each(self.scene.UI.children, function(ui) {
			if(ui.name !== 'explainer' && ui.name !== 'demo') {
				ui.visible = false;
			}
		});

		self.resize({size: project.view.viewSize});
		item.position = project.view.center;

		if(onLoad) onLoad(self.scene, self.container);
	});

	return this;
}