var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;

var tri_verts = [];

var mod;
var view;
var per;

var cam_view;
var cam_fix;

var u_amb, u_diff, u_spec, u_pos, u_shin, u_normal;

var l_p_v;

// all initializations
window.onload = function init() {
    // get canvas handle
    canvas = document.getElementById( "gl-canvas" );

	// WebGL Initialization
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
	if ( !gl ) {
		alert( "WebGL isn't available" );
	}
	view_a = new ViewPort( 0, 0, canvas.width/2, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	view_b = new ViewPort( canvas.width/2, 0, canvas.width/2, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

	// create shaders, compile and link program
	program = createShaders();
    gl.useProgram(program);

	// create the colored cube
	
	createColorCube();
	//createSphear(0);
	//console.log(tri_verts.length);
    // buffers to hold cube vertices and its colors
    vBuffer = new Buffer(gl.ARRAY_BUFFER);
	
	vBuffer.bind();
	vBuffer.setData(tri_verts);
	
    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	//vColor = gl.getAttribLocation(program, "vColor");
	//gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	//gl.enableVertexAttribArray(vColor );
	
	mod = new Uniform(program, "M_mod", "mat4");
	view = new Uniform(program, "M_view", "mat4");
	per = new Uniform(program, "M_per", "mat4");
	
	u_amb = new Uniform(program, "ambiantProduct", "vec4");
	u_diff = new Uniform(program, "diffuseProduct", "vec4");
	u_spec = new Uniform(program, "specularProduct", "vec4");
	u_pos = new Uniform(program, "lightPosition", "vec4");
	u_shin = new Uniform(program, "shininess", "float");
	u_normal = new Uniform(program, "vNormal", "vec4")
	
	cam_fix = new Camera([1,1,1],90,1);
	cam_fix.lookAt([0,0,0]);
	cam_view = new Camera([0,0,1],90,1);
	
	
	gl.enable(gl.DEPTH_TEST);
    render();
}
//
//-----------------Use keys to switch rotations-------------------!!
//
	var ghost = vec2(0,0);
	var input = 0;
	var kXZ = [0,0];
	window.onkeydown = function(event){
		var c = event.code;
		if(c == "KeyW" || c == "KeyS"){
			if(c == "KeyW" && kXZ[1] != 1){
				kXZ[1] ++;
			}else if(kXZ[1] != -1 && c == "KeyS"){
				kXZ[1] --;
			}
		}else if(c == "KeyA" || c == "KeyD"){
			if(c == "KeyA" && kXZ[0] != 1){
				kXZ[0] ++;
			}else if(kXZ[0] != -1 && c == "KeyD"){
				kXZ[0] --;
			}
		}
	}
	
	window.onkeyup = function(event){
		var c = event.code;
		if(c == "KeyW" || c == "KeyS"){
			if(c == "KeyW" && kXZ[1] != -1){
				kXZ[1] --;
			}else if(kXZ[1] != 1 && c == "KeyS"){
				kXZ[1] ++;
			}
		}else if(c == "KeyA" || c == "KeyD"){
			if(c == "KeyA" && kXZ[0] != -1){
				kXZ[0] --;
			}else if(kXZ[0] != 1 && c == "KeyD"){
				kXZ[0] ++;
			}
		}
	}
	
	window.onmousedown = function(event){
		input = 1;
	};
	window.onmouseup = function(){
		input = 0
	};
	
	window.onmousemove = function(event){
		if(input){
			rX = event.x - ghost[0];
			rY = event.y - ghost[1];
			cam_view.rotate_fps(-rY,rX);
		}
		ghost = vec2(event.x,event.y);
	};

// all drawing is performed here
function render(){
	view_b.set();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	cam_view.move_fps([kXZ[0]*-.02,0,kXZ[1]*.02]);
	
	

	mod.setData(identity4());
	view.setData(cam_view.getMatrix());
	per.setData(cam_view.getPerspective_proj());
	
	for(var i = 0 ; i < tri_verts.length - 3; i+= 3){
		l_a_v = vec4(.2,.2,.2,1);
		l_d_v = vec4(1,1,1,1);
		l_s_v = vec4(1,1,1,1);
		l_p_v = vec4(1,2,3,1)
		
		m_a_v = vec4(1,0,1,1);
		m_d_v = vec4(1,.8,0,1);
		m_s_v = vec4(1,.8,0,1);
		
		m_sh_v = 100;
	
		emission = vec4(0,.3,.3,1);
		
		var ambiantProduct = mult(l_a_v,m_a_v);
		var diffuseProduct = mult(l_d_v,m_d_v);
		var specularProduct = mult(l_s_v,m_s_v);
		
		p1 = tri_verts[i];
		p2 = tri_verts[i+1];
		p3 = tri_verts[i+2];
		
		var t1 = subtract(p2,p1);
		var t2 = subtract(p3,p1);
		var normal = vec4(normalize(cross(t1,t2)));
		
		u_pos.setData(l_p_v);
		u_shin.setData(m_sh_v);
		u_amb.setData(ambiantProduct);
		u_diff.setData(diffuseProduct);
		u_spec.setData(specularProduct);
		u_normal.setData(normal);
		
		gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length );
		
	}
	
	view_a.set();
	view.setData(cam_fix.getMatrix());
	per.setData(cam_fix.getPerspective_proj());
	for(var i = 0 ; i < tri_verts.length - 3; i+= 3){
		l_a_v = vec4(.2,.2,.2,1);
		l_d_v = vec4(1,1,1,1);
		l_s_v = vec4(1,1,1,1);
		l_p_v = vec4(1,2,3,1)
		
		m_a_v = vec4(1,0,1,1);
		m_d_v = vec4(1,.8,0,1);
		m_s_v = vec4(1,.8,0,1);
		
		m_sh_v = 100;
	
		emission = vec4(0,.3,.3,1);
		
		var ambiantProduct = mult(l_a_v,m_a_v);
		var diffuseProduct = mult(l_d_v,m_d_v);
		var specularProduct = mult(l_s_v,m_s_v);
		
		p1 = tri_verts[i];
		p2 = tri_verts[i+1];
		p3 = tri_verts[i+2];
		
		var t1 = subtract(p2,p1);
		var t2 = subtract(p3,p1);
		var normal = vec4(normalize(cross(t1,t2)));
		
		u_pos.setData(l_p_v);
		u_shin.setData(m_sh_v);
		u_amb.setData(ambiantProduct);
		u_diff.setData(diffuseProduct);
		u_spec.setData(specularProduct);
		u_normal.setData(normal);
		
		gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length );
		
	}
	gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length );
	
	setTimeout(
        function (){requestAnimFrame(render);}, 10
    );
}


