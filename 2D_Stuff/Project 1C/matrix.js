function identity(size){
	var matrix = [];
	for(var i = 0; i < size; i ++){
		matrix.push([]);
		for(var c = 0; c < size; c ++){
			if(c == i){
				matrix[i].push(1);
			}else{
				matrix[i].push(0);
			}
		}
	}
	return matrix;
}

function cameraTransform(xyz,tx,ty,tz){
	t = translate(xyz[0]*-1,xyz[1]*-1,xyz[2]*-1);
	r = rotate(angle);
}

function translate(translationFactors){
	matrix = identity(translationFactors.length + 1);
	
	for(var i = 0; i < translationFactors.length; i ++){
		matrix[i][matrix.length -1] = translationFactors[i];
		console.log(matrix);
	}
	return matrix;
}

function rotate(angle,axis){

    if ( !Array.isArray(axis) ) {
        axis = [ arguments[1], arguments[2], arguments[3] ];
    }

    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        vec4( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s, 0.0 ),
        vec4( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s, 0.0 ),
        vec4( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c,   0.0 ),
        vec4()
    );

    return result;
}

function scale(scaleFactors){
	matrix = identity(scaleFactors.length + 1);
	
	for(var i = 0; i < scaleFactors.length; i ++){
		matrix[i][i] = matrix[i][i] * scaleFactors[i];
	}
	return matrix;
}

function matVecMult(M1,V1){
	var vec = [];
	for(var a = 0; a < M1.length; a ++){
		var c = 0;
		for(var b = 0; b < V1.length; b++){
			c += M1[a][b] * V1[b];
		}
		vec.push(c);
	}
	return vec;
}

function matMult(M1,M2){
	var mat = [];
	for(var z = 0; z < M1.length; z ++){//row
		var vec = [];
		for(var a = 0; a < M2.length; a ++){//col
			var c = 0;

			for(var b = 0; b < M2.length; b ++){//row
				c+= M1[z][b] * M2[b][a];
			}
			vec.push(c);
		}
		mat.push(vec);
	}
	return mat;
}