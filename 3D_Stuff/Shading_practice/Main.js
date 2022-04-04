var canvas;
var gl;

var program;
var compiled;

var TEXTURE;

var DistScale = .0001;
var DiameterScale = .0001;
var TimeScale = .01;
var time = 0;
var user_scale = 1;


var planets = [];
var planet_Verts = [];
var planet_Color_Verts = [];
var planet_Map_Verts = [];

var planet_vBuffer, planet_cBuffer, planet_tBuffer, tail_vBuffer,tail_cBuffer;

var mod, vp;
var scal;
var view;
var per;
var rot;
var rot_a;
var b;

var view_a,view_b;

var cam_view, cam_bound;
var vPosition,vColor;

// all initializations
window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
	if ( !gl ) {
		alert( "WebGL isn't available" );
	}
	
	
	gl.clearColor( .0, .0, .0, 1 );
	gl.clear( gl.COLOR_BUFFER_BIT );
	// create shaders, compile and link program
	program = createShaders();
    gl.useProgram(program);
	
	createSphear(6);
	for(var i = 0; i < planet_Verts.length; i ++){
		planet_Color_Verts.push(vec4(1,0,0,1));
	}
	
	view_a = new ViewPort( 0, 0, canvas.width/2, canvas.height );
	view_b = new ViewPort( canvas.width/2, 0, canvas.width/2, canvas.height );
	
    //
	//vBuffer and vPosition
	//
    planet_vBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_vBuffer.bind();
	planet_vBuffer.setData(planet_Verts);
	//
	//cBuffer and vColor
	//
    planet_cBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_cBuffer.bind();
	planet_cBuffer.setData(planet_Color_Verts);
	//
	//tBuffer and vTexCoord
	//
	planet_tBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_tBuffer.bind();
	planet_tBuffer.setData(planet_Map_Verts);
	
	vColor = gl.getAttribLocation(program, "vColor");
	vPosition = gl.getAttribLocation(program, "vPosition");
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );

	
	mod = new Uniform(program, "M_mod", "mat4");
	rot = new Uniform(program, "M_rot", "mat4");
	vp = new Uniform(program, "viewPos", "vec3");
	view = new Uniform(program, "M_view", "mat4");
	per = new Uniform(program, "M_per", "mat4");
	
	//cam_view = new Camera([0,5,0],95,1);

	cam_bound = new CameraBounded([0,0,4],95,(canvas.width/2)/canvas.height,45000,0);
	cam_b = new CameraBounded([0,10,.1],110,(canvas.width/2)/canvas.height,45000,0);
	//cam_bound.rotate_fps(-45,0);
	
	image = new Image();
	image.src = "./earthmap_2.jpg";
	image.onload = function() { 
			TEXTURE = configureTexture(image);
			gl.enable(gl.DEPTH_TEST);
			render();
		}
}

//
//-----------------Use keys to switch rotations-------------------!!
//

	var ghost = vec2(0,0);
	var input = 0;
	var check = -1;
	var on_sc = 0;
	var kXYZ = [0,0,0];
	var R = 0;
	var W = 0;
	
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
				R ++;
			}else if(kXYZ[0] != -1 && c == "KeyD"){
				kXYZ[0] --;
				R --;
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
				R --;
			}else if(kXYZ[0] != 1 && c == "KeyD"){
				kXYZ[0] ++;
				R ++;
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
		
		X = event.x;
		Y = event.y;
		if(X <= canvas.width & Y <= canvas.height){
			on_sc = 1;
		}else{
			on_sc = 0;
		}
		
	};
	
	window.onwheel = function(event){
		value = event.wheelDeltaY/120;
		if(on_sc == 1){
			if(value == 1){
				W = 1.5;
			}else if(value == -1){
				W = .5;
			}
		}
		
	};

// all drawing is performed here
var theta = 0;
function render(){
	//console.log("r");
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	cam_bound.move([kXYZ[0]*-.02,kXYZ[1]*.02,kXYZ[2]*-.02]);
	
	//if(kXYZ[0] != 0){
	//	cam_bound.rotateOrigin([0,0,0],kXYZ[0],1);
	//}

	t = translate(0,0,10);
	r = rotate(theta,[0,1,0]);
	
	m = mult(r,t);
	mod.setData(m);
	rot.setData(r);
	v = vec3(mult(m,[0,0,0,1]));
	
	cam_bound.lookAt([0,0,0]);
	cam_b.lookAt([0,0,0]);
	view.setData(cam_bound.getMatrix_Relitive(v));
	per.setData(cam_bound.getPerspective_proj_Relitive(v));
	vp.setData(cam_bound.getPosition_Relitive(v));
	
	//mod.setData(identity4());
	planet_vBuffer.bind();
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
		
	planet_cBuffer.bind();
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
		
	planet_tBuffer.bind();
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vTexCoord);
	
	gl.bindTexture( gl.TEXTURE_2D, TEXTURE);
	view_a.set();
	gl.drawArrays(gl.TRIANGLES, 0, planet_Verts.length );
	
	
	view_b.set();
	
	view.setData(cam_b.getMatrix());
	per.setData(cam_b.getPerspective_proj());
	
	gl.drawArrays(gl.TRIANGLES, 0, planet_Verts.length );
	
	
	theta += .6;
	setTimeout(
        function (){requestAnimFrame(render);}, 1
    );
}

function createSphear(sub){
	var va = vec4(0,0,-1,1);
	var vb = vec4(0,.942809,.333333,1);
	var vc = vec4(-.816497,-.471405,.333333,1);
	var vd = vec4(.816497,-.471405,.333333,1);

	tetra(va,vb,vc,vd,sub);
}

function tetra(a,b,c,d,n){
	divideTriangle(a,b,c,n);
	divideTriangle(d,c,b,n);
	divideTriangle(a,d,b,n);
	divideTriangle(a,c,d,n);
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
	a = vec3(a);
	b = vec3(b);
	c = vec3(c);
	
	planet_Verts.push(a);
	planet_Verts.push(b);
	planet_Verts.push(c);
	
	planet_Map_Verts.push(uv(a));
	planet_Map_Verts.push(uv(b));
	planet_Map_Verts.push(uv(c));
}
function uv(d){
	return vec2(
		(Math.atan2(d[0],d[2]) / Math.PI) / 2.0 + 0.5 
		,
		(Math.asin(-d[1]) / (Math.PI / 2.0)) / 2.0 + 0.5 
		);
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
	
	//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
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
