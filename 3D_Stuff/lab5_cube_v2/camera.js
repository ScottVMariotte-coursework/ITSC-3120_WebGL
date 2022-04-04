
var n,u,v,pos;

class Camera {
  constructor(pos) {
	this.pos = pos;
	//var target = [pos[0],pos[1],pos[2]-1];
	this.n = normalize(subtractVectors(pos,[0,0,0]));
	console.log(this.n);
	this.v = normalize(cross([0,1,0],this.n));
	this.u = normalize(cross(this.n,this.v));
  }
  
  getTransform(){
	  return lookAt(this.pos,[0,0,0],[0,1,0]);
	  
	  return [
		vec4(this.v,-dot(this.v,this.pos)),
		vec4(this.u,-dot(this.u,this.pos)),
		vec4(this.n,-dot(this.n,this.pos)),
		vec4(0,0,0,1)
	]
  }
  update(){
	this.n = normalize(subtractVectors(this.pos,[0,0,0]));
	this.v = normalize(cross([0,1,0],this.n));
	this.u = normalize(cross(this.n,this.v));
  }
  orbit(angle, axis){
	var r = rotate(angle,axis);
	this.pos.matrix = true;
	var p = mult(r,vec4(this.pos,1));
	this.pos = vec3(p);
	
	this.n = normalize(subtractVectors(this.pos,[0,0,0]));
	this.v = normalize(cross([0,1,0],this.n));
	this.u = normalize(cross(this.n,this.v));
  }
}