
var gl;

var delay = 100;

var wY_max = 10;
var wX_max = 10;
var wY_min = -10;
var wX_min = -10;

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
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	//***
	//*^*
	//***
	
    var points = [];
	
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	minMax = gl.getUniformLocation( program, "minMax");
	gl.uniform2f(minMax, wX_max,wY_max);
	
	var input = 0;
	
	var ghost = [0,0];
	window.onmousedown = function(event){
		input = 1;
		if(event.x <= canvas.width & event.y <= canvas.height & inputType == 0){
			var ndc = deviceToNdc(canvas,[event.x,event.y]);
			var w_ndc = ndcToWorld(canvas,ndc);
			
			ghost = ndc;
			
			points.push(vec2(w_ndc[0],w_ndc[1]));
			bufferLength ++;
			
			gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
			//console.log(points);
		}
		
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input == 1){
			
			var ndc = deviceToNdc(canvas,[event.x,event.y]);
			var w_ndc = ndcToWorld(canvas,ndc);
			
			//size = .1 / Math.sqrt(Math.pow((ndc[0] - ghost[0]),2) + Math.pow((ndc[1] - ghost[1]),2));
			//ghost = ndc;
			if(inputType == 1){
				points.push(vec2(w_ndc[0],w_ndc[1]));
				bufferLength ++;
				gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
			}
			
			
			
			document.getElementById("coord").innerHTML = "Device (Mouse) Coords : " + event.x + " " + event.y + 
			"\nWorld Coords (Device-->World) : " + w_ndc[0] + " " + w_ndc[1] +
			"\nNDC (World-->NDC) : " + ndc[0] + " " + ndc[1];
			
		}
	};
	
    render();
}
//Gets data from html, rebinds element buffer, updates length for draw call, changes draw state.
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

function submit(){
	wX_min = parseInt(document.getElementById("Xmin").value);
	wX_max = parseInt(document.getElementById("Xmax").value);
	
	wY_min = parseInt(document.getElementById("Ymin").value);
	wY_max = parseInt(document.getElementById("Ymax").value);
	
	gl.uniform2f(minMax, wX_max,wY_max);
	
	inputType = parseInt(document.getElementById("type").value);
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    gl.drawArrays(gl.POINTS, 0,bufferLength);
	
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
