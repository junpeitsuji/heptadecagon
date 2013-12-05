
var Point = (function($){

	var incrementalId = 0;
	
	var maxOfRadious = 5;

	var Point = function(x, y){
		this.x = x;
		this.y = y;
		this.radious = 0;

		this.id = incrementalId;
		incrementalId++;
	}

	Point.prototype.display = true;

	Point.prototype.dispose = function(){
		this.display = false;
	}

	Point.prototype.draw = function(context, color){

		if( this.display ){
			context.save();
			context.beginPath();
			context.fillStyle = color; 
			context.arc(this.x, this.y, this.radious, 0, Math.PI*2, true);
			context.fill();
			context.restore();

	  		this.radious += 0.1;
	  		if(this.radious > maxOfRadious){ this.radious = maxOfRadious; }
  		}

	}

	return Point;

})(jQuery);


var Arc = (function($){

	var Arc = function(center, radious){
		this.center = center;
		this.radious = radious;
		this.ratio = 0;
	}

	Arc.prototype.display = true;

	Arc.prototype.dispose = function(){
		this.display = false;
	}

	Arc.prototype.draw = function(context, color){

		if( this.display ){
			context.save();
			
			context.strokeStyle = color; 
			context.beginPath();
			context.arc(this.center.x, this.center.y, this.radious, 0, Math.PI*2*this.ratio, false);
			context.stroke();
			context.restore();

			if(this.ratio < 1.0){
				this.ratio = this.ratio + 0.02;
			}
  		}

	}

	return Arc;

})(jQuery);



var Segment = (function($){

	var Segment = function(p1, p2){
		this.p1 = p1;
		this.p2 = p2;
		this.ratio = 0;
	}

	Segment.prototype.draw = function(context, color){

		context.save();
			
		context.strokeStyle = color; 
			
		context.moveTo(this.p1.x, this.p1.y);

		var targetX = (this.p2.x-this.p1.x)*this.ratio + this.p1.x;
		var targetY = (this.p2.y-this.p1.y)*this.ratio + this.p1.y;

		context.lineTo(targetX, targetY);

		context.stroke();				

		context.restore();

		if( this.ratio < 1.0 ){
			this.ratio = this.ratio + 0.1;
		}
		else {
			this.ratio = 1.0;
		}

	}

	return Segment;

})(jQuery);


var Line = (function($){

	var Line = function(p1, p2){
		this.p1 = p1;
		this.p2 = p2;
		this.ratio = 0;
	}

	Line.prototype.display = true;

	Line.prototype.dispose = function(){
		this.display = false;
	}

	Line.prototype.draw = function(context, color){

		if( this.display ){
			context.save();
			
			context.strokeStyle = color; // 緑
			
			{
				context.moveTo(this.p1.x, this.p1.y);

				var targetX = (this.p2.x-this.p1.x)*this.ratio + this.p1.x;
				var targetY = (this.p2.y-this.p1.y)*this.ratio + this.p1.y;

				context.lineTo(targetX, targetY);
				context.stroke();				
			}
			
			{
				context.moveTo(this.p2.x, this.p2.y);

				var targetX = (this.p1.x-this.p2.x)*this.ratio + this.p2.x;
				var targetY = (this.p1.y-this.p2.y)*this.ratio + this.p2.y;

				context.lineTo(targetX, targetY);
				context.stroke();
			}

			context.restore();

			this.ratio = this.ratio + 0.1;
  		}

	}

	return Line;

})(jQuery);




// コンパス
var Compass = (function($){
	var MAX_SIZE = 3;
	
	var Compass = function(){
		this.points = new Array();
		this.segments = new Array();
	}

	Compass.prototype.push = function(point){
		if( this.points.length < MAX_SIZE-1 ){
			this.points.push(point);

			if(this.count() >= 2){
				this.segments.push( new Segment(this.points[0], point) );
			}

		}
		else {
			var p1 = this.points[0];
			var p2 = this.points[1];

			var radious = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
			var center = point;

			drawer.pushArc(center, radious);

			this.points = new Array();
			this.segments = new Array();
		}
	}

	Compass.prototype.count = function(){
		return this.points.length;
	}

	Compass.prototype.draw = function(context){
		this.points.forEach(function(point){
			point.draw(context, 'rgba(255, 0, 0, 0.8)');
		});

		this.segments.forEach(function(segment){
			segment.draw(context, 'rgba(255, 0, 0, 0.8)');
		});
	}

	return Compass;

})(jQuery);


// 定規
var Ruler = (function($){
	var MAX_SIZE = 2;

	var Ruler = function(){
		this.points = new Array();
	}

	Ruler.prototype.push = function(point){
		if( this.points.length < MAX_SIZE-1 ){
			this.points.push(point);

		}
		else {
			var p1 = this.points[0];
			var p2 = point;

			drawer.pushLine(p1, p2);

			this.points = new Array();
		}
	}

	Ruler.prototype.count = function(){
		return this.points.length;
	}

	Ruler.prototype.draw = function(context){
		this.points.forEach(function(point){
			point.draw(context, 'rgba(0, 0, 255, 0.8)');
		});
	}

	return Ruler;

})(jQuery);


var FPS = 60;


var Drawer = (function($){
	var Drawer = function(){
		this.points = new Array();
		this.lines  = new Array();
		this.arcs   = new Array();
	}

	Drawer.prototype.pushLine = function(point1, point2){
		this.lines.push(new Line(point1, point2));
	};

	Drawer.prototype.pushArc = function(center, radious){
		this.arcs.push(new Arc(center, radious));
	}

	return Drawer;

})(jQuery);

var drawer = new Drawer();



$(function() {
	var canvas = $('canvas')[0];

    canvas.width  = window.innerWidth;
    canvas.style.width  = canvas.width+'px';  
    canvas.height = window.innerHeight;
    canvas.style.height = canvas.height+'px';  


    var context = canvas.getContext('2d');


    var compass =  new Compass();
    var ruler   =  new Ruler();
    
    var mode = ruler; // 最初は定規


	$("#menu-ruler").click(function(){
		$("#menu").children().removeClass('selected');
		$(this).addClass('selected');

		mode = ruler;
	});

	$("#menu-compass").click(function(){
		$("#menu").children().removeClass('selected');
		$(this).addClass('selected');

		mode = compass;
	});


    $('canvas').click( function(event){
		// クリックの度に canvas の左上座標を取得する
		var rect = $(event.target).offset();

		var x = event.pageX - rect.left;
		var y = event.pageY - rect.top;

		mode.push(new Point(x, y));

	});

    function draw(){
    	context.clearRect(0, 0, canvas.width, canvas.height)

		drawer.lines.forEach(function(line){
			line.draw(context, 'rgba(155, 155, 155, 0.8)');
		});

		drawer.arcs.forEach(function(arc){
			arc.draw(context, 'rgba(155, 155, 155, 0.8)');
		});

    	mode.draw(context);

		setTimeout(function(){
			draw();
		}, 1000/FPS);
    }

	draw();
});
