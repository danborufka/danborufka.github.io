if(LAUNCHBAR.options.monkey_version < 1.2)	// this is defined in extension / greasemonkey_script
{
	var upd = confirm('There\'s a new Tamper-/Greasemonkey script out. Please update now!');	
	
	if(upd)
	{
		try{

			location.href = srv + 'js/Launchbar.user.js';
			return false;
		}
		catch(e)
		{
			// ...
		}
	}
};
