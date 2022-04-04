
class Uniform {
	constructor(program, name, type){
		this.uniform = gl.getUniformLocation(program, name);
		this.type = type;
	}
	
	setData(data){
		switch(this.type){
			case "float":
				gl.uniform1f (this.uniform, data); 
				break;
			case "vec2":
				gl.uniform2fv(this.uniform,  data);   
				break;
			case "vec3":
				gl.uniform3fv(this.uniform,  data);
				break;
			case "vec4":
				gl.uniform4fv(this.uniform,  data);
				break;
			case "mat2":
				gl.uniformMatrix2fv(this.uniform, false, flatten(data))
				break;
			case "mat3":
				gl.uniformMatrix3fv(this.uniform, false, flatten(data))
				break;
			case "mat4":
				gl.uniformMatrix4fv(this.uniform, false, flatten(data))
				break;
		}
	}
}