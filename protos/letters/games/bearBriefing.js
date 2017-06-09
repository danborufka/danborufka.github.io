var bearBriefing = new Game(project, 'bearBriefing', { type: 'anis' }, 
	function onGameStart(scene) {
		var bear = scene.agentBear.item;

		bear.frame = 1;
		bear.state = 'eyes.normal';
		bear.state = 'snout.normal';

		/* animate agent Bearinger */
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

		Danimator(bear, 'state.snout', 'normal', 'a', 4);

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