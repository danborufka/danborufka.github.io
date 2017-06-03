TMI = this.TMI || {

	_default_lang: 	'en-US',
	_last_cmds: 	[],
	_value: 		'',

	expectations: 	[],
	listeners: 		[],

	data: 			{},
	index: 			0,
	language: 		'en-US',

	run: 			function() {
						var isFirstRun 			= TMI.index === 0;
						var currentExpectation 	= TMI.expectations[TMI.index];

						if(currentExpectation) {

							if(isFirstRun) {
								annyang.addCallback('result', function(matches) {
									var thisExpectation = TMI.expectations[TMI.index];
									TMI.value = matches[0];

									if(TMI.listeners.length) {
										_.each(TMI.listeners, function(listener) {
											console.log('listener', listener);
										});
									}

									if(!thisExpectation.answers.length) {
										thisExpectation.callback(TMI.value);
										TMI.index++;
										TMI.run();
									}
								});
							} else {
								// if there were any commands from last expectation – remove them
								if(TMI._last_cmds.length) {
									annyang.removeCommands(Object.keys(TMI._last_cmds));
									TMI._last_cmds = [];
								}
							}
							
							console.log('currentExpectation', currentExpectation);

							if(currentExpectation.answers.length) {
								var commands = {};
								var _next = function(value) {
									currentExpectation.callback(value);
									if(TMI.index < TMI.expectations.length) {
										TMI.index++;
										TMI.run();
									} else TMI.onDone && TMI.onDone();
								}

								commands['debug step ' + (TMI.index+1)] = {
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
						
							//console.log('setting language to', TMI.language, lang.slice(1), TMI.data[lang.slice(1)], TMI.data.language);
							annyang.setLanguage(TMI.language);

							// upon first run
							if(isFirstRun) {
								annyang.debug();
								annyang.start({ autoRestart: true, continuous: false });
							}
						}
						TMI.onAnswer && TMI.onAnswer(TMI.value);
					},
	listen: 		function(options, callback) {
						console.log('options', options.for);

						var listener = {};
						listener[options.for] = callback;

						TMI.listeners.push(listener);
						return TMI;
					},
	expect: 		function(options, callbackOrField) {
						var answers 	= _.get(options, 'answers', _.filter([options.answer])); 	// allow ["options.answers"] or "option.answer" as parameter and conform to format [answers]
						var lang 		= _.get(options, 'in', TMI._default_lang);					// fallback to default language

						var _hasField 	= (typeof callbackOrField === 'string');
						var callback 	= callbackOrField;

						if(_hasField) {
							callback = function(value) {
								console.log('setting', callbackOrField, 'to', TMI.value || value);
								TMI.data[callbackOrField] = TMI.value || value;
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
					},
	reset: 			function() {
						TMI.stop();
						TMI.expectations = [];
						TMI.listeners = [];
					}
};

function _landsMann(lang) {
	return {
		'French': 'A frogeater',
		'English': 'A teabagger',
		'German': 'A German',
		'Italian': 'A stronzzo',
		'Spanish': 'A Spaniard',
		'Russian': 'A machine'
	}[lang];
}

var _LANGUAGES = {
	'English': 'en-US',
	'French': 'fr-FR',
	'German': 'de-DE',
	'Russian': 'ru-RU',
	'Italian': 'it-IT',
	'Spanish': 'es-ES'
};

var _QUESTIONS = [
	"What's your native language?",
	"<%= _landsMann(answer) %>! What's your name?",
	"Is your name '<%= answer %>'?",
	"Well, hello <%= TMI.data.name %>!"
];

_.extend(TMI.data, _LANGUAGES);

TMI // What's your native language?
	.expect({ 
				answers:  Object.keys(_LANGUAGES) 		// keys of _LANGUAGES map (like English, French, …) are allowed answers on first question
			}, 'language')								// save recorded answer in a variable called language
	// What's your name?
	.expect({ 
				answers: [], 							// any answer is allowed
				in: 	 '$language' 					// switching language to previously saved variable language
			}, 'name')
	// Is your name '…'?
	.expect({ 
				answers: ['yes', 'no', 'no it is :name'] // allow "yes" or "no" as answer
			}, () => {
				var newName = TMI.value.split(/^no it[s']+/gi)[0];
				
				if(newName) {
					_QUESTIONS.unshift("Is your name '<%= answer %>'?");
					TMI.index--;
					TMI.run();
				} else if(TMI.value.toLowerCase() === 'yes') {
					$('h1').text("Well, hello " + TMI.data.name + "!");
				} else {
					prompt("What is it then?");
				}
			})
	.onDone = function() {
		console.log('and we are dun.');
	};

TMI.onAnswer = function(answer) {
	var question = _.template(_QUESTIONS.shift())({ answer: answer });
	if(question) {
		$('h1').text(question);
	} else {
		TMI.stop();
	}
}	

$('.start').click(TMI.run);