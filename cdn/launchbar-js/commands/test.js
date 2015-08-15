LAUNCHBAR.install({

	commands: 	
	{
		test: 	function()
				{  
					LAUNCHBAR.chain({
						commands: 
						{
							free: function(){ alert('Freedom!'); }
						},
						labels:
						{
							free: 'The Braveheart Effect'
						}
					});
				},
		abc: 	function(){ alert('abcdefghijk…'); }
	},
	labels:
	{
		test: 'Simpler Test',
		abc: 	'Alphabet'
	}

});