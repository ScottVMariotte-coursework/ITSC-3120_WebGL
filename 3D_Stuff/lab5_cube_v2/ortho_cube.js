var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;
var selection = 'x';

var ghost = [0,0];
var speed = .1;
var keys = [];

var NumCubeVertices = 36;
var tri_verts  = []; 
var tri_colors = [];

var vColor, vPosition;

var M_Loc;
var M_Cam;
var camera;



// all initializations
window.onload = function init() {
    // get canvas handle
    canvas = document.getElementById( "gl-canvas" );

	// WebGL Initialization
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
	if ( !gl ) {
		alert( "WebGL isn't available" );
	}
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

	// create shaders, compile and link program
	program = createShaders();
    gl.useProgram(program);

	// create the colored cube
	createColorCube();

    // buffers to hold cube vertices and its colors
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();

	// allocate space for points
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW);

    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_colors), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );
	
	M_Loc = gl.getUniformLocation(program, "M_comp");
	M_Cam = gl.getUniformLocation(program, "M_cam");
	
	
	
	gl.enable(gl.DEPTH_TEST);
	
	camera = new Camera([0,0,1]);
	
    render();
}

// all drawing is performed here
function render(){
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var M_cube;
	var M_camrea;
	
	
	//camera.orbit(2,[0,1,0]);
	
	M_camrea = camera.getTransform();
	M_camrea = lookAt([0,0,1],[0,0,0],[0,1,0]);
	console.log(camera.getTransform());
	M_cube = identity4();
	//M_camrea.matrix = true;
	
	
	var orth = ortho(-1,1,-1,1,0,9999);
	console.log(orth);
	var M_Orth = gl.getUniformLocation(program, "M_ortho");
	gl.uniformMatrix4fv(M_Orth, false, flatten(orth));
	
	gl.uniformMatrix4fv(M_Loc, false, flatten(M_cube));
	gl.uniformMatrix4fv(M_Cam, false, flatten(M_camrea));
	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );
	
// Create additional smaller cubes around the central cube. Simply scale
// half size and put them around the original cube. Each will have its own
// transformation and you will draw them separately after the main cube.
// This will help distinguish the views. Make sure the cubes do not result in a // symmetric view - then there is no point to having them!

	requestAnimFrame( render );
}

// create a colored cube with 8 vertices and colors at
// at each vertex
function createColorCube () {
	createQuad( 1, 0, 3, 2 );
	createQuad( 2, 3, 7, 6 );
	createQuad( 3, 0, 4, 7 );
	createQuad( 6, 5, 1, 2 );
	createQuad( 4, 5, 6, 7 );
	createQuad( 5, 4, 0, 1 );
}

function createQuad (a, b, c, d) {
	var vertices  = getCubeVertices();
	var vertex_colors  = getCubeVertexColors();

	// Each quad is rendered as two triangles as WebGL cannot
	// directly render a quad

	var indices = [ a, b, c, a, c, d ];

	for ( var i = 0; i < indices.length; ++i ) {
		verts.push(vertices[indices[i]]);
		vert_colors.push(vertex_colors[indices[i]]);
	}
}

function getCubeVertices() {
	return [
        [ -0.25, -0.25,  0.25 ],
        [ -0.25,  0.25,  0.25 ],
        [  0.25,  0.25,  0.25 ],
        [  0.25, -0.25,  0.25 ],
        [ -0.25, -0.25,  -0.25 ],
        [ -0.25,  0.25,  -0.25 ],
        [  0.25,  0.25,  -0.25 ],
        [  0.25, -0.25,  -0.25 ]
    ];
}
function getCubeVertexColors() {
	return [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
    ];
}

function createQuad (a, b, c, d) {
	var vertices  = getCubeVertices();
	var vertex_colors  = getCubeVertexColors();

	// Each quad is rendered as two triangles as WebGL cannot
	// directly render a quad

	var indices = [ a, b, c, a, c, d ];

	for ( var i = 0; i < indices.length; ++i ) {
		tri_verts.push(vertices[indices[i]]);
		tri_colors.push(vertex_colors[indices[i]]);
	}
}


// function that does all shader initializations and 
// returns the compiled shader program
function createShaders () {
    			// Create program object
    program = gl.createProgram();

    			//  Load vertex shader
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, myVertexShader);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);
    compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!compiled) {
      console.error(gl.getShaderInfoLog(vertexShader));
    }

    			//  Load fragment shader
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, myFragmentShader);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);
    compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled) {
      console.error(gl.getShaderInfoLog(fragmentShader));
    }

    			//  Link program
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      console.error(gl.getProgramInfoLog(program));
    }
	return program;
}

function identity4() {
    var m = [];
    m = [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0],
        ];

    return m;
}
function transpose4x4(m) {
    var result = [];

    result.push ([m[0][0], m[1][0], m[2][0], m[3][0]]);
    result.push ([m[0][1], m[1][1], m[2][1], m[3][1]]);
    result.push ([m[0][2], m[1][2], m[2][2], m[3][2]]);
    result.push ([m[0][3], m[1][3], m[2][3], m[3][3]]);

    return result;
}
