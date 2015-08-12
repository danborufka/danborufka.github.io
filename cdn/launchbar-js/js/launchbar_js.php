<?php 	header("Content-type: text/javascript; charset: UTF-8"); 

		include_once '../minifier.php';			// load minifier
		ob_start('minify');						// and minify content!

		include_once 'funcs.js'; 
?>
if(!(window.hasOwnProperty('LAUNCHBAR') && LAUNCHBAR.loaded))
{
	var origin 	= location.origin.replace(/^[a-z]+\:\/\//, '').replace(/\:[0-9]+$/, ''), 	// remove protocol and port
		srv 	= location.protocol + '//www.tracking-isobar.com/dev/launchbar/',
		to_load = 0;

	jQuery(document).ready(function($) 
	{
		var opts = LAUNCHBAR ? $.extend(true, {}, LAUNCHBAR.options) : null;
			// if options exist already take a copy
		
		window.LAUNCHBAR = { 

			load: function(command)				// method to load scripts
			{
				if(LAUNCHBAR.history[command])	// if we have loaded this command before
				{
					console.info(command, 'already loaded => skipped.');
					return LAUNCHBAR;
				}

				to_load++;									// counter for number of loaded scripts

				var path = (command.indexOf('/')>0  ? 		// if there is a path delimiter
							'' 						: 		// leave command unchanged
							srv + 'commands/') + command;	// otherwise get path

				last_loaded_cmd = command;

				$.getScript(path + '.js', function()		// load script
				{
					window.LAUNCHBAR.history[command] = true;

					//last_loaded_cmd = command;
					LAUNCHBAR.utils.init();				// init
				});
				return LAUNCHBAR;
			},

			install: function(setup)
			{
				$.extend(true, LAUNCHBAR, setup);

				if( setup.commands )
				{
					LAUNCHBAR.addSuggestions( Object.keys( setup.commands ) );
				}
				if( setup.shortcuts )
				{
					LAUNCHBAR.addSuggestions( Object.keys( setup.shortcuts ) );
				}
				return LAUNCHBAR;
			},

			chain: function(setup)
			{
				var onClose;

				LAUNCHBAR.chainlinks 	= setup.commands;
				LAUNCHBAR.chaining 		= true;

				LAUNCHBAR.dom.$suggestions.detach();
				LAUNCHBAR.dom.$chain.empty().appendTo( LAUNCHBAR.dom.core );
				$(LAUNCHBAR.dom.input).hide(0).attr('list', 'lb_suggestions_chain').val('').show(0);

				$.extend(true, LAUNCHBAR.labels, setup.labels);	// prepare labels for suggestions
				LAUNCHBAR.addSuggestions( Object.keys( setup.commands ), true /* chaining */ );

				// save onClose if there is an existing handler
				if(LAUNCHBAR.events.hasOwnProperty('onClose'))
				{
					onClose = LAUNCHBAR.events.onClose;
				}

				LAUNCHBAR.events.onClose = function()
				{
					LAUNCHBAR.dom.$chain.detach();
					LAUNCHBAR.dom.$suggestions.appendTo( LAUNCHBAR.dom.core );
					$(LAUNCHBAR.dom.input).attr('list', 'lb_suggestions');

					onClose ? 
						LAUNCHBAR.events.onClose = onClose :
						delete LAUNCHBAR.events.onClose;

					if(onClose) onClose();
				};

				return LAUNCHBAR;
			},

			addSuggestions: function(cmd_list, chain)
			{
				cmd_list = cmd_list
					.filter(function(i){ return i.length > 1; }) 
					.map(function(val) 
					{
						if(val.length > 1)
						{
							var lbl = '';

							if(LAUNCHBAR.labels[val])
							{
								val += "  (" + LAUNCHBAR.labels[val] + ')';
							}
							return "<option value=\"" + val + "\" />";
						}
					});

				var $suggestions = chain ? LAUNCHBAR.dom.$chain : LAUNCHBAR.dom.$suggestions;

				$suggestions.html( $suggestions.html() + cmd_list.join('') );
				return LAUNCHBAR;
			},

			utils:
			{
				init: 		function()
							{
								var nextCall = localStorage.getItem("LAUNCHBAR_NEXTTIME_CALL"),
									list 	 = localStorage.getItem("LAUNCHBAR_COMMANDS");

								if(list)
								{
								 	jQuery.each(list.split(','), function(i, cmd)
							 		{
							 			LAUNCHBAR.load( cmd );
							 		});
								}

								// if a function call has been issued with nextTime() before the last page reload
								if(nextCall)
								{
									var params 	= jQuery.parseJSON(nextCall),	// read parameters from localStorage
										fn 		= params.shift();				// func name as well


									if(LAUNCHBAR.commands.hasOwnProperty(fn))
									{
										localStorage.removeItem("LAUNCHBAR_NEXTTIME_CALL");		// remove it from localStorage
										LAUNCHBAR.commands[fn].apply(arguments.caller, params);	// and run command
									}
									else
									{
										setTimeout( LAUNCHBAR.utils.init , 500 );
									}
								}
							},
				prefill: 	function( fields )
							{
								// for each key of the passed object
								Object.keys(fields).forEach(function(key)
								{
								 	var $el = $(key === '*' ? ':input' : '#' + key); // * stands for all inputs

								 	if( $el.is(':checkbox,:radio') )	// if radio or checkbox
								 	{
								 		$el.prop( 'checked', fields[key] ).parent().addClass('checked'); 	// check it according to object value
								 	}
								 	else
								 	{
								 		var val = fields[key];
								 		if(typeof val === 'object')		// if is array
								 		{
								 			// take random number between values of entry 0 and 1
								 			val = parseInt(val[0] + Math.random() * (val[1] - val[0]));
								 		}
								 		
								 		if( $el.is('select') )
								 		{
								 			// select <option> according to object value
								 			$el.children().eq( val ).prop('selected', true);
								 		}
								 		else
								 		{
								 			// just set value to object value
								 			$el.val( val );
								 		}
								 	}

								});
							},
				nextTime: 	function(fn, params)	// function to delay another function call until the script is being restarted (on page load e.g.)
							{
								var args 	= jQuery.makeArray(arguments),
									params 	= [args[1]];

								if(args.length > 2)
								{
									params.push( args[2] );		// if we got in more parameters than two append them to params
								}
								params.unshift(fn);				// add function name to the beginning of params

								localStorage.setItem("LAUNCHBAR_NEXTTIME_CALL", JSON.stringify( params ) );	// save to localStorage for next init()
							},
				noNextTime:	function(fn, params)	// function to cancel function calls delayed by nextTime()
							{
								localStorage.removeItem("LAUNCHBAR_NEXTTIME_CALL" );	// save to localStorage for next init()
							},

				checkUrl: 	function(url)	// adds a http:// in front of an URL that is missing a protocol
							{
								if(!url.match(/^[a-z]+\:\/\//))
								{
									return 'http://' + url;
								}
								return url;
							},
				test: 		function()
				{
					
				}
				

			},
			loaded: 		true,
			chaining: 		false,

			history: 		{},
			shortcuts: 		{},
			labels: 		{},
			
			options: 		{},
			dom: 			{},
			events: 		{},
			chainlinks:		{}
		};

		var last_cmd,			// last value - TODO: save in localStorage for next time
			last_loaded_cmd,

			promoted = { 
				commands: 	{	load: 		LAUNCHBAR.load,
								install: 	LAUNCHBAR.install
							}, 
				labels: 	{ 	load: 		'Load command palette',
								install: 	'Install command palette'
							} 
			};


		<?php include_once 'extensions.js'; ?>	 // Greasemonkey handling
		<?php include_once 'markup.js'; ?>		 // load launchbar markup

		window.LAUNCHBAR.options = opts;

		<?php include_once 'shortcut.js'; ?>	// load shortcut functionality
		<?php include_once 'dom.js'; ?> 		// load event handler

		LAUNCHBAR.load('default');
		LAUNCHBAR.install( promoted );	// promote internal LAUNCHBAR funcs to command palette
		
		if(LAUNCHBAR.options.local_cmd_path.length)					// if a local host path has been defined
		{
			LAUNCHBAR
				.load(LAUNCHBAR.options.local_cmd_path + 'default')	// look for default.js on localhost
				.load(LAUNCHBAR.options.local_cmd_path + origin);	// and for host.js too
		}
	});
}<?php ob_end_flush(); ?>