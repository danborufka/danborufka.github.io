Grammar = {
	homographs: 'name',
	homophones: 'soundex'
};

function WordBase(base) {
	var self = this;

	self.words = base;
	self.filtered = false;

	Object.defineProperty(self, 'base', {
		enumerable: false, configurable: true, 
		value: base
	});

	return self;
}
WordBase.prototype.toString = function() {
	var more = this.words.length > 3 ? '…' : '';
	var output = this.words.slice(0,3) + more + '(' + this.words.length + ')';
	return '[WordBase:' + output + ']';
}
WordBase.prototype.get = function(queries, options) {
	var base 	 	= _.get(options, 'base', this.words);
	var limit 		= _.get(options, 'limit', false);
	var counter 	= 0;

	var filtered 	= new WordBase(_.filter(base, function(word) {
		var result 	= true;

		if(limit) {
			if(counter >= limit) {
				return false;
			}
		}

		_.each(queries, function(args, query) {
			var negate = query[0] === '!';
			if(negate) {
				query = query.slice(1);
			}
			var parts = query.split('.');
			var scope = word;
			var method = _.get(word, query);

			if(parts.length > 1) {
				scope = _.get(word, parts.slice(0,-1).join('.'));
			}

			if(method) {
				if(typeof method === 'function') {
					if(negate) {
						method = _.negate(method);
					}
					result = result && method.apply(scope, _.castArray(args));
				} else {
					result = result && (args === method);
				}
			} else {
				result = false;
			}
		});

		if(result) {
			counter++;
		} 
		return result;
	}));

	this.filtered = !_.isEqual(filtered.words, this.words);
	
	return filtered;
}
WordBase.prototype.shuffle = function(rebase) {
	var base = rebase || 'words';
	this[base] = _.shuffle(this[base]);
	return this;
}
WordBase.prototype.filter = WordBase.prototype.and = function(queries, options) {
	this.words = this.get(queries, options).words;
	return this;
}
WordBase.prototype.reset = function() {
	this.words = this.base;
	return this;
}
WordBase.prototype.join = function(base2) {
	this.words = _.union(this.words, base2.words);
	return this;
}
WordBase.prototype.or = function(queries, options) {
	if(!options) options = {};
	options.base = this.base;
	return this.join( this.get(queries, options) );
}
WordBase.prototype.groupBy = function(prop, options) {
	var groups = _.groupBy(this.words, prop);
	if(options) {
		return _.filter(groups, function(group) {
			var result = true;

			_.each(options, function(value, option) {
				result = result && _[option](group.length, value);
			});

			return result;
		});
	}
	return groups;
}

function Word(name, data) {
	var self = this;
	self.name = name;

	if(data) {
		_.extend(self, data);

		self.vowels = _.filter(self.letters, 'vowel');
		self.consonants = _.filter(self.letters, 'consonant');

		if(data.stem) {
			if(data.stem.length < 2) {
				data.stem.unshift(0);
			}
			self.stem = name.slice.apply(name, data.stem);
		}
		if(data.en) {
			self.en = new Word(data.en);
		}
	}
	return self;
}
Word.vowel = '[aeiou]';
Word.consonant = '[^aeiou]';

Word.fromString = function(string) {
	return new Word(string);
}
Word.fromPair = function(data, name) {
	return new Word(name, data);
}
Word.prototype.toString = function() {
	return this.name;
}
Word.prototype.hasDiacritic = function() {
	var has = _.deburr(this.name) !== this.name;
	if(arguments[0] === false) return !has;
	return has;
}
Word.prototype.hasAccent = function() {
	var has = /[áÀéÉíÍóÓúÚàÀèÈìÌÒòÙù]+/g.test(this.name);
	if(arguments[0] === false) return !has;
	return has;
}
Word.prototype.startsWith = function(input, noCase) {
	var letter = input + '';
	if(letter.length === 1) return this.name[0] === letter;
	return new RegExp('^' + letter, 'g' + (noCase ? 'i' : '')).test(this.name);
}
Word.prototype.endsWith = function(input, noCase) {
	var letter = input + '';
	if(letter.length === 1) return this.name[this.name.length-1] === letter;
	return new RegExp(letter + '$', 'g' + (noCase ? 'i' : '')).test(this.name);
}
Word.prototype.contains = function(input, noCase) {
	var letter = input + '';
	var name = this.name;
	if(noCase) {
		letter = letter.toLowerCase();
		name = name.toLowerCase();
	}
	return name.indexOf(letter) > -1;
}

Word.prototype.SoundEx = function(lang, precision) {
	switch(lang) {
		default:
		case 'en':
		    var i, j, l, r, p = isNaN(precision) ? 4 : precision > 10 ? 10 : precision < 4 ? 4 : precision,
		    m = {BFPV: 1, CGJKQSXZ: 2, DT: 3, L: 4, MN: 5, R: 6},
		    r = (s = this.name.toUpperCase().replace(/[^A-Z]/g, "").split("")).splice(0, 1);
		    for(i = -1, l = s.length; ++i < l;)
		        for(j in m)
		            if(j.indexOf(s[i]) + 1 && r[r.length-1] != m[j] && r.push(m[j]))
		                break;
		    return r.length > p && (r.length = p), r.join("") + (new Array(p - r.length + 1)).join("0");
			break;
	}
};

Object.defineProperty(Word.prototype, 'letters', {
	enumerable: true, configurable: false, 
	get: function() {
		var letters = _.map(this.name, function(name) {
			return new Letter(name);
		});
		letters.first = letters[0];
		letters.last  = letters[letters.length-1];
		letters.toString = function() {
			return this.join('');
		}
		return letters;
	},
});

function Letter(string) {
	var self = this;
	self.name = string;

	self.vowel = Letter.isVowel(string);
	self.consonant = !self.vowel;
}
Letter.prototype.toString = function() {
	return this.name;
}
Letter.prototype.hasAccent = function() {
	return /[áÀéÉíÍóÓúÚàÀèÈìÌÒòÙù]/g.test(this.name);
}
Letter.isVowel = function(string) {
	return /[aeiou]/i.test(_.deburr(string));
}
Letter.isConsonant = _.negate(Letter.isVowel);