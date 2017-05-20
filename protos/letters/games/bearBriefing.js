var bearBriefing = new Game(project, 'bearBriefing', { type: 'anis' }, 
	function onGameStart(scene, container, game) {
		var bear = scene.agentBear;

		bear.frame = 1;
		bear.setState('normal', 'eyes');
		bear.setState('normal', 'snout');

		/* animate agent Bearinger */
		//if(false)
		Danimator.play(bear,  {	
			fps: 	Danimator.interactive ? 1 : 6,
			//onDone: 'pingpong',
			onStep: function(step, progress) {
						if(!Danimator.interactive)
							if(progress >= 1) bear.flip();
						return step;
					}
		});

		$(document).on('keyup', function(event) {
			switch(event.key) {
				case '1':
					bear.setState('normal', 'eyes');
					break;
				case '2':
					bear.setState('wondering', 'eyes');
					break;
				case '3':
					bear.setState('doubting', 'eyes');
					break;
					
				case 'a':
				case 'o':
				case 'i':
				case 'f':
					bear.setState(event.key, 'snout');
					break;
				case 'n':
					bear.setState('normal', 'snout');
					break;
				case '<':
					bear.flip();
					break;
			}
		});

		window.bear = bear;
	}
);