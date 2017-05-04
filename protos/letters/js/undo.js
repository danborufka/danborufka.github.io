function Undoable(redo, undo, title, silent) {
	var self = this;

	self.undo = undo;
	self.redo = redo;

	Undo.stack.push(self);
	history.pushState({ undoIndex: Undo.stack.length }, title || 'Redo');
	if(!silent) 
		Undo.redo();
	else
		Undo.index++;

	return self;
}

Undo = {
	stack: 	[],
	index: 	0,

	goto: function(newIndex) {
		while(newIndex > Undo.index) Undo.redo();
		while(newIndex < Undo.index) Undo.undo();
	},

	undo: 	function() {		// returns true if more undos possible
		Undo.stack[Math.max(Undo.index-1, 0)].undo();
		Undo.index--;

		if(Undo.index <= 0) {
			Undo.index = 0;
			return false;
		}
		return true;
	},
	redo: 	function() {		// returns true if more redos possible
		Undo.index++;
		Undo.stack[Math.min(Undo.index-1, Undo.stack.length)].redo();

		if(Undo.index >= Undo.stack.length) {
			Undo.index = Undo.stack.length;
			return false;
		}
		return true;
	}
};

history.replaceState({ undoIndex: 0 }, '');

jQuery(window).on('popstate', function(event, state) {
	Undo.goto(event.originalEvent.state.undoIndex);
});