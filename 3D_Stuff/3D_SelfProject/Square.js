var gl;
var delay = 10;

var kXZ;

var vPosition
var oBuffer
var iBuffer
var fBuffer
var fiBuffer
var vColor

var translation;
var tMatrix;
var rMatrix;
var otMatrix;
var floorIndex;

var rX = 0;
var rY = 0;
var tXZ = [0,0];


var cube

window.onload = function init() {

    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	//Arr to bind to buffs
	cube = new GObject([],[],"cube");
	floor = [
		vec3(500,-.5,500),
		vec3(-500,-.5,500),
		vec3(500,-.5,-500),
		vec3(-500,-.5,-500)
	]
	floorIndex = vec4(0,1,2,3);

	vObjects = cube.verts;
	iObjects = cube.facesAsArr();
	
	var fColors = [
		vec4(.7,.7,.7,1.0),
		vec4(.7,.7,.7,1.0),
		vec4(.7,.7,.7,1.0),
		vec4(.7,.7,.7,1.0)
	]
	
	var colors = [
		vec4(1.0,0.0,0.0,1.0),
		vec4(0.0,1.0,0.0,1.0),
		vec4(0.0,0.0,1.0,1.0),
		vec4(1.0,1.0,0.0,1.0),
		vec4(0.0,1.0,1.0,1.0),
		vec4(1.0,0.0,1.0,1.0)
	];
	
	//Buffers
	fBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(floor), gl.STATIC_DRAW);
	
	fiBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fiBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndex), gl.STATIC_DRAW);
	
    oBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, oBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vObjects), gl.STATIC_DRAW);
	
	iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iObjects), gl.STATIC_DRAW);
	
	vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
	fcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fColors), gl.STATIC_DRAW);
	
	vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false,0,0) ;
	gl.enableVertexAttribArray(vColor);
	
	//Matrices
	proj = perspective(90,canvas.width/canvas.height,.1,1000.0);
	console.log(proj);
	var pMatrix = gl.getUniformLocation(program, "p");
	gl.uniformMatrix4fv(pMatrix, false,flatten(proj) );
	
	rot = rotate(0,[1,1,1]);
	rMatrix = gl.getUniformLocation(program, "r");
	gl.uniformMatrix4fv(rMatrix, false,flatten(rot) );
	
	translation = translate(0,0,0);
	tMatrix = gl.getUniformLocation(program, "t");
	gl.uniformMatrix4fv(tMatrix, false,flatten(translation));
	
	
	
	var ghost = vec2(0,0);
	var input = 0;
	kXZ = [0,0]
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
			rX += event.x - ghost[0];
			rY += event.y - ghost[1];
			
			var yM = rotate(rY,[1,0,0]);
			var xM = rotate(rX,[0,1,0]);
			rot = mult(xM,yM);
			console.log(rX);
		}
		ghost = vec2(event.x,event.y);
	};
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	tXZ = add(tXZ,[
	kXZ[0]*.1,
	kXZ[1]*.1 
	]);
	translation = translate(
	tXZ[0]*.2,
	0,
	tXZ[1]*.2);
	
	gl.uniformMatrix4fv(tMatrix, false,flatten(translation));
	gl.uniformMatrix4fv(rMatrix, false,flatten(rot) );
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, fcBuffer);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false,0,0) ;
	gl.enableVertexAttribArray(vColor);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fiBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, fBuffer);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	gl.drawElements(gl.TRIANGLE_STRIP, floorIndex.length, gl.UNSIGNED_SHORT,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false,0,0) ;
	gl.enableVertexAttribArray(vColor);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, oBuffer);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
    gl.drawElements(gl.LINES, iObjects.length, gl.UNSIGNED_SHORT,0);
	
	
	
	
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

