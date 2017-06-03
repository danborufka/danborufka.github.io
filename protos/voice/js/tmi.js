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

	data: 			{},
	index: 			0,
	language: 		'en-US',

	run: 			function() {
						var isFirstRun 			= TMI.index === 0;
						var currentExpectation 	= TMI.expectations[TMI.index];

						console.log('run #', TMI.index, 'expectation:', !!currentExpectation, 'first?', isFirstRun);

						if(currentExpectation) {
							if(isFirstRun) {
								annyang.addCallback('result', function(matches) {
									var thisExpectation = TMI.expectations[TMI.index];

									TMI.value = matches[0];

									$('output').text('It sounded like you said "' + TMI.value + '"');

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
									console.log('removing commands for', Object.keys(TMI._last_cmds));
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
												console.log('listening matches', matches);
												_.pull(TMI.listeners, listener);
												options.callback && options.callback(matches);
											} 
							};
							TMI.listeners.push(listener);
						}

						if(_.has(options, 'saveIn')) {
							callback = function(val) {
								var value = TMI.value || val;
								console.log('setting TMI.data.' + options.saveIn, 'to', value);
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
	"<%= _landsMann(TMI.data.language) %>! What's your name?",
	"Is your name '<%= TMI.data.name %>'?",
	"Well, hello <%= TMI.data.name %>!"
];
var _QUESTION_INDEX = 0;

_.extend(TMI.data, _LANGUAGES);

TMI /*.listen({ for: ['f*** you'] }, () => {
		$('h1').html('No, fuck <b>you</b>!');
		TMI.index = Math.max(0, TMI.index-1);
		_QUESTION_INDEX--;
		setTimeout(() => TMI.run(), 3000);
	})*/

	// What's your native language?
	.expect({ 
				answers:  Object.keys(_LANGUAGES), 		// keys of _LANGUAGES map (like English, French, …) are allowed answers on first question
				saveIn:   'language'					// save recorded answer in a variable called data.language
			})								
	// What's your name?
	.expect({ 
				answers: [], 							// any answer is allowed
				in: 	 '$language', 					// switching language to previously saved variable language
				saveIn:  'name'
			})
	// Is your name '…'?
	.expect({ 
				answers:  ['yes', 'no', 'no .*' ],		// allow "yes" or "no (…)" as answer,
				listen:   [''],							// yet listen to any other answers

				callback: (userSaid) => {				// whichever answer is given,
					
					var noIts = userSaid.match(/no,? it'?s ([a-zA-Z]+)/i);

					if(noIts) {
						TMI.data.name = noIts[1];
					} else if(TMI.value.toLowerCase() === 'yes') {
						_QUESTION_INDEX = 3;
						//$('h1').text("Well, hello " + TMI.data.name + "!");
					} else {
						TMI.data.name = TMI.value;
						TMI.data.name = prompt("What is it then?");
					}
				}
			});

TMI.onDone = function() {
	console.log('and we are dun.');
};

TMI.onAnswer = function(answer) {
	var question = _QUESTIONS[_QUESTION_INDEX++];

	if(question) {
		var renderedQuestion = _.template(question)({ answer: answer });
		$('h1').text(renderedQuestion);
	} else {
		TMI.stop();
	}
}	

$('.start').click(TMI.run);