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

var tail_Verts = [];
var tail_Color_Verts = [];

var selected = -1;

var tail_vBuffer, tail_cBuffer, planet_vBuffer, planet_cBuffer;

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


	createPlanets();
	createSphear(6);
	createTail(100,-180);
	
	for(var i = 0; i < planet_Verts.length; i ++){
		planet_Color_Verts.push(vec4(1,0,0,1));
	}
	
    planet_vBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_vBuffer.bind();
	planet_vBuffer.setData(planet_Verts);
	
	planet_cBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_cBuffer.bind();
	planet_cBuffer.setData(planet_Color_Verts);
	
	tail_vBuffer = new Buffer(gl.ARRAY_BUFFER);
	tail_vBuffer.bind();
	tail_vBuffer.setData(tail_Verts);
	
	tail_cBuffer = new Buffer(gl.ARRAY_BUFFER);
	tail_cBuffer.bind();
	tail_cBuffer.setData(tail_Color_Verts);
	
    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	vColor = gl.getAttribLocation(program, "vColor");
	
	mod = new Uniform(program, "M_mod", "mat4");
	view = new Uniform(program, "M_view", "mat4");
	per = new Uniform(program, "M_per", "mat4");
	
	u_amb = new Uniform(program, "ambiantProduct", "vec4");
	u_diff = new Uniform(program, "diffuseProduct", "vec4");
	u_spec = new Uniform(program, "specularProduct", "vec4");
	u_pos = new Uniform(program, "lightPosition", "vec4");
	u_shin = new Uniform(program, "shininess", "float");
	u_normal = new Uniform(program, "vNormal", "vec4")
	
	//cam_view = new Camera([4700,11000,23000],90,1);
	cam_view = new Camera([0,0,0],95,1);
	
	cam_bound = new CameraBounded([0,25000,45000],95,1,45000);
	cam_bound.rotate_fps(-45,0);
	
	
	image = new Image();
    image.src = "./earthmap.jpg";
    image.onload = function() { 
        earth_texture = configureTexture(image);
        console.log ("Image Size:" + image.width + "," + image.height);
    }
	
	image2 = new Image();
	image2.src =  "./jupitermap.jpg";
	image2.onload = function() { 
		mercury_texture = configureTexture(image2);
		console.log ("Image Size:" + image2.width + "," + image2.height);
	}
	
	image3 = new Image();
	image3.src = "./marsmap.jpg";
	image3.onload = function() { 
		venus_texture = configureTexture(image3);
		console.log ("Image Size:" + image3.width + "," + image3.height);
	}
	
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
	
	TimeScale = document.getElementById("TimeScale").value / 1000;
	//cam_view.move_fps([kXYZ[0]*-10,kXYZ[1]*10,kXYZ[2]*10]);
	cam_bound.move([kXYZ[0]*-1,kXYZ[1],kXYZ[2]*-1]);
	//console.log("Time in Days : " + (time * TimeScale));
	
	//view.setData(cam_view.getMatrix());
	//per.setData(cam_view.getPerspective_proj());
	

	
	view.setData(cam_bound.getMatrix());
	per.setData(cam_bound.getPerspective_proj());
	
	if(check == 0){
		selected = -1;
	}
	var closest = vec2(10,10);
	for(var i = 0; i < planets.length; i++){
		//Grabing data from planet for render
		d = planets[i].getDistance()  		* DistScale;
		s = planets[i].getDiameter()  		* DiameterScale;
		o = planets[i].getorbitalPeriod();
		o = (time * TimeScale / o) * 360;
		
		//Creating Model matrix
		m_r = rotate(o,[0,1,0]);
		m_t = translate(0,0,d);
		m_s = scale([s,s,s]);
		m_mod = mult(m_r,mult(m_t,m_s));
		mod.setData(m_mod);
		//If the player has clicked see if it was a planet
		//To Do : fix selection dosnt subtract right
		
		if(check != -1){
			//var trace = normalize(mult(cam_view.getPerspective_proj(),mult(cam_view.getMatrix(),	mult(m_mod,vec4(0,0,0,1)))));
			var trace = normalize(mult(cam_bound.getPerspective_proj(),mult(cam_bound.getMatrix(),	mult(m_mod,vec4(0,0,0,1)))));
			x = (ghost[0] / (canvas.width/2)) -1;
			y = (ghost[1] / (canvas.height/2)) -1;
			click = normalize(vec4(x,y));
			click[1] = -click[1];
			click = vec2(click);
			
			var diff = subtract(vec2(trace),click);
			if(((Math.abs(diff[0]) < .2) & Math.abs(diff[0]) < closest[0]) & 
			   ((Math.abs(diff[1]) < .2) & Math.abs(diff[1]) < closest[1]))
				{
				check = i+1;
				closest = vec2(Math.abs(diff[0]),Math.abs(diff[1]));
			}
		}
		//console.log("s");
		//Binding buffers Drawing planets
		planet_vBuffer.bind();
		gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		planet_cBuffer.bind();
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		gl.drawArrays(gl.TRIANGLES, 0, planet_Verts.length );
		
		//Setting up Model Matrix for Planet Tails
		m_r = rotate(o,[0,1,0]);
		m_s = scale([d,d,d]);
		mod.setData(mult(m_r,m_s));
		
		//Binding buffers Drawing planets
		tail_vBuffer.bind();
		gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		tail_cBuffer.bind();
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		gl.drawArrays(gl.LINES, 0, tail_Verts.length );
	}
	if(!(check -1 <= -1)){
		cam_bound.setLock(check-1);
	}else{
		check = -1;
	}
	
	time += 1;
	setTimeout(
        function (){requestAnimFrame(render);}, 1
    );
}

