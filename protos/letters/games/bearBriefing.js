var bearBriefing = new Game(project, 'bearBriefing', { type: 'anis' }, 
	function onGameStart(scene, container, game) {
		var bear = scene.agentBear;

		bear.frame = 1;
		bear.setState('eyes.normal');
		bear.setState('snout.normal');

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

		Danimator(bear, 'state', 'snout.normal', 'snout.a', 4);

		$(document).on('keyup', function(event) {
			switch(event.key) {
				case '1':
					bear.setState('eyes.normal');
					break;
				case '2':
					bear.setState('eyes.wondering');
					break;
				case '3':
					bear.setState('eyes.doubting');
					break;
					
				case 'a':
				case 'o':
				case 'i':
				case 'f':
					bear.setState('snout.' + event.key);
					break;
				case 'n':
					bear.setState('snout.normal');
					break;
				case '<':
					bear.flip();
					break;
			}
		});

		window.bear = bear;
	}
);