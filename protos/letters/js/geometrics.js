// geometric helpers

paper.Path.inject({
	getGrowth: function() {
		var growth = this.data._growth;
		if(growth === undefined) {
			growth = 1;
			if(this.dashArray)
				if(this.dashArray.length == 2) 
					if(this.dashArray[1] == this.length)
						growth = this.dashArray[0] / this.length;
			this.data._growth = growth;
		}
		return growth;
	},
	setGrowth: function(growth) {
		this.data._growth = growth;
		var grownLength = growth * this.length;
		this.dashArray = [grownLength, this.length];
	}
});

paper.Item.inject({
	getRotation: function() {
		return _.get(this.data, '_rotation', 0);
	},
	setRotation: function(angle, center) {
		this.rotate(angle-_.get(this.data, '_rotation', 0), center);
		this.data._rotation = angle;
	},

	attachToPath: function(stroke, offset) {
		this.detachFromPath(stroke);

		this.data._master = stroke;
		if(!stroke.data._slaves) {
			stroke.data._slaves = [];
		}
		stroke.data._slaves.push(this);

		this.offsetOnPath = offset || 0;
	},
	detachFromPath: function(stroke) {
		if(this.data._master) {
			// remove from old master
			this.data._master.data._slaves = _.without(this.data._master.data._slaves, this);
		}
	},

	getOffsetOnPath: function() {
		return (this.data._offsetOnPath || 0);
	},
	setOffsetOnPath: function(offset) {
		if(!offset) offset = 0;

		var path = this.data._master;
		var len  = offset * path.length;

		this.position = path.getPointAt(len);
		this.rotation = path.getNormalAt(len).angle-90;
		this.data._offsetOnPath = offset;
	},
	flip: function(pivot) {
		this.scale(-1, 1, pivot);
	},
	flop: function(pivot) {
		this.scale(1, -1, pivot);
	}
});