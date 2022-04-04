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
var planet_Map_Verts = [];

var tail_Verts = [];
var tail_Color_Verts = [];
var tail_Map_Verts = [];
var tail_texture;

var selected = -1;

var planet_vBuffer, planet_cBuffer, planet_tBuffer, tail_vBuffer,tail_cBuffer;

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
	createTail(100,-180);
	for(var i = 0; i < planet_Verts.length; i ++){
		planet_Color_Verts.push(vec4(1,0,0,1));
	}
	
	//
	//vBufferTail
	//
	tail_vBuffer = new Buffer(gl.ARRAY_BUFFER);
	tail_vBuffer.bind();
	tail_vBuffer.setData(tail_Verts);
	//
	//cBufferTail
	//
	tail_cBuffer = new Buffer(gl.ARRAY_BUFFER);
	tail_cBuffer.bind();
	tail_cBuffer.setData(tail_Color_Verts);
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
	//tail_Map_Verts
	planet_tBuffer = new Buffer(gl.ARRAY_BUFFER);
	planet_tBuffer.bind();
	planet_tBuffer.setData(planet_Map_Verts);
	//
	//tBuffer tail
	//
	tail_tBuffer = new Buffer(gl.ARRAY_BUFFER);
	tail_tBuffer.bind();
	tail_tBuffer.setData(tail_Map_Verts);
	
	vColor = gl.getAttribLocation(program, "vColor");
	vPosition = gl.getAttribLocation(program, "vPosition");
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );

	
	mod = new Uniform(program, "M_mod", "mat4");
	view = new Uniform(program, "M_view", "mat4");
	per = new Uniform(program, "M_per", "mat4");
	
	//
	//Uniforms
	//
	u_amb = new Uniform(program, "ambiantProduct", "vec4");
	u_diff = new Uniform(program, "diffuseProduct", "vec4");
	u_spec = new Uniform(program, "specularProduct", "vec4");
	u_pos = new Uniform(program, "lightPosition", "vec4");
	u_shin = new Uniform(program, "shininess", "float");
	u_normal = new Uniform(program, "vNormal", "vec4")
	
	
	//cam_view = new Camera([4700,11000,23000],90,1);
	cam_view = new Camera([0,0,0],95,1);
	
								//pos,fov,aspect,bound,primer
	cam_bound = new CameraBounded([0,25000,45000],95,1,45000,0);
	cam_bound.rotate_fps(-45,0);
	
	createPlanets();
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
		
		var primary = [];
		p = planets[i];
		while(p){
			p = p.getPrimary();
			if(p){
				primary.push(p);
			}
		}
		
		var m_r, m_t, m_s, m_mod;
		m_mod = identity4();
		m_mod.matrix = true;
		
		var n_mod;
		for(var p = 0 ; p < primary.length; p++){
				d = primary[p].getDistance()  * DistScale;
				o = primary[p].getOrbitalPeriod();
				
				if(o == 0){ 
					m_r = identity4(); 
					m_r.matrix = true;
				}else {
					o = (time * TimeScale / o) * 360;
					m_r = rotate(o,[0,1,0]);
					m_r.matrix = true;
				}
				
				m_t = translate(0,0,d);
				m_t.matrix = true;
				m_mod = mult(m_mod,mult(m_r,m_t));
		}
		
		d = planets[i].getDistance()  * DistScale;
		s = planets[i].getDiameter()  * DiameterScale;
		
		o = planets[i].getOrbitalPeriod();
		if(o == 0){
			m_r = identity4(); 
			m_r.matrix = true;
		}else {
			o = (time * TimeScale / o) * 360;
			m_r = rotate(o,[0,1,0]);
			m_r.matrix = true;
		}
	
		//Creating Model matrix
		m_r = rotate(o,[0,1,0]);
		m_t = translate(0,0,d);
		m_s = scale([s,s,s]);
		
		temp_mod = m_mod;
		m_mod = mult(m_mod,mult(m_r,mult(m_t,m_s)));
		mod.setData(m_mod);
		
		//if(cam_bound.getPrimary() == i){
		//	v = vec4(0,0,0,1);
		//	v = mult_mv(m_mod,v)
		//	console.log(v);
		//	cam_bound.lookAt(vec3(v));
		//}
		
		if(check != -1){
			//var trace = normalize(mult(cam_view.getPerspective_proj(),mult(cam_view.getMatrix(),	mult(m_mod,vec4(0,0,0,1)))));
			var trace = normalize(mult(cam_bound.getPerspective_proj(),mult(cam_bound.getMatrix(),	mult(mult(m_mod,mult(m_r,mult(m_t,m_s))),vec4(0,0,0,1)))));
			x = (ghost[0] / (canvas.width/2)) -1;
			y = (ghost[1] / (canvas.height/2)) -1;
			click = normalize(vec4(x,y));
			click[1] = -click[1];
			click = vec2(click);
			
			var diff = subtract(vec2(trace),click);
			if(((Math.abs(diff[0]) < .1) & Math.abs(diff[0]) < closest[0]) & 
			   ((Math.abs(diff[1]) < .1) & Math.abs(diff[1]) < closest[1]))
				{
				check = i+1;
				closest = vec2(Math.abs(diff[0]),Math.abs(diff[1]));
				selected = i;
			}
		}
		
		//Binding buffers Drawing planets
		planets[i].bindTexture();
		
		planet_vBuffer.bind();
		gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		
		planet_cBuffer.bind();
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		
		planet_tBuffer.bind();
		gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(vTexCoord);
		
		gl.drawArrays(gl.TRIANGLES, 0, planet_Verts.length );
		
		//Setting up Model Matrix for Planet Tails
		m_s = scale([d,d,d]);
		mod.setData(mult(temp_mod,mult(m_r,m_s)));
		
		//Binding buffers Drawing Tails
		gl.bindTexture( gl.TEXTURE_2D, tail_texture);
		
		tail_vBuffer.bind();
		gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		
		tail_cBuffer.bind();
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		
		tail_tBuffer.bind();
		gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(vTexCoord);
		
		gl.drawArrays(gl.LINES, 0, tail_Verts.length );
	}
	if(!(check -1 <= -1)){
		//cam_bound.setLock(selected);
		console.log(selected);
		check = -1;
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
	//11
	tail = new Image();
	tail.src = "./tail.jpg";
	tail.onload = function() { tail_texture = configureTexture(tail);}
	
	var c = 0;
	image = new Image();
	image.src = "./sunmap.jpg";
	if(c == 0){
		image.onload = function() { planets.push(new Planet(null ,864340/1	,0		,0		,0		,0	,0	,configureTexture(image)));}
		c++;
	}
	
	
	image2 = new Image();
	image2.src = "./mercurymap.jpg";
	if(c == 1){
		image2.onload = function() { planets.push(new Planet(planets[0]	,3032	,36.0	,28.6	,43.4	,88.0	,1407.6		,configureTexture(image2)));}
		c++;
	}
	
	image3 = new Image();
	image3.src = "./venusmap.jpg";
	if(c == 2){
		image3.onload = function() { planets.push(new Planet(planets[0]	,7521	,67.2	,66.8	,67.7	,224.7	,-5832.5	,configureTexture(image3)));}
		c++;
	}
	if(c == 3){
	image4 = new Image();
	image4.src = "./earthmap.jpg";
	image4.onload = function() { planets.push(new Planet(planets[0]	,7926	,93.0	,91.4	,94.5	,365.2	,23.9		,configureTexture(image4)));}
		c++;
	}
	if(c == 4){
	image5 = new Image();
	image5.src = "./marsmap.jpg";
	image5.onload = function() { planets.push(new Planet(planets[0]	,4221	,141.6	,128.4	,154.9	,687.0	,24.6		,configureTexture(image5)));}
		c++;
	}
	if(c == 5){
	image6 = new Image();
	image6.src = "./mercurymap.jpg";
	image6.onload = function() { planets.push(new Planet(planets[0]	,88846	,483.8	,460.1	,507.4	,4331	,9.9		,configureTexture(image6)));}
		c++;
	}
	if(c == 6){
	image7 = new Image();
	image7.src = "./saturnmap.jpg";
	image7.onload = function() { planets.push(new Planet(planets[0]	,74897	,890.8	,840.4	,941.1	,10747	,10.7		,configureTexture(image7)));}
		c++;
	}
	if(c == 7){
	image8 = new Image();
	image8.src = "./uranusmap.jpg";
	image8.onload = function() { planets.push(new Planet(planets[0]	,31763	,1784.8	,1703.4	,1866.4	,30589	,-17.2		,configureTexture(image8)));}
		c++;
	}
	if(c == 8){
	image9 = new Image();
	image9.src = "./neptunemap.jpg";
	image9.onload = function() { planets.push(new Planet(planets[0]	,30775	,2793.1	,2761.6	,2824.5	,59800	,16.1		,configureTexture(image9)));}
		c++;
	}
	if(c == 9){
	image10 = new Image();
	image10.src = "./plutomap.jpg";
	image10.onload = function() { planets.push(new Planet(planets[0]	,1464	,3670.0	,2756.9	,4583.2	,90560	,-153.3		,configureTexture(image10)));}
		c++;
	}
	if(c == 10){
	//Moon
	image11 = new Image();
	image11.src = "./earthmap.jpg";
	image11.onload = function() { planets.push(new Planet(planets[3]	,2159	,0.239	,0.226	,0.252	,27.3	,6.7		,configureTexture(image4)));}
		c++;
	}
	if(c == 11){
	//CALLISTO
	image12 = new Image();
	image12.src = "./earthmap.jpg";
	image12.onload = function() { planets.push(new Planet(planets[5]	,2995.631	,1.170041955	,0.226	,0.252	,16.7	,6.7		,configureTexture(image4)));}
		c++;
	}
	if(c == 12){
	//GANYMEDE
	image13 = new Image();
	image13.src = "./earthmap.jpg";
	image13.onload = function() { planets.push(new Planet(planets[5]	,3269.655	,0.6648 ,0.226	,0.252	,7.2	,6.7		,configureTexture(image4)));}
		c++;
	}
	if(c == 13){
	//EUROPA 
	image14 = new Image();
	image14.src = "./earthmap.jpg";
	image14.onload = function() { planets.push(new Planet(planets[5]	,1939.921	,0.41694	,0.226	,0.252	,3.6	,6.7		,configureTexture(image4)));}
		c++;
	}
	if(c == 14){
	//IO
	image15 = new Image();
	image15.src = "./earthmap.jpg";
	image15.onload = function() { planets.push(new Planet(planets[5]	,2263.655	,0.262218643 ,0.226	,0.252	,1.8	,6.7		,configureTexture(image4)));
		gl.enable(gl.DEPTH_TEST);
		render();
	}
		c++;
	}
}
// create a colored cube with 8 vertices and colors at
// at each vertex

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
		
		tail_Map_Verts.push(vec2(a,.5));
		tail_Map_Verts.push(vec2(b,.5));
		for(var i = 1; i < sub - 1;i ++){
			
			v1 = mult(r,v1);
			v2 = mult(r,v2);
			
			tail_Verts.push(vec3(v1));
			tail_Verts.push(vec3(v2));
			
			var a = (sub-i)/sub;
			var b = (sub-(i+1))/sub;
			
			tail_Color_Verts.push(vec4(a,a,a,1));
			tail_Color_Verts.push(vec4(b,b,b,1));
			
			tail_Map_Verts.push(vec2(a,.5));
			tail_Map_Verts.push(vec2(b,.5));
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
		Math.atan2(d[0],d[1]) / (2*Math.PI) + 0.5 
		,
		0.5 - (Math.asin(d[1]) / Math.PI)
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
