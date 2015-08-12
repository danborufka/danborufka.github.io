window.KEYS =  { SPACE: 32, TAB: 9, RETURN: 13, ESC: 27 };


if(LAUNCHBAR.options.shortcut)
{
	var shc = window.LAUNCHBAR.options.shortcut;

	if(typeof shc === 'string')
	{
		shc = shc.replace(/\s+/g, '').toLowerCase();	// remove whitespaces, lcase

		// if shortcut is combination of keys
		if( shc.indexOf('+') )
		{	
			shc = shc.split('+');

			shc[1] = 	shc[1].length === 1 ? 			// if single letter
						shc[1].charCodeAt() : 			// use charcode
						KEYS[shc[1].toUpperCase()];		// otherwise look up in KEYS var at line #22

			shc = { modifier: shc[0]+'Key', key: shc[1] };
		}
		else
		{
			shc = { key: shc };			// no modifier supplied
		}
	}
	window.LAUNCHBAR.options.shortcut = shc;
}
else
{
	// fallback to default shortcut Ctrl + SPACE
	window.LAUNCHBAR.options.shortcut = {modifier: 'ctrlKey', key: KEYS.SPACE };
}