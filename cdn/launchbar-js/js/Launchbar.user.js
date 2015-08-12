// ==UserScript==
// @name        Launchbar
// @namespace   creatogether
// @description launches JS snippets
// @run-at 		document-start
// @require     https://code.jquery.com/jquery-2.1.4.min.js
// @version     1.3
// @grant       none
// ==/UserScript==

if(!window.hasOwnProperty('LAUNCHBAR'))
{
	console.log('user script launched.');

	window.LAUNCHBAR = { options: { 	mode: 			'online', 
										shortcut: 		'ctrl+space',  
										local_cmd_path: location.protocol + '//localhost:8888/experiments/launchbar_js/commands/',
										monkey_version: 1.3
								  } 
						};

	function init_bookmarklet() 
	{
		getScript('https://www.tracking-isobar.com/dev/launchbar/js/launchbar_js.php', function()
		{
			console.info('Launchbar loaded for %c' + location.origin, 'color:#C63; background-color:#DDD');
		});
	};

	function getScript(url, success) 
	{
		var script = document.createElement('script');
		script.src = url;

		var head = document.getElementsByTagName('head')[0],
			scr  = url.split('/').pop();
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
			else
				console.warn('Script', scr, 'not found.');
		};
		
		head.appendChild(script);
	};
	setTimeout(init_bookmarklet, 1000);
}