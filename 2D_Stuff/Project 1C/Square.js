
var gl;

var delay = 100;

var wY_max = 10;
var wX_max = 10;
var wY_min = -10;
var wX_min = -10;

var points;
var lines;
var triangles;

var program;
var pBuffer;
var lBuffer;
var tBuffer;
var translateBuffer;

var vPosition;


var drawState = 2;
var inputType = 0;
var transformType = 0;


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
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	
	
	
    points = [];
	lines = [];
	triangles = [];
	
	pBuffer = gl.createBuffer();
	lBuffer = gl.createBuffer();
	tBuffer = gl.createBuffer();
	translateBuffer = gl.createBuffer();
	
	vPosition = gl.getAttribLocation( program, "vPosition");
	
	var minMax = gl.getUniformLocation( program, "minMax");
	gl.uniform4f(minMax, wX_max, wX_min, wY_max, wY_min);
	
	
	var mouseDown = 0;
	var ghost = [0,0];

	var activeIndex = -1;
	var activeArr = -1;
	window.onmousedown = function(event){
		mouseDown = 1;
		var world = deviceToWorld(canvas,[event.x,event.y]);
		
		var arr = [];
		
		switch(inputType) {
				case 0: //Drawing to arrays
					if(event.x <= canvas.width & event.y <= canvas.height){
						if(drawState == 0){
							gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
							triangles.push(vec2(world[0],world[1]));
							arr = triangles;
						
						}else if(drawState == 1){
							gl.bindBuffer(gl.ARRAY_BUFFER,lBuffer);
							lines.push(vec2(world[0],world[1]));
							arr = lines;
				
						}else if(drawState == 2){
							gl.bindBuffer(gl.ARRAY_BUFFER,pBuffer);
							points.push(vec2(world[0],world[1]));
							arr = points;
						}
						gl.bufferData(gl.ARRAY_BUFFER,flatten(arr),gl.STATIC_DRAW);
					}
					break;
				case 1: //selecting elements
					var trianlge = inTriangle(canvas,[event.x,event.y],triangles);
					var point = findPoint(canvas,[event.x,event.y],points);
					var line = findLine(canvas,[event.x,event.y],lines);
					
					if(point != -1){
						document.getElementById("coord").innerHTML = 
						"index : " + point + 
						"	x : " + points[point][0] + 
						"	y : " + points[point][1];
					}else if(line != -1){
						document.getElementById("coord").innerHTML = 
						"Line : " + ((line + 2) /2);
					}else if(trianlge != -1){
						document.getElementById("coord").innerHTML = 
						"Trianlge : " + ((trianlge + 3) /3);
					}
					break;
				case 2: //transforming 
					console.log("Run")
					var trianlge = inTriangle(canvas,[event.x,event.y],triangles);
					var point = findPoint(canvas,[event.x,event.y],points);
					var line = findLine(canvas,[event.x,event.y],lines);
					console.log(line);
					
					if(point != -1){
						activeIndex = point;
						activeArr = 0;
					}else if(line != -1){
						activeIndex = line;
						activeArr = 1;
					}else if(trianlge != -1){
						activeIndex = trianlge;
						activeArr = 2;
					}
					break;
				default:
				console.log(activeArr);
			}
	};
	window.onmouseup = function(){
		mouseDown = 0;
		activeIndex = -1;
		activeArr = -1;
	};
	
	window.onmousemove = function(event){
		var world = deviceToWorld(canvas,[event.x,event.y]);
		var ndc = worldToNdc(canvas,world);
		var ghostWorld = deviceToWorld(canvas,[ghost[0],ghost[1]]);
		
		
		
		if(mouseDown == 1 ){
				switch(inputType) {
				case 1:
					
					document.getElementById("coord").innerHTML = 
					"Device (Mouse) Coords : " + event.x + " " + event.y + 
					"\nWorld Coords (Device-->World) : " + world[0] + " " + world[1] +
					"\nNDC (World-->NDC) : " + ndc[0] + " " + ndc[1];
					break;
				case 2:
					if(activeIndex != -1){
						switch(transformType){
						case 0:
							var tMatrix = identity(3);
							
							tMatrix[0][2] = (world[0] - ghostWorld[0]);
							tMatrix[1][2] = (world[1] - ghostWorld[1]);
							
							var matricies = [tMatrix];
							
							transformPoints(matricies,activeIndex,activeArr);
							
							break;
						case 1:
							var origin = findOrigin(activeIndex,activeArr);
							
							var toMatrix = identity(3);
							toMatrix[0][2] = -1*origin[0];
							toMatrix[1][2] = -1*origin[1];
							
							var th = (world[0] - ghostWorld[0]);
							var rMatrix = identity(3);
							rMatrix[0][0] = Math.cos(th);
							rMatrix[0][1] = -1*Math.sin(th);
							rMatrix[1][0] = Math.sin(th);
							rMatrix[1][1] = Math.cos(th);
							
							var foMatrix = identity(3);
							foMatrix[0][2] = origin[0];
							foMatrix[1][2] = origin[1];
							
							var matricies = [foMatrix,rMatrix,toMatrix];
							
							transformPoints(matricies,activeIndex,activeArr);

							break;
						case 2:
							var origin = findOrigin(activeIndex,activeArr);
							
							var toMatrix = identity(3);
							toMatrix[0][2] = -1*origin[0];
							toMatrix[1][2] = -1*origin[1];
							
							var s = ( ghostWorld[0] / world[0]);
							
							var sMatrix = identity(3);
							sMatrix[0][0] = s;
							sMatrix[1][1] = s;
							
							var foMatrix = identity(3);
							foMatrix[0][2] = origin[0];
							foMatrix[1][2] = origin[1];
							
							var matricies = [foMatrix,sMatrix,toMatrix];
							
							transformPoints(matricies,activeIndex,activeArr);
							
							break;
						}
					}
					break;
				default:
			}
		};
		ghost = [event.x, event.y];
	}
    render();
}

