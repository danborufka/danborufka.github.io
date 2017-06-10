// ### TODO: 
// o fix constant listening to keywords

// helper to turn multiple answers into a regular expression joined by | (pipe) as regex alternatives
var _regExify = function(expectation) {
	return new RegExp('^' + expectation.answers.join('|') + '$', 'i');
}

var commands = {};
var _TMI_data_snapshot;

TMI = this.TMI || {

	_default_lang: 	'en-US',
	_last_cmds: 	false,
	_value: 		'',

	// expectations are listened to until an (expected) answer has been given
	expectations: 	[],
	// listeners are listened to until forever or until they are removed
	listeners: 		[],

	// reference to the props of the current expectation
	answers: 		false,
	callback: 		false,
	in: 			false,
	saveIn: 		null,

	debug: 			false,
	// data store for saved spoken user input
	data: 			{},
	index: 			0,
	language: 		'en-US',

	run: 			function() {
						var isFirstRun 			= TMI.index === 0;
						var currentExpectation 	= TMI.expectations[TMI.index];

						if(TMI.debug)
							console.log('run #', TMI.index, 'expectation:', currentExpectation, 'firstRun?', isFirstRun);

						// save snapshot of data commited by code to remove before passing user generated data to onDone()
						if(isFirstRun)
							_TMI_data_snapshot = Object.keys(TMI.data);

						if(currentExpectation) {

							// update TMI shorthand props
							TMI.answers 	= currentExpectation.answers;
							TMI.in 			= currentExpectation.in;
							TMI.saveIn 		= currentExpectation.saveIn;
							TMI.callback 	= currentExpectation.callback;

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
						} else {
							TMI.data = _.omit(TMI.data, _TMI_data_snapshot);
							TMI.onDone && TMI.onDone();
						}
						TMI.onAnswer && TMI.onAnswer(TMI.value);
						return TMI;
					},
	listen: 		function(options) {
						TMI.listeners.push({ for: options.for, callback: options.callback });
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
							saveIn: options.saveIn,
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

annyang.addCallback('result', function(matches) {
	var thisExpectation = TMI.expectations[TMI.index];

	TMI.value = matches[0];

	if(thisExpectation) {
		var blocking = false;

		TMI.value = _.find(matches, function(match) { 
			return match.match(_regExify(thisExpectation)); 
		}) || matches[0];

		matches = matches.filter(function(match) {
			return match.toLowerCase() !== TMI.value.toLowerCase();
		});
		
		if(TMI.listeners.length) {
			_.each(TMI.listeners, function(listener) {
				_.each(listener.for, function(keyword) {
					if(matches.indexOf(keyword) > -1) {
						blocking = true;
						return listener.callback && listener.callback(matches);
					}
				});
			});
		}

		if(!blocking) {
			var _next = function() {
				thisExpectation.callback(TMI.value);			
				TMI.index++;
				TMI.run();
				console.log('TMI.value', TMI.value, 'matches', matches, thisExpectation.answers);
			}
			
			// fulfill this expectation if no answers required
			if(!thisExpectation.answers.length) {
				_next();
			// fulfill this expectation if current input matches one of the expected answers
			} else if(_.find(thisExpectation.answers, TMI.value.match.bind(TMI.value))) {
				_next();
			}
		}
	} else {
		TMI.data = _.omit(TMI.data, _TMI_data_snapshot);
		TMI.onDone && TMI.onDone();
	}

	TMI.onSpeak && TMI.onSpeak(TMI.value, matches.slice(1));
});

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
