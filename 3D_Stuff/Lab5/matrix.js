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

function translate(translationFactors){
	matrix = identity(translationFactors.length + 1);
	
	for(var i = 0; i < translationFactors.length; i ++){
		matrix[i][matrix.length -1] = translationFactors[i];
		console.log(matrix);
	}
	return matrix;
}

function rotate(rotateFactors){
	
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