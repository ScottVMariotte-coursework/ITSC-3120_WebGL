var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;
var selection = 'x';
var texture;

var NumCubeVertices = 36;
var tri_verts  = []; 
var tri_colors = [];
var tri_tcoords = [];
var vvol_canonical_cube = [];
var vvol_verts = [];
var vvol_colors = [];
var vv_left, vv_right, vv_bottom, vv_top, vv_near, vv_far;
var image, image2;

var earth_texture, mercury_texture, venus_texture;



// view 2
var eye = [0., 0.5, 1.5];
var at = [0., 0., 0.];
var up = [0., 2., 1.5];

var vBuffer, cBuffer, vv_vBuffer, vv_cBuffer,
	clip_vBuffer, clip_cBuffer;

var vColor, vPosition

// locations for GPU variables
var M_ModelLoc, M_PostOpLoc, M_CameraLoc, M_PerspLoc;

// corresponding matrices
var M_Camera1, M_Camera2, M_Persp, M_Model; 


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
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_colors), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );

	                                // texture coordinate buffer
	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_tcoords), gl.STATIC_DRAW );

					// texture coordinate variables shared with  shader
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vTexCoord);

                        // specify the texture image (can be jpg, tiff, gif) or 
                        // can specify your own image array
    image = new Image();
    image.src = "./earth_texture.jpg";
    image.onload = function() { 
        earth_texture = configureTexture(image);
        console.log ("Image Size:" + image.width + "," + image.height);
    }

	image2 = new Image();
	image2.src = "./mercurymap.jpg";
	image2.onload = function() { 
		mercury_texture = configureTexture(image2);
		console.log ("Image Size:" + image2.width + "," + image2.height);
	}

	image3 = new Image();
	image3.src = "./venusmap.jpg";
	image3.onload = function() { 
		venus_texture = configureTexture(image3);
		console.log ("Image Size:" + image3.width + "," + image3.height);
	}

	M_ModelLoc = gl.getUniformLocation(program, "M_Model");
	M_CameraLoc  = gl.getUniformLocation(program, "M_Camera");
	M_PerspLoc  = gl.getUniformLocation(program, "M_Persp");

	gl.enable(gl.DEPTH_TEST);

	M_Model = identity4();
	M_Camera1 = M_Camera2 = identity4(); 
	M_Persp = identity4();

	// defaults
	vv_left = -0.25; vv_right = 0.25; vv_bottom = -0.25; vv_top = 0.25;
	vv_near = 0.3; vv_far = 15;

    render();
}

// all drawing is performed here
var theta = 0.;
function render(){

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport (0, 0, canvas.width/2, canvas.height);

	M_Camera1 = getCameraXform (eye, at, up);
	M_Persp  = getPerspective(vv_left, vv_right, vv_bottom, vv_top, vv_near, vv_far);
	M_Model = identity4();
	gl.uniformMatrix4fv(M_ModelLoc, false, flatten(transpose4x4(M_Model)));
	gl.uniformMatrix4fv(M_CameraLoc, false, flatten(transpose4x4(M_Camera1)));
	gl.uniformMatrix4fv(M_PerspLoc, false, flatten(transpose4x4(M_Persp)));


    gl.bindTexture( gl.TEXTURE_2D, earth_texture);
	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices);

	// smaller cube on top
	M_Model = matMult4(transl4x4(0., 0.5, 0.), scale4x4(0.5, 0.5, 0.5));
	gl.uniformMatrix4fv(M_ModelLoc, false, flatten(transpose4x4(M_Model)));

    gl.bindTexture( gl.TEXTURE_2D, venus_texture);
	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

	// view 2 - camera rotating around a cube in a circle
	gl.viewport (canvas.width/2, 0, canvas.width/2, canvas.height);

	theta += 1.;
    gl.bindTexture( gl.TEXTURE_2D, mercury_texture);
	rotatingCubes(theta);

	requestAnimFrame( render );
}

