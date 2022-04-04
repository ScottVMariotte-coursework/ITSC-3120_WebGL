
var gl;

var delay = 100;

var wY_max = 10;
var wX_max = 10;
var wY_min = -10;
var wX_min = -10;

var points;
var bufferLength = 0;

var size = 0;
var inputType = 0;

var minMax;

window.onload = function init() {

    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    points = [];
	
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	minMax = gl.getUniformLocation( program, "minMax");
	gl.uniform2f(minMax, wX_max,wY_max);
	
	var input = 0;
	
	window.onmousedown = function(event){
		input = 1;
		if(event.x <= canvas.width & event.y <= canvas.height & inputType == 0){
			var ndc = deviceToNdc(canvas,[event.x,event.y]);
			var w_ndc = ndcToWorld(canvas,ndc);
			
			points.push(vec2(w_ndc[0],w_ndc[1]));
			gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
			
		}else if(inputType == 2){
				var index = -1;
				var minDist = 9999999;
				
				for(var i =0; i < points.length; i ++){
					var xy = deviceToNdc(canvas, [event.x,event.y]);
					xy = ndcToWorld(canvas, [xy[0], xy[1]]);
					var d = Math.sqrt(Math.pow((xy[0] - points[i][0]),2) + Math.pow((xy[1] - points[i][1]),2))
					
					if(d < minDist & d < .5){
						index = i;
						minDist = d;
					}
				}
				
				if(index != -1){
					document.getElementById("coord").innerHTML = 
					"index : " + index + 
					"	x : " + points[index][0] + 
					"	y : " + points[index][1];
				}
		}
		
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input == 1 & inputType != 2){
			
			var ndc = deviceToNdc(canvas,[event.x,event.y]);
			var w_ndc = ndcToWorld(canvas,ndc);

			if(inputType == 1){
				points.push(vec2(w_ndc[0],w_ndc[1]));
				gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
			}
			
			document.getElementById("coord").innerHTML = 
			"Device (Mouse) Coords : " + event.x + " " + event.y + 
			"\nWorld Coords (Device-->World) : " + w_ndc[0] + " " + w_ndc[1] +
			"\nNDC (World-->NDC) : " + ndc[0] + " " + ndc[1];
		}
	};
	
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    gl.drawArrays(gl.POINTS, 0,points.length);
	
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function ndcToWorld(canvas,ndc){
	var w_ndc_x = wX_max * (ndc[0]);
	var w_ndc_y = wY_min * (ndc[1]);
	return [w_ndc_x, w_ndc_y]
}

function deviceToNdc(canvas,xy){
	ndc_x = -1.0 + 2.0 * xy[0]/canvas.width;
	ndc_y =   1.0 - 2.0 * xy[1]/canvas.height;
	return [ndc_x,ndc_y]
}


function find(){
	inputType = 2;
}

function change(){
	inputType = 0;
}

function draw(){
	inputType = 1;
}

function clearBuff(){
	points = [];
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function submit(){
	wX_min = parseInt(document.getElementById("Xmin").value);
	wX_max = parseInt(document.getElementById("Xmax").value);
	
	wY_min = parseInt(document.getElementById("Ymin").value);
	wY_max = parseInt(document.getElementById("Ymax").value);
	
	gl.uniform2f(minMax, wX_max,wY_max);
	clearBuff();
}


