window.onload = function() {
  var circleNum = 10;
  var count = 0;
  
  var mouseLoc;
  var counting = true;
  var movement = 0;
  
  line.strokeColor = "green";
  line.add(new Point(100, 100));
  line.add(new Point(200, 100));
  line.add(new Point(300, 100));
  line.strokeWidth = 10;
  line.strokeCap = "round";
  line.smooth();
  
  tool.onMouseMove = function(event){
     mouseLoc = event.point;
     if(!counting){
      line.segments[1].point = event.point;       
     }

   }
   tool.onMouseUp = function(event){
     counting = true;
     count = 50;
   }
   tool.onMouseDown = function(event){
     counting = false;
   }
  
   view.onFrame = function(event){
      if(counting){
        if(count > .01){
          count = count / 1.1;           
          console.log(count);
        }
      }
    if(counting){
      console.log('event.count', event.count, Math.sin(event.count));
      movement = Math.sin(event.count) * count;   
      line.segments[1].point.y  = movement + 100;
      line.segments[1].point.x  = 200;
    } 
   }
  
}