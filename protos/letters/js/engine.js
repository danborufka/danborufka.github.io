var animatables   	= [];
var events 			= {};
var self 			= this;

function limit(nr, mi, ma) {
	if(mi > ma) {
		mi = mi ^ ma;
		ma = mi ^ ma;
		mi = mi ^ ma;
	}
	return Math.max(Math.min(nr, ma), mi);
}

/*
function _reset() {
	scene.A.onMouseMove({ point: scene.A.position });
	dragging = false;
	lastOffset = 0;
	scene.A.position = strokes[currentStroke].segments[0].point;
}
*/

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
		var ascending = animatable.to > animatable.from;
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
					animate(item, animatable.property, animatable.to, animatable.from, animatable.duration, null, animatable.delay || 0);
				} else animatable.done(animatable);
			};
		} else {
			value += (animatable.to - animatable.from) * event.delta;
			value = limit(value, animatable.from, animatable.to);
		}
		item[animatable.property] = value;
	});
}

Game = function(project, name, onLoad) {

	var self 			= this;
	self._name 			= name;
	self._file 			= 'svg/' + name + '.svg';

	self.resize 		= function(event) {
		if(self.scene)
			self.scene.position = event.size/2;
	};

	project.importSVG(self._file, function(item) {
		self.container 		= item;
		self.scene 			= self.container.children;
		self.scene.UI.visible = false;

		if(onLoad) onLoad(self.scene, self.container);
	});

	return this;
}