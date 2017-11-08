var originals = {
	setContent: 	paper.TextItem.prototype.setContent,
	setPoint: 		paper.TextItem.prototype.setPoint,
	setPosition: 	paper.TextItem.prototype.setPosition,
};

paper.TextItem.inject({
	getAlign: function() {
		return this.data._align;
	},
	setAlign: function(align) {
		this.data._align = align;
		this.reposition();
	},
	getValign: function() {
		return this.data._valign;
	},
	setValign: function(valign) {
		this.data._valign = valign;
		this.reposition();
	},
	setContent: function(content) {
		originals.setContent.apply(this, arguments);
		//this.resize();
		this.reposition();
		this.viewPosition = this.viewPosition;
	},
	setPosition: function(pos) {
		this.data._point = pos;
		originals.setPosition.apply(this, arguments);
	},
	setPoint: function() {
		this.setPosition.apply(this, arguments);
	},
	reposition: function() {
		var hfactor = 0;
		var vfactor = 0;

		switch(this.data._align) {
			case 'right':
				hfactor = -.5;
				break;
			case 'left':
				hfactor = .5;
				break;
		}

		switch(this.data._valign) {
			case 'bottom':
				vfactor = 1;
				break;
			case 'top':
				vfactor = .5;
				break;
		}

		if(!this.data._point) {
			this.data._point = this.position;
		}

		this.position.x = this.data._point.x + this.bounds.width * hfactor;
		this.position.y = this.data._point.y + this.fontSize * vfactor;
	}
});