PaddedText = paper.Base.extend({
	initialize: function PaddedText(config) {
		this._padding = config.padding || 4; 
		this._point = config.point;

		var _labelConfig = _.extend({
			name:  	'label',
			fillColor: config.color,
			fontSize: 16,
			position: config.point
		}, config);
		var label 	= new paper.PointText(_labelConfig);

		var _bgConfig = _.extend({
			name: 			'bg',
			radius: 		3,
			fillColor: 		config.bgColor,
			rectangle: 		label.bounds
		}, config);
		var bg 		= new paper.Shape.Rectangle(_bgConfig);

		this.item 	= new paper.Group([bg, label]);

		this.label = label;
		this.bg = bg;
		
		this.align  = config.align || 'left';
		this.valign = config.valign || 'top';

		this.item.data._text = config.content;

		this.resize();
	},
	resize: function() {
		this.bg.bounds = this.label.bounds.expand(this._padding * 2, 0);
		this.bg.bounds.top--;	// optical hack
		this.item.position = this.point;
	}
}, {
	beans: true,
	getContent: function() {
		return this.label.content;
	},
	setContent: function(text) {
		this.label.content = text;
		this.resize();
	},
	getBgColor: function() {
		return this.bg.fillColor;
	},
	setBgColor: function(color) {
		this.bg.fillColor = color;
	},
	getColor: function() {
		return this.label.fillColor;
	},
	setColor: function(color) {
		this.label.fillColor = color;
	},
	getOutline: function() {
		return this.bg.strokeColor;
	},
	setOutline: function(color) {
		this.bg.strokeColor = color;
	},
	getPadding: function() {
		return this._padding;
	},
	setPadding: function(padd) {
		this._padding = padd;
		this.resize();
	},
	getPoint: function() {
		return this._point;
	},
	setPoint: function(pos) {
		this.item.translate(pos.subtract(this.point));
		this._point = pos;
	}
});