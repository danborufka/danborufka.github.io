if(!(window.hasOwnProperty('LAUNCHBAR') && LAUNCHBAR.loaded))
{
	var srv = location.protocol + '//www.tracking-isobar.com/dev/launchbar/';

	if(!window.hasOwnProperty('LAUNCHBAR'))
	{
		window.LAUNCHBAR = { options: {} };
	}
	window.LAUNCHBAR.options.shortcut = 'ctrl + space';

	if(!LAUNCHBAR.options.hasOwnProperty('local_cmd_path'))
	{
		window.LAUNCHBAR.options.local_cmd_path = '';
	}

	//console.log('*** init by bookmarklet ***', window.LAUNCHBAR.options.shortcut);

	function init_bookmarklet() 
	{
		getScript(srv + 'js/launchbar_js.php', function(){});
	};

	function getScript(url, success) 
	{
		var script = document.createElement('script');
		script.src = url;

		var head = document.getElementsByTagName('head')[0],
			done = false;

		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function() 
		{
			if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) 
			{
				done = true;
				
				// callback function provided as param
				success();
				
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
				
			}
			return false;
		};
		
		head.appendChild(script);
	};

	// Only do anything if jQuery isn't defined
	if(typeof jQuery == 'undefined') 
	{
		if(typeof $ == 'function') 
		{
			// warning, global var
			thisPageUsingOtherJSLibrary = true;
		}
		getScript('//code.jquery.com/jquery-2.1.4.min.js', function() 
		{
			if (typeof jQuery=='undefined') 
			{
				// Super failsafe - still somehow failed...
				console.error('jQuery could\'nt be loaded');
			} 
			else 
			{
				// jQuery loaded! Make sure to use .noConflict just in case
				jQuery.noConflict();
				init_bookmarklet();
			}
		});

	} 
	else 
	{ // jQuery was already loaded
		init_bookmarklet();
	};
}
else
{
	LAUNCHBAR.events.open();
}