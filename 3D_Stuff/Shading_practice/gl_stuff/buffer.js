
class Buffer {
	constructor(type){
		this.type = type;
		this.buffer = gl.createBuffer();
	}
	bind(){
		gl.bindBuffer(this.type,this.buffer);
	}
	getData(){
		return this.data;
	}
	setData(arr){
		this.data = arr;
		gl.bufferData(this.type, flatten(arr) ,gl.STATIC_DRAW);
	}
}