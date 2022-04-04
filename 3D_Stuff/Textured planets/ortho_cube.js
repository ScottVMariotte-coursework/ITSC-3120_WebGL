var canvas;
var gl;

var program;
var compiled;

var DistScale = .0001;
var DiameterScale = .0001;
var TimeScale = .01;
var time = 0;

var planets = [];
var planet_Verts = [];
var planet_Color_Verts = [];


var planet_vBuffer, planet_cBuffer;

var mod;
var view;
var per;

var cam_view, cam_bound;
var vPosition,vColor;

// all initializations
window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
	if ( !gl ) {
		alert( "WebGL isn't available" );
	}
	gl.lineWidth(10);
	
	view_a = new ViewPort( 0, 0, canvas.width, canvas.height );
	gl.clearColor( .0, .0, .0, 1 );
	gl.clear( gl.COLOR_BUFFER_BIT );
	// create shaders, compile and link program
	program = createShaders();
    gl.useProgram(program);
	
	createSphear(6);
	
	for(var i = 0; i < planet_Verts.length; i ++){
		planet_Color_Verts.push(vec4(1,0,0,1));
	}
	
    planet_vBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_vBuffer.bind();
	planet_vBuffer.setData(planet_Verts);
	
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	//vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();


    // variables through which shader receives vertex and other attributes

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(planet_Color_Verts), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );
	
    // variables through which shader receives vertex and other attributes
	
	
	
	mod = new Uniform(program, "M_mod", "mat4");
	view = new Uniform(program, "M_view", "mat4");
	per = new Uniform(program, "M_per", "mat4");

	cam_bound = new CameraBounded([0,2,2],95,1,45000);
	cam_bound.rotate_fps(-45,0);
	
	gl.enable(gl.DEPTH_TEST);
    render();
}

//
//-----------------Use keys to switch rotations-------------------!!
//

	var ghost = vec2(0,0);
	var input = 0;
	var check = -1;
	var kXYZ = [0,0,0];
	window.onkeydown = function(event){
		var c = event.code;
		if(c == "KeyW" || c == "KeyS"){
			if(c == "KeyW" && kXYZ[2] != 1){
				kXYZ[2] ++;
			}else if(kXYZ[2] != -1 && c == "KeyS"){
				kXYZ[2] --;
			}
		}else if(c == "KeyA" || c == "KeyD"){
			if(c == "KeyA" && kXYZ[0] != 1){
				kXYZ[0] ++;
			}else if(kXYZ[0] != -1 && c == "KeyD"){
				kXYZ[0] --;
			}
		}else if(c == "Space" || c == "ShiftLeft"){
			if(c == "Space" && kXYZ[1] != 1){
				kXYZ[1] ++;
			}else if(kXYZ[1] != -1 && c == "ShiftLeft"){
				kXYZ[1] --;
			}
		}
	}
	
	window.onkeyup = function(event){
		var c = event.code;
		if(c == "KeyW" || c == "KeyS"){
			if(c == "KeyW" && kXYZ[2] != -1){
				kXYZ[2] --;
			}else if(kXYZ[2] != 1 && c == "KeyS"){
				kXYZ[2] ++;
			}
		}else if(c == "KeyA" || c == "KeyD"){
			if(c == "KeyA" && kXYZ[0] != -1){
				kXYZ[0] --;
			}else if(kXYZ[0] != 1 && c == "KeyD"){
				kXYZ[0] ++;
			}
		}else if(c == "Space" || c == "ShiftLeft"){
			if(c == "Space" && kXYZ[1] != -1){
				kXYZ[1] --;
			}else if(kXYZ[1] != 1 && c == "ShiftLeft"){
				kXYZ[1] ++;
			}
		}
	}
	
	window.onmousedown = function(event){
		X = event.x;
		Y = event.y;
		if(X <= canvas.width & Y <= canvas.height){
			input = 1;
			check = 0;
			ghost = vec2(X,Y);
		}
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input){
			rX = event.x - ghost[0];
			rY = event.y - ghost[1];
			cam_bound.move([-rX,0,-rY]);
			cam_view.rotate_fps(-rY,rX);
		}
		ghost = vec2(event.x,event.y);
	};
	
	window.onwheel = function(event){
		value = event.wheelDeltaY/120;
		if(value == 1){
			cam_bound.move([0,-1,0]);
		}else if(value == -1){
			cam_bound.move([0,1,0]);
		}
	};

// all drawing is performed here
function render(){
	view_a.set();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	cam_bound.move([kXYZ[0]*-1,kXYZ[1],kXYZ[2]*-1]);

	
	view.setData(cam_bound.getMatrix());
	per.setData(cam_bound.getPerspective_proj());
	mod.setData(identity4());
		
		//Binding buffers Drawing planets
	console.log("ca");
	planet_vBuffer.bind();
		

		
	gl.drawArrays(gl.TRIANGLES, 0, planet_Verts.length );
		
	setTimeout(
        function (){requestAnimFrame(render);}, 1
    );
}


// create a colored cube with 8 vertices and colors at
// at each vertex


function createSphear(sub){
	var va = vec4(0,.5,0,1);
	var vb = vec4(0,-.5,0,1);
	
	var vc = vec4(-.5,0,-.5,1);
	var vd = vec4(-.5,0,.5,1);
	
	var ve = vec4(.5,0,-.5,1);
	var vf = vec4(.5,0,.5,1);
	
	tetra(va,vb,vc,vd,ve,vf,sub);
}

function tetra(a,b,c,d,e,f,n){
	divideTriangle(a,c,d,n);
	divideTriangle(a,d,f,n);
	divideTriangle(a,f,e,n);
	divideTriangle(a,c,e,n);
	
	divideTriangle(b,c,d,n);
	divideTriangle(b,d,f,n);
	divideTriangle(b,f,e,n);
	divideTriangle(b,c,e,n);
}


function divideTriangle(a,b,c,n){
	if(n > 0){
		var ab = normalize(mix(a,b,.5), true);
		var ac = normalize(mix(a,c,.5), true);
		var bc = normalize(mix(b,c,.5), true);
		
		divideTriangle(a,ab,ac,n -1);
		divideTriangle(ab,b,bc,n -1);
		divideTriangle(bc,c,ac,n -1);
		divideTriangle(ab,bc,ac,n -1);
	}else{
		triangle(a,b,c);
	}
}

function triangle(a,b,c){
	planet_Verts.push(vec3(a));
	planet_Verts.push(vec3(b));
	planet_Verts.push(vec3(c));
}


// function that does all shader initializations and 
// returns the compiled shader program
function createShaders () {
    			// Create program object
    program = gl.createProgram();
    			//  Load vertex shader
				
	//vertexShader = new Shader(myVertexShader_Local, gl.VERTEX_SHADER)
	VERTEX_SHADER = new Shader(myVertexShader, gl.VERTEX_SHADER)
	VERTEX_SHADER.attach(program);
	
    //  Load fragment shader
	FRAG_TAILS = new Shader(fs_tails, gl.FRAGMENT_SHADER)
	FRAG_TAILS.attach(program);
	
	//FRAG_RED = new Shader(fs_red, gl.FRAGMENT_SHADER)
	//FRAG_RED.attach(program);
    //  Link program
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      console.error(gl.getProgramInfoLog(program));
    }
	return program;
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
