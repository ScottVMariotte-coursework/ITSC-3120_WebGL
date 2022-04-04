
var gl;

var delay = 100;

var wX_min, wX_max = 0;
var wY_min, wY_max = 0;
var length = 0;
var renderState = 4;

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
		vec2(0.0,1.0),
		vec2(-1.0,0.0),
		vec2(0.0,-1.0),
		vec2(1.0,0.0)
	];
	
	indices = [0,1,2,0,3,2];
	length = indices.length;
	//The color Vertices
	var cVertices = [
        vec4( 0.0, 1.0, 0.0, 1.0 ),
		vec4( 1.0, 0.0, 0.0, 1.0 ),
		vec4( 1.0, 0.0, 1.0, 1.0 ),
		vec4( 0.0, 0.0, 1.0, 1.0 )
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
	
	var iBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
    // Initialize event handlers
  /*  
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1': //Changes the state to draw using TRIANGLES mehthod 
			renderState = gl.TRIANGLES;
			indices = [0,1,2,0,2,3];
			length = indices.length;
            break;
		 case '2': //Changes the state to draw using TRIANGLE_FAN mehthod 
			renderState = gl.TRIANGLE_STRIP;
			indices = [1,2,0,3];
			length = indices.length;
            break;
          case '3': //Changes the state to draw using TRIANGLE_FAN mehthod 
			renderState = gl.TRIANGLE_FAN;
			indices = [0,1,2,3];
			length = indices.length;
            break;
          case '4'://Changes the state to draw using LINE_LOOP mehthod 
			renderState = gl.LINE_LOOP;
			indices = [0,1,2,3];
			length = indices.length;
            break;
        }
		*/
    //}
	
	
	var input = 0;
	var m_x, m_y = 0;
	var ndc_x, ndc_y = 0;
	var w_ndc_x, w_ndc_y = 0;
	
	window.onmousedown = function(){
		input = 1;
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input == 1){
			m_x = event.x;
			m_y = event.y;
			
			ndc_x = -1.0 + 2.0 * m_x/canvas.width;
			ndc_y =   1.0 - 2.0 * m_y/canvas.height;
			
			w_ndc_x = wX_min + 2.0 * wX_max * (m_x/canvas.width);
			w_ndc_y = wY_max + 2.0 * wY_min * (m_y/canvas.height);
			
			document.getElementById("coord").innerHTML =  "Device (Mouse) Coords : " + m_x + " " + m_y + 
			"\nWorld Coords (Device-->World) : " + w_ndc_x + " " + w_ndc_y +
			"\nNDC (World-->NDC) : " + ndc_x + " " + ndc_y;
		}
	};
	
    render();
}
//Gets data from html, rebinds element buffer, updates length for draw call, changes draw state.
function submit(){
	wX_min = parseInt(document.getElementById("Xmin").value);
	wX_max = parseInt(document.getElementById("Xmax").value);
	
	wY_min = parseInt(document.getElementById("Ymin").value);
	wY_max = parseInt(document.getElementById("Ymax").value);
	
	var state = document.getElementById("state").value;
        switch(state) {
          case "0": //Changes the state to draw using TRIANGLES mehthod 
			renderState = gl.TRIANGLES;
			indices = [0,1,2,0,2,3];
			length = indices.length;
            break;
		 case "1": //Changes the state to draw using TRIANGLE_FAN mehthod 
			renderState = gl.TRIANGLE_STRIP;
			indices = [1,2,0,3];
			length = indices.length;
            break;
          case "2": //Changes the state to draw using TRIANGLE_FAN mehthod 
			renderState = gl.TRIANGLE_FAN;
			indices = [0,1,2,3];
			length = indices.length;
            break;
          case "3"://Changes the state to draw using LINE_LOOP mehthod 
			renderState = gl.LINE_LOOP;
			indices = [0,1,2,3];
			length = indices.length;
            break;
		}
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawElements(renderState, length, gl.UNSIGNED_SHORT,0);
			
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
