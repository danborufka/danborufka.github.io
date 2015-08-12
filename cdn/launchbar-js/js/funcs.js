function apply_shortcut(shortcut, list)
{
	if(shortcut.indexOf('/') > 0)
	{
		shortcut = shortcut.split('/')[0];
	}

	if(list)
		while(typeof list[shortcut] === 'string')
		{
			shortcut = list[shortcut];
		}

	return shortcut;
};
Function.prototype.delay = function(dly)
{
	var self 	= this,
		args 	= arguments;

	setTimeout(function()
	{
		self.apply(window, Array.prototype.slice.call(args, 1));	
	}, dly);	
};