function createPlanets(){
	//diameter, distance, perihelion, aphelion, orbitalPeriod
	var texture;
	
	planets.push(new Planet(864340/1	,0		,0		,0		,.100,1 ,texture));
	

	planets.push(new Planet(3032	,36.0	,28.6	,43.4	,88.0,	1407.6,texture));
	

	planets.push(new Planet(7521	,67.2	,66.8	,67.7	,224.7,	-5832.5,texture));
	

	planets.push(new Planet(7926	,93.0	,91.4	,94.5	,365.2,	23.9,texture));
	

	planets.push(new Planet(4221	,141.6	,128.4	,154.9	,687.0,	24.6,texture));
	

	planets.push(new Planet(88846	,483.8	,460.1	,507.4	,4331,	9.9,texture));
	

	planets.push(new Planet(74897	,890.8	,840.4	,941.1	,10747,	10.7,texture));
	

	planets.push(new Planet(31763	,1784.8	,1703.4	,1866.4	,30589,	-17.2,texture));
	

	planets.push(new Planet(30775	,2793.1	,2761.6	,2824.5	,59800,	16.1,texture));
	

	planets.push(new Planet(1464	,3670.0	,2756.9	,4583.2	,90560,	-153.3,texture));
}
// create a colored cube with 8 vertices and colors at
// at each vertex

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

function createTail(sub,angle){
		
		var r = rotate(1*(angle/sub),[0,1,0]);
		var v1 = vec4(0,0,1,1);
		var v2 = mult(r,v1);
		
		tail_Verts.push(vec3(v1));
		tail_Verts.push(vec3(v2));
		
		var a = 1;
		var b = (sub-1)/sub;
		
		tail_Color_Verts.push(vec4(a,a,a,1));
		tail_Color_Verts.push(vec4(b,b,b,1));
		for(var i = 1; i < sub - 1;i ++){
			
			v1 = mult(r,v1);
			v2 = mult(r,v2);
			
			tail_Verts.push(vec3(v1));
			tail_Verts.push(vec3(v2));
			
			var a = (sub-i)/sub;
			var b = (sub-(i+1))/sub;
			
			tail_Color_Verts.push(vec4(a,a,a,1));
			tail_Color_Verts.push(vec4(b,b,b,1));
		}
}

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
