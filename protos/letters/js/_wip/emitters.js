function Emitter() {
	var self = this;

	self.direction = 0;
	self.spread = 0;
	self.particlesPerSec = 1;
	self.preroll = 0;
	self.speed = 1;
	
	self.active = true;
	self.interval = 1/self.particlesPerSec;

	self.particles = [];

	self._intervalId = -1;

	_.extend(self, hash);

	self.emit = function() {
		var particle = new Particle({ emitter: self });
		self.particles.push(particle);
	}

	self.activate = function() {
		self._intervalId = setInterval(self.emit, self.interval * 1000);
		self.active = true;
		return self;
	}
	self.deactivate = function() {
		clearInterval(self._intervalId);
		self.active = false;
		return self;
	}

	return self.activate();
}

function Particle(hash) {
	var self = this;

	self.direction = new paper.Point();
	self.speed = 1;
	self.acceleration = 0;
	self.symbol = '';

	_.extend(self, hash);


	return self;
}

