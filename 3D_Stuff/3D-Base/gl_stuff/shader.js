
class Shader{
	constructor(str, type){
		this.data = str;
		this.type = type;
		
		this.shader = gl.createShader(type);
		gl.shaderSource(this.shader, this.data);
		gl.compileShader(this.shader);
		
		compiled = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
		if (!compiled) {
			console.error(gl.getShaderInfoLog(this.shader));
		}
	}
    
	attach(program){
		gl.attachShader(program, this.shader);
	}
	
}