var bearBriefing = new Game(project, 'bearBriefing', { type: 'anis' }, 
	function onGameStart(scene) {
		var bear = scene.agentBear.item;

		bear.frame = 1;
		bear.state = 'eyes.normal';
		bear.state = 'snout.normal';

		Danimator.sound('bearinger-good-day');

		/* animate agent Bearinger 
		if(false)
		Danimator.play(bear,  {	
			fps: 	Danimator.interactive ? 1 : 6,
			onDone: 'pingpong',
			onStep: function(step, progress) {
						if(!Danimator.interactive)
							if(progress >= 1) bear.flip();
						return step;
					}
		});

		Danimator(bear, 'state.snout', 'normal', 'o', .15)
			.then('animate', bear, 'state.snout', 'o', 'normal', .1)
			.then('animate', bear, 'state.snout', 'normal', 'i', .2)
			.then('animate', bear, 'state.snout', 'i', 'normal', .4, {
				onStep: function() {
					bear.setState('eyes.wondering');
				}
			})
			.then('animate', bear, 'state.snout', 'normal', 'a', .2, {
				onStep: function() {
					bear.setState('eyes.normal');
				}
			})
			.then('animate', bear, 'state.snout', 'a', 'i', .1)
			.then('animate', bear, 'state.snout', 'i', 'normal', .2)
			.then('animate', bear, 'state.snout', 'normal', 'i', .1)
			.then('animate', bear, 'state.snout', 'i', 'normal', .2, {
				onStep: function() {
					bear.setState('eyes.doubting');
				}
			})
			.then('animate', bear, 'state.snout', 'normal', 'a', .1, {
				onStep: function() {
					bear.setState('eyes.normal');
				}
			})
			.then('animate', bear, 'state.snout', 'a', 'normal', .2)
			.then('animate', bear, 'state.snout', 'normal', 'i', .1)
			.then('animate', bear, 'state.snout', 'i', 'normal', .2);

		*/
		Danimator(bear, 'frame', 1, 4, .4, { delay: .6 })


		//Danimator.load('games/anis/bearBriefing');

		$(document).on('keyup', function(event) {
			switch(event.key) {
				case '1':
					bear.state = 'eyes.normal';
					break;
				case '2':
					bear.state = 'eyes.wondering';
					break;
				case '3':
					bear.state = 'eyes.doubting';
					break;
					
				case 'a':
				case 'o':
				case 'i':
				case 'f':
					bear.state = 'snout.' + event.key;
					break;
				case 'n':
					bear.state = 'snout.normal';
					break;
				case '<':
					bear.flip();
					break;
			}
		});

		window.bear = bear;
	}
);