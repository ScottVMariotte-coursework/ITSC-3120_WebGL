
var gl;

var delay = 100;

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
	
    var vertices = [
        vec2(  -1,  1 ),
        vec2(  -1,  0 ),
        vec2( 0,  0 ),
        vec2(  0, 0 ),
		vec2(  0,  1 ),
        vec2( -1,  1 ),
		
		vec2(  -.5,  .5 ),
        vec2(  -1,  1 ),
        vec2( 0,  1),
        vec2(  0, 0 ),
		vec2(  -1, 0 ),
		vec2(  -1,  1 ),
		
		vec2(  0,  1 ),
        vec2(  -1,  1 ),
        vec2( -1,  0 ),
        vec2(  0, 0 ),
		vec2(  0,  1 )
    ];
	//The color Vertices
	var cVertices = [
        vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 ),
		vec4( 0.0, 0.0, 1.0, 1.0 ),
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 ),
		vec4( 0.0, 0.0, 1.0, 1.0 ),
		
		vec4( 0.0, 0.0, 0.0, 1.0 ),
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 ),
		vec4( 1.0, 0.0, 1.0, 1.0 ),
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 ),
		
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 ),
		vec4( 0.0, 0.0, 1.0, 1.0 ),
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 1.0, 0.0, 1.0 )
    ];
	
	// Color buffer
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	//Binding our color vertices to the buffer
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW);
	
	
	var vColor = gl.getAttribLocation( program, "vColor");
	//Specifies vertex information
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	//enables atribute for use in shader
    gl.enableVertexAttribArray(vColor);
	
	
	
    // Create a buffer to hold the  vertices
    var vBuffer = gl.createBuffer();

	// bind it to make it active
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	// send the data as an array to GL
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    				// Associate out shader variables with our data buffer

	// get a location to the vertex position's shader variable ('vPosition')
    var vPosition = gl.getAttribLocation( program, "vPosition");
	
	// specifies the vertex attribute information (in an array), used
	// for rendering 
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	// enable this attribute, with the given attribute name
    gl.enableVertexAttribArray(vPosition);
    
    
	
    // Initialize event handlers
    
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1': //Changes the state to draw using TRIANGLES mehthod 
			gl.clear( gl.COLOR_BUFFER_BIT );
			gl.drawArrays(gl.TRIANGLES, 0, 6);
            break;

          case '2': //Changes the state to draw using TRIANGLE_FAN mehthod 
			gl.clear( gl.COLOR_BUFFER_BIT );
			gl.drawArrays(gl.TRIANGLE_FAN, 6, 6);
            break;

          case '3'://Changes the state to draw using LINE_LOOP mehthod 
            gl.clear( gl.COLOR_BUFFER_BIT );
			gl.drawArrays(gl.LINE_LOOP, 12, 5);
            break;
        }
    };
	
	var input = 0;
	
	window.onmousedown = function(){
		input = 1;
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input == 1){
			var x = event.x;
			var y = event.y;
			ndc_x = -1.0 + 2.0 * x/canvas.width;
			ndc_y =   1.0 - 2.0* y/canvas.height;
			document.getElementById("coord").innerHTML =  "Device Coords : " + x + " " + y + "\nNDC Coords : " +
			ndc_x + " " + ndc_y;
		}else{
			document.getElementById("coord").innerHTML = " ";
		}
				
	};
	
    //render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays(gl.TRIANGLE, 0, 4);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
