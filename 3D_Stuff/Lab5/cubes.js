var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;
var axes = [1,0,0];
var theta = 0;
var tri_theta = 0;
// count of vertices
var NumCubeVertices = 36;
var numTryVertices = 25;

//Buffers
var v_CubeBuffer;
var vc_CubeBuffer;

//var v_TriBuffer;
//var vc_TriBuffer;

// triangle vertices and colors
var cube_verts  = []; 
var cube_colors = [];

//var cube_verts = [];
//var cube_colors = [];
var vColor, vPosition

var M_Loc;
var M_C;
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
	createColorTri();
	
	v_CubeBuffer = gl.createBuffer();
    vc_CubeBuffer = gl.createBuffer();
	
	vPosition = gl.getAttribLocation(program, "vPosition");
	vColor = gl.getAttribLocation(program, "vColor");
	
	// allocate space for points
	gl.bindBuffer(gl.ARRAY_BUFFER, v_CubeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cube_verts), gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	
	
	gl.bindBuffer( gl.ARRAY_BUFFER, vc_CubeBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(cube_colors), gl.STATIC_DRAW );
	
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );

	M_Loc = gl.getUniformLocation(program, "M_comp");
	M_C = gl.getUniformLocation(program, "M_cam");
	gl.enable(gl.DEPTH_TEST);

    render();
}

window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
			axes = [1,0,0];
			theta = 0;
            break;
			
          case '2':
			axes = [0,1,0];
			theta = 0;
            break;
			
          case '3':
			axes = [0,0,1];
			theta = 0;
            break;
        }
    };

// all drawing is performed here
function render(){
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//-------------Draw Cube--------------
	
	var rot, transl, M_cube, M_cam, M;
	M_cube = identity4();
	m_cam = identity4();
	
	m_cam = translate([-1,0,0])
	m_cam = mult(rotate(90,[0,1,0]),m_cam);
	//m_cam = rotate(90,[0,1,0]);
	gl.uniformMatrix4fv(M_C, false, flatten(m_cam));
	gl.uniformMatrix4fv(M_Loc, false, flatten(M_cube));
	gl.drawArrays(gl.TRIANGLES, 0, cube_verts.length );
	
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
		cube_verts.push(vertices[indices[i]]);
		cube_colors.push(vertex_colors[indices[i]]);
	}
}

function getCubeVertices() {
	return [
        vec3( -0.25, -0.25,  0.25 ),
        vec3( -0.25,  0.25,  0.25 ),
        vec3(  0.25,  0.25,  0.25 ),
        vec3(  0.25, -0.25,  0.25 ),
        vec3( -0.25, -0.25,  -0.25 ),
        vec3( -0.25,  0.25,  -0.25 ),
        vec3(  0.25,  0.25,  -0.25 ),
        vec3(  0.25, -0.25,  -0.25 )
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

function createColorTri(){
	createTri( 1, 2, 3);
	createTri( 4, 2, 3);
	createTri( 0, 1, 2 );
	createTri( 0, 2, 4 );
	createTri( 0, 3, 4 );
	createTri( 0, 1, 3 );
}

function getTriVertices(){
	return [
		vec3(0,.25,0),
		vec3( -0.25,  0.5,  0.25 ),
		vec3(  0.25,  0.5,  0.25 ),
		vec3( -0.25,  0.5,  -0.25 ),
		vec3(  0.25,  0.5,  -0.25 )
	]
}

function getTriVertexColors() {
	return [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    ];
}

function createTri (a, b, c, d) {
	var vertices  = getTriVertices();
	var vertex_colors  = getTriVertexColors();

	// Each quad is rendered as two triangles as WebGL cannot
	// directly render a quad

	var indices = [ a, b, c];

	for ( var i = 0; i < indices.length; ++i ) {
		cube_verts.push(vertices[indices[i]]);
		cube_colors.push(vertex_colors[indices[i]]);
	}
}

function createColoredTetrahedron() {
    var tetra_verts = [
        vec3(0.0, 0.0, 0.0),
        vec3(-0.25, 0.5, 0.25),
        vec3(0.25,  0.5, 0.25),
        vec3(0.25,  0.5, -0.25),
        vec3(-0.25,  0.5,-0.25),
    ];

// TODO - provide colors, etc to create the geometry and attributes
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