function rotatingCubes(theta) {

	// camera rotates around the cube

	M_Model = identity4();

	// camera makes a circular sweep around the cube

	var rads = Math.PI/180.;

	// set view volume params and compute orthographic normalization 
	// transform
		
	var r = 3.
	var eye2 = [r*Math.sin(theta*rads), eye[1], r*Math.cos(theta*rads)]; 
	var up2 = [eye2[0], eye2[1] + 1., eye2[2]];

	M_Camera2 = getCameraXform (eye2, at, up2);
		
	gl.uniformMatrix4fv(M_ModelLoc, false, flatten(transpose4x4(M_Model)));
	gl.uniformMatrix4fv(M_CameraLoc, false, flatten(transpose4x4(M_Camera2)));
	gl.uniformMatrix4fv(M_PerspLoc, false, flatten(transpose4x4(M_Persp)));

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );

	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );
	
	// smaller cube on top
	M_Model = matMult4(transl4x4(0., 0.5, 0.), scale4x4(0.5, 0.5, 0.5));
	gl.uniformMatrix4fv(M_ModelLoc, false, flatten(transpose4x4(M_Model)));
	gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );
}

function getCameraXform (eye, at, up) {
	var n = normalize( [at[0] - eye[0], at[1] - eye[1], at[2] - eye[2]] );
	var up_dir = normalize( [up[0] - eye[0], up[1] - eye[1], up[2] - eye[2]] );
	var u = normalize (cross (n, up_dir));
	var v = normalize (cross (u, n));
	n = negate(n);

	var r_prime = [-dot(u, eye), -dot(v, eye), -dot(n, eye)];

	return [
		[u[0], u[1], u[2], r_prime[0]],
		[v[0], v[1], v[2], r_prime[1]],
		[n[0], n[1], n[2], r_prime[2]],
		[0,    0,    0,    1] 
	];
}

function createColorCube () {
	createQuad( 1, 0, 3, 2 );
	createQuad( 2, 3, 7, 6 );
	createQuad( 3, 0, 4, 7 );
	createQuad( 6, 5, 1, 2 );
	createQuad( 4, 5, 6, 7 );
	createQuad( 5, 4, 0, 1 );
}

function getCubeVertices() {
	return [
        [ -0.5, -0.5,  0.5, 1. ],
        [ -0.5,  0.5,  0.5, 1. ],
        [  0.5,  0.5,  0.5, 1. ],
        [  0.5, -0.5,  0.5, 1. ],
        [ -0.5, -0.5,  -0.5, 1. ],
        [ -0.5,  0.5,  -0.5, 1. ],
        [  0.5,  0.5,  -0.5, 1. ],
        [  0.5, -0.5,  -0.5, 1. ]
    ];
}
function getCubeVertexColors() {
	return [
		[ 1.0, 1.0, 1.0, 1.0 ],  // black
		[ 1.0, 0.0, 0.0, 1.0 ],  // red
		[ 1.0, 1.0, 0.0, 1.0 ],  // yellow
		[ 0.0, 1.0, 0.0, 1.0 ],  // green
		[ 0.0, 0.0, 1.0, 1.0 ],  // blue
		[ 1.0, 0.0, 1.0, 1.0 ],  // magenta
		[ 0.0, 1.0, 1.0, 1.0 ],  // cyan
		[ 1.0, 1.0, 1.0, 1.0 ],  // white
    ];
}

function getCubeTextureCoords() {
	return [ vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0) ];
}

function createQuad (a, b, c, d) {
	var vertices  = getCubeVertices();
	var vertex_colors  = getCubeVertexColors();
	var texture_coords = getCubeTextureCoords();

	// Each quad is rendered as two triangles as WebGL cannot
	// directly render a quad

	var indices = [ a, b, c, a, c, d ];
	var tindices = [0, 1, 2, 0, 2, 3 ];

	for ( var i = 0; i < indices.length; ++i ) {
		tri_verts.push(vertices[indices[i]]);
		tri_colors.push(vertex_colors[a]);
		tri_tcoords.push (texture_coords[tindices[i]]);
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

function getPerspective(l, r, b, t, n, f) {
	var M = [
			[2*n/(r-l), 0, 			0, 				0],
			[0, 		2*n/(t-b), 	0, 				0],
			[0,   		0,     		-(f+n)/(f-n), 	-2*f*n/(f-n)],
			[0,   		0,     		-1,				0]
		];
//console.log ("Mp = " + M);
	return M;
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
//	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	return texture;
}
