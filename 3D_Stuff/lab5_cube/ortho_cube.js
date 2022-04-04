var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;
var selection = 'x';

var NumCubeVertices = 36;
var tri_verts  = []; 
var tri_colors = [];

var vColor, vPosition;

var M_Loc;
var M_Cam;
var cam_pos;
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

	cam_pos = [0,0,1];
	
    render();
}
window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
			cam_pos = [-1,0,0];
            break;
			
          case '2':
			cam_pos = [0,0,-1];
            break;
			
          case '3':
			cam_pos = [1,0,0];
            break;
		  case '4':
			cam_pos = [0,0,1];
            break;
        }
};



// all drawing is performed here
function render(){

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var M_cube;
	var M_camrea;
	
	//-Z
	M_camrea = camTransform(cam_pos,[0,0,0],[0,1,0]);
	console.log(M_camrea);
	
	M_cube = identity4();
	
	gl.uniformMatrix4fv(M_Loc, false, flatten(transpose4x4(M_cube)));
	gl.uniformMatrix4fv(M_Cam, false, flatten(M_camrea));
	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

// Create additional smaller cubes around the central cube. Simply scale
// half size and put them around the original cube. Each will have its own
// transformation and you will draw them separately after the main cube.
// This will help distinguish the views. Make sure the cubes do not result in a // symmetric view - then there is no point to having them!

	requestAnimFrame( render );
}

function camTransform(xyz,l,u){
	var n = [xyz[0]-l[0],  xyz[1]-l[1],  xyz[2]-l[2]];
	
	var v = cross(n,u);
	
	console.log(v);
	return [
		vec4(v[0],v[1],v[2],xyz[0]),
		vec4(u[0],u[1],u[2],xyz[1]),
		vec4(n[0],n[1],n[2],xyz[2]),
		vec4(0,0,0,1)
	]
	
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