//
//	Rendering
//

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    draw(gl.POINTS,pBuffer,points.length);
	draw(gl.LINES,lBuffer,lines.length);
	draw(gl.TRIANGLES,tBuffer,triangles.length);
	
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function draw(type,buff,n){
	gl.bindBuffer(gl.ARRAY_BUFFER,buff);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	gl.drawArrays(type, 0,n);
}

//
//

function transformPoints(matricies, activeIndex, activeArr){
	var verts;
	var count;
	var index = activeIndex;
	var transformationMatrix = matricies[matricies.length-1];
	//Combining Matricies
	for(var i = matricies.length -1; i >=1; i --){
		transformationMatrix = matMult(matricies[i-1],transformationMatrix);
	}
	console.log(activeArr);
	//Setting up variables to arrays 
	switch(activeArr){
		case 0:
			gl.bindBuffer(gl.ARRAY_BUFFER,pBuffer);
			verts = points;
			count = 1;
			break;
		case 1:
			gl.bindBuffer(gl.ARRAY_BUFFER,lBuffer);
			verts = lines;
			count = 2;
			break;
		case 2:
			gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
			verts = triangles;
			count = 3;
			break;
	}
	console.log(verts[i]);
	for(var i = index; i < index + count; i ++){
		console.log("index : " + i);
		var vec = verts[i];
		vec.push(1);
		
		vec = matVecMult(transformationMatrix,vec);
		
		//Adding new vec coords to base array
		for(var a = 0; a < verts[index].length; a ++){
			verts[i][a] = vec[a];
		}
		verts[i].pop();
	}
	
	//Applying changes
	switch(activeArr){
		case 0:
			points = verts;
			break;
		case 1:
			lines = verts;
			break;
		case 2:
			triangles = verts;
			break;
	}
	
	gl.bufferData(gl.ARRAY_BUFFER,flatten(verts),gl.STATIC_DRAW);
}

function worldToNdc(canvas,world){
	var ndc_X = (world[0]) / (wX_max - wX_min);
	var ndc_Y = (world[1]) / (wY_max - wY_min);
	
	return [ndc_X, ndc_Y];
}

function deviceToWorld(canvas,xy){
	ndc_x = -1.0 + 2.0 * xy[0] / canvas.width;
	ndc_y =   1.0 - 2.0 * xy[1] / canvas.height;
	
	w_x = wX_min + ((wX_max - wX_min) * xy[0]/canvas.width);
	w_y = wY_min + ((wY_max - wY_min) * xy[1]/canvas.height);
	
	return [w_x,w_y]
}

function inTriangle(canvas,xy,arr){
	xy = deviceToWorld(canvas, [xy[0],xy[1]]);
	var inside = false;
	for(var i =0; i < Math.floor(arr.length / 3) * 3; i += 3){
		
		var a = Math.abs(calcAreaTriangle(arr[i],arr[i+1],arr[i+2]));
		var a_sub = 0;
		for(var c = i; c < i+3; c ++){
			a_sub += Math.abs(calcAreaTriangle(xy,arr[(c%3) + i],arr[(((c%3) + 1)%3)+i]));
		}
		a_sub = Math.round(a_sub * 100000) * 100000;
		a = Math.round(a * 100000) * 100000;
		if(a_sub == a){
			return i;
		}
	}
	return -1;
}

