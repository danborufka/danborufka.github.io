
var bearBriefing = new Game(project, 
	'bearBriefing', {}, function onGameStart(scene, container, game) {

		var bear = scene.agentBearinger;

		bear.frame = 1;

		/* animate dr. bear 
		Danimator.play(bear,  {
			states: {

			},
			fps: 1,
			onDone: 'pingpong'
		});
		*/

		container.onMouseDown = function onContainerMousedown(event) {
			
		}
		container.onMouseUp = function onContainerMouseUp() {
			
		}

		game.onGameEnd = function(data) {
			console.log('data', data);
		}
	}
);