// create a colored cube with 8 vertices and colors at
// at each vertex
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
	tri_verts.push(a);
	tri_verts.push(b);
	tri_verts.push(c);
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

function createTri (i) {
	var vertices  = dolphins_data.vertices;
	return [vec3(vertices[i[0]]), vec3(vertices[i[1]]), vec3(vertices[i[2]])]
}

function createQuad (a, b, c, d) {
	var vertices  = getCubeVertices();
	//var vertex_colors  = getCubeVertexColors();

	// Each quad is rendered as two triangles as WebGL cannot
	// directly render a quad

	var indices = [ a, b, c, a, c, d ];

	for ( var i = 0; i < indices.length; ++i ) {
		tri_verts.push(vertices[indices[i]]);
		//tri_colors.push(vertex_colors[indices[i]]);
	}
}

// function that does all shader initializations and 
// returns the compiled shader program
function createShaders () {
    			// Create program object
    program = gl.createProgram();
    			//  Load vertex shader
				
	vertexShader = new Shader(myVertexShader_Local, gl.VERTEX_SHADER)
	//vertexShader = new Shader(myVertexShader, gl.VERTEX_SHADER)
	vertexShader.attach(program);
	
    			//  Load fragment shader
	fragmentShader = new Shader(myFragmentShader, gl.FRAGMENT_SHADER)
	fragmentShader.attach(program);
	
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