function calcAreaTriangle(pA,pB,pC){
	return ((pA[0]*(pB[1]-pC[1])) + 
				(pB[0]*(pC[1]-pA[1])) + 
				(pC[0]*(pA[1]-pB[1]))) /
				2;
}

function findOrigin(activeIndex, activeArr){
	switch(activeArr){
		case 0:
			return vec2(0,0);
			break;
		case 1:
			var P1 = lines[activeIndex];
			var P2 = lines[activeIndex+1];
			
			return vec2(P1[0] - P2[0],P1[1] - P2[1]);
			
			break;
		case 2:
			var P1 = triangles[activeIndex];
			var P2 = triangles[activeIndex+1];
			var P3 = triangles[activeIndex+2];
			
			return vec2(
				((P1[0]+P2[0]+P3[0])/3),
				((P1[1]+P2[1]+P3[1])/3)
			)
			break;
	}
}

function findLine(canvas,xy,arr){
	xy = deviceToWorld(canvas, [xy[0],xy[1]]);
	console.log("run");
	var index = -1;
	var d = 999999999999;
	for(var i =0; i < arr.length; i +=2){
		var sub_xy = [xy[0],xy[1]];
		var P1 = vec2(arr[i][0],arr[i][1]);
		var P2 = vec2(arr[i+1][0],arr[i+1][1]);
		
		if(P1[0] - P2[0] > 0){
			P1 = vec2(arr[i+1][0],arr[i+1][1]);
			P2 = vec2(arr[i][0],arr[i][1]);
		}

		if(P1[0] < 0){
			P2[0] += Math.abs(P1[0]);
			sub_xy[0] += Math.abs(P1[0]);
			P1[0] += Math.abs(P1[0]);
		}

		if(sub_xy[0] > P1[0] && sub_xy[0] < P2[0]){
			distY = Math.abs(((sub_xy[0]/(P2[0]))*(P2[1]-P1[1]) + P1[1]) - sub_xy[1])
			console.log(distY);
			if(distY < d){
				d = distY;
				index = i;
			}
		}
	}
	if(d < .9){
		return index;
	}else{
		return -1;
	}	
}

function findPoint(canvas,xy,arr){
	xy = deviceToWorld(canvas, [xy[0],xy[1]]);
	
	var index = -1;
	var d = 999999999999;
	for(var i =0; i < arr.length; i ++){
		var sub_d = Math.sqrt(Math.pow((xy[0] - arr[i][0]),2) + Math.pow((xy[1] - arr[i][1]),2));
		//console.log(sub_d);
		if(sub_d < d){
			d = sub_d;
			index = i;
		}
	}
	if(d < .5){
		return index;
	}else{
		return -1;
	}	
}

function submit(){
	xX = [parseInt(document.getElementById("Xmin").value),parseInt(document.getElementById("Xmax").value)];
	yY = [parseInt(document.getElementById("Ymin").value),parseInt(document.getElementById("Ymax").value)];
	
	gl.bindBuffer(gl.ARRAY_BUFFER,pBuffer);
	points = mapBuffs(xX,yY,points);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,lBuffer);
	lines = mapBuffs(xX,yY,lines);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
	triangles = mapBuffs(xX,yY,triangles);
	
	wX_min = xX[0];
	wX_max = xX[1];
	
	wY_min = yY[0];
	wY_max = yY[1];
	
	gl.uniform2f(minMax, wX_max,wY_max);
}

function mapBuffs(xX,yY,verts){
	for (var i = 0; i < verts.length; i ++){
		verts[i] = vec2(verts[i][0] / wX_max * xX[1], verts[i][1] / wY_min * yY[0]);
	}
	gl.bufferData(gl.ARRAY_BUFFER,flatten(verts),gl.STATIC_DRAW);
	return verts;
}

function transform(){
	inputType = 2;
}

function find(){
	inputType = 1;
}

function change(){
	inputType = 0;
}

function clearBuff(){
	points = [];
	lines = [];
	triangles = [];
	
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function translateType(){
	transformType = 0;
}

function rotateType(){
	transformType = 1;
}

function scaleType(){
	transformType = 2;
}

function triangle(){
	drawState = 0;
}

function line(){
	drawState = 1;
}

function point(){
	drawState = 2;
}
