// ### TODO: 
// o fix constant listening to keywords

var _regExify = function(expectation) {
	return new RegExp('^' + expectation.answers.join('|') + '$', 'i');
}

TMI = this.TMI || {

	_default_lang: 	'en-US',
	_last_cmds: 	false,
	_value: 		'',

	expectations: 	[],
	listeners: 		[],

	debug: 			false,
	data: 			{},
	index: 			0,
	language: 		'en-US',

	run: 			function() {
						var isFirstRun 			= TMI.index === 0;
						var currentExpectation 	= TMI.expectations[TMI.index];

						if(TMI.debug)
							console.log('run #', TMI.index, 'expectation:', currentExpectation, 'firstRun?', isFirstRun);

						if(currentExpectation) {
							if(isFirstRun) {
								annyang.addCallback('result', function(matches) {
									var thisExpectation = TMI.expectations[TMI.index];

									TMI.value = matches[0];
									TMI.onSpeak && TMI.onSpeak(TMI.value);

									if(thisExpectation) {
										console.log(TMI.index, 'matches', matches, 'listeners', TMI.listeners);

										TMI.value = _.find(matches, function(match) { 
											return match.match(_regExify(thisExpectation)); 
										}) || matches[0];
										
										if(TMI.listeners.length) {
											_.each(TMI.listeners, function(listener) {
												_.each(listener.for, function(keyword) {
													console.log('keyword', keyword, keyword.length);
													if(matches.indexOf(keyword) > -1) return listener.callback(matches);
												});
											});
										}

										if(!thisExpectation.answers.length) {
											thisExpectation.callback(TMI.value);
											TMI.index++;
											TMI.run();
										}
									} else {
										TMI.onDone && TMI.onDone();
									}

								});
							} else {
								// if there were any commands from last expectation – remove them
								if(TMI._last_cmds) {
									if(TMI.debug) console.log('Removing commands for', Object.keys(TMI._last_cmds));
									annyang.removeCommands(Object.keys(TMI._last_cmds));
									TMI._last_cmds = false;
								}
							}

							if(currentExpectation.answers.length) {
								var commands = {};
								var _next = function(value) {
									currentExpectation.callback(value);
									if(TMI.index < TMI.expectations.length) {
										TMI.index++;
										TMI.run();
									} else TMI.onDone && TMI.onDone();
								}

								commands['step #' + (TMI.index+1)] = {
									regexp: 	new RegExp('^' + currentExpectation.answers.join('|') + '$', 'i'),
									callback: 	function() { _next(TMI.value); }
								};
								
								annyang.addCommands(commands);
								// save last cmd to remove it on next expectation
								TMI._last_cmds = commands;
							}

							// get language, falling back to _default_lang
							var lang = _.get(currentExpectation, 'in', TMI._default_lang);

							// calc language in real-time or from passed string
							if(typeof lang === 'function') {
								TMI.language = lang();
							} else if(lang.match(/^\$/g)) {
								TMI.language = TMI.data[TMI.data[lang.slice(1)]];
							} else {
								TMI.language = lang;
							}
						
							if(TMI.debug) console.log('setting language to', TMI.language);
							annyang.setLanguage(TMI.language);

							// upon first run
							if(isFirstRun) {
								if(TMI.debug) annyang.debug();
								annyang.start({ autoRestart: true, continuous: false });
							}
						}
						TMI.onAnswer && TMI.onAnswer(TMI.value);
						return TMI;
					},
	listen: 		function(options, callback) {
						TMI.listeners.push({ for: options.for, callback: callback });
						return TMI;
					},
	expect: 		function(options) {
						var answers 	= _.get(options, 'answers', _.filter([options.answer])); 	// allow ["options.answers"] or "option.answer" as parameter and conform to format [answers]
						var lang 		= _.get(options, 'in', TMI._default_lang);					// fallback to default language
						var callback 	= options.callback;

						if(options.listen) {
							var listener = { 
								for: 		options.listen, 
								callback: 	function(matches) {
												if(TMI.debug)  console.log('Listening matches', matches);
												_.pull(TMI.listeners, listener);
												options.callback && options.callback(matches);
											} 
							};
							TMI.listeners.push(listener);
						}

						if(_.has(options, 'saveIn')) {
							callback = function(val) {
								var value = TMI.value || val;
								if(TMI.debug) console.log('Setting TMI.data.' + options.saveIn, 'to', value);
								TMI.data[options.saveIn] = value;
								options.callback && options.callback(value);
							}
						}

						TMI.expectations.push({  
							answers,
							in: lang,
							callback,
						});

						return TMI;
					},
	stop: 			function() {
						TMI.index = Math.min(TMI.index, TMI.expectations.length);
						annyang.pause();
						annyang.removeCommands();
						annyang.removeCallback();
						return TMI;
					},
	reset: 			function() {
						TMI.stop();
						TMI.expectations = [];
						TMI.listeners = [];
						return TMI;
					}
};

/* Example: 

TMI

// Always react to "fuck you!"

	.listen({ 
				for: 		['f*** you'], 
				blocking: 	true,
				callback: 	(userSaid) => alert('Be polite!')
	})

// Question: What's your native language?

	.expect({ 
				answers:  ['English', 'German'],
				saveIn:   'language'
	})								

// Question: What's your name?

	.expect({ 
				answers: [],
				in: 	 '$language',
				saveIn:  'name'
	})

// Is your name ${TMI.data.name}?

	.expect({ 
				answers:  ['yes', 'no'],
				in: 	  'en-US',

				callback: (userSaid) => {
					if(userSaid === 'yes') {
						_saveToDatabase( TMI.data );
					}
				}
	})

	.run();

*/
