if(LAUNCHBAR.dom.hasOwnProperty('input'))
{
	var has_modifier = LAUNCHBAR.options.shortcut.hasOwnProperty('modifier');

	LAUNCHBAR.dom.$suggestions 	= $('#lb_suggestions');
	LAUNCHBAR.dom.$chain 	  	= $('<datalist id="lb_suggestions_chain"></datalist>');

	// LAUNCHBAR methods
	LAUNCHBAR.events.close = function()
	{
		$(LAUNCHBAR.dom.input).trigger('blur').trigger('blur');
		return LAUNCHBAR.events;
	};

	LAUNCHBAR.events.open = function()
	{
		var keyOptions = { which: LAUNCHBAR.options.shortcut.key };
		
		if(LAUNCHBAR.options.shortcut['modifier'])
		{
			keyOptions[LAUNCHBAR.options.shortcut.modifier] = true;
		}

		$(LAUNCHBAR.dom.input).trigger( $.Event( "keyup", keyOptions ));

		return LAUNCHBAR.events;
	};

	// checks if shortcut has been pressed
	function checkShortcut(e)
	{
		return ((has_modifier && e[LAUNCHBAR.options.shortcut.modifier]) || !has_modifier) && 
			e.which === LAUNCHBAR.options.shortcut.key;								// read shortcut from options
	}

	$(document)
		.on('blur', LAUNCHBAR.dom.input, function()
		{
			if(LAUNCHBAR.events['onClose'])
			{
				if( LAUNCHBAR.events.onClose() === false ) return false;
			}

			$(LAUNCHBAR.dom.core).stop().fadeOut(100);
			$(LAUNCHBAR.dom.input).val( last_cmd );

		})
		.on('keydown', function(e)
		{
			if( checkShortcut( e ) )	// read shortcut from options
			{
				return false;
			}
		})
		.on('keyup', function(e)
		{
			var $inp = $(LAUNCHBAR.dom.input),
				cmd, params, input;

			if($(LAUNCHBAR.dom.core).is(':visible'))
			{
				input 	= $inp.val().split(/\s+/);	// split input by spaces

				cmd 	= input.shift().toLowerCase();
				params 	= input.slice(0);

				$.each(params, function(i, val) 	// parse param to right datatype
				{
					switch(val)
					{
						case 'true':
							val = true;
							break;
						case 'false':
							val = false;
							break;
					}
					if(parseInt(val) == val) val = parseInt(val);

					params[i] = val;
				});

				switch(e.which)
				{
					case KEYS.RETURN:
							
						if( LAUNCHBAR.commands[cmd] )
						{
							// shortcuts to other commands are allowed:
							LAUNCHBAR.commands[cmd] = LAUNCHBAR.commands[ apply_shortcut(cmd, LAUNCHBAR.commands) ];

							// launch command
							LAUNCHBAR.commands[cmd].apply( arguments.caller, params );

							last_cmd = cmd + '';
						}
						else if( LAUNCHBAR.chaining )
						{
							LAUNCHBAR.chaining = !!LAUNCHBAR.chainlinks[cmd].apply( arguments.caller, params );
						}
						else if(console[cmd])
						{
							console[cmd].apply( console, params );
						}
						else
						{
							alert.delay(200, 'Sorry, command not found!');
						}

					case KEYS.ESC:
						
						if(!LAUNCHBAR.chaining)
							LAUNCHBAR.events.close();

				}
				return false;
			}
			else if( checkShortcut( e ) )
			{
				if(LAUNCHBAR.events['onOpen'])
				{
					if( LAUNCHBAR.events.onOpen() === false ) return;
				}

				$(LAUNCHBAR.dom.core).stop().fadeIn(100);
				$inp.focus()[0].setSelectionRange(0, $inp[0].value.length);	// select all
				return false;
			}

		})
		.on('scroll', function () 
		{
			$(LAUNCHBAR.dom.core).css('top', parseInt($(document).scrollTop()) + 100);
			// (pos fixed doesn't work properly in Chrome)
		})
		.trigger('scroll')	// if there's an initial scroll value: use it
		.on('change', '#launchbar input', function()
		{
			last_cmd = $(LAUNCHBAR.dom.input).val();
		});	
}
