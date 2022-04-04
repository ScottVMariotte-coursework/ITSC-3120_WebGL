
//Make the look of the camrea a point that  orbits around the cam
//Based height determan pitch and movment speed
class CameraBounded{
	constructor(pos,fov,aspect,bound,primary){
		this.bound = vec3(0,bound*4,bound*15);
		this.primary = primary;
		this.locked_Matrix = [];
		this.last = null;
		this.yaw = -90;
		this.pitch = 0;
		this.far = 999999999;
		this.near = .1;
		
		this.fov = fov;
		this.aspect = aspect;
		
		this.pos = pos;
		this.n = normalize(subtract(subtract(pos,vec3(0,0,1)), pos));
		this.u = normalize(vec3(0,1,0));
		this.v = normalize(cross(this.n,this.u));
		
		//this.n = normalize(this.n);
		//this.v = normalize(this.v);
		//this.u = normalize(this.u);
		
		this.n = vec3(-this.n[0],-this.n[1],-this.n[2]);
	}
	
	setPrimary(primary){
		this.primary = primary;
	}
	
	getPrimary(){
		return this.primary;
	}
	
	getPosition(){
		return this.pos;
	}
	
	getPosition_Relitive(v){
		var p = [this.pos[0]+v[0],this.pos[1]+v[1],this.pos[2]+v[2]];
		return p;
	}
	
	getDirection(){
		return this.n;
	}
	
	lookAt(at){
		this.n = normalize( subtract(at, this.pos) );
		this.u = [0,1,0];
		this.v = normalize( cross(this.n, this.u) );       
		this.u = normalize( cross(this.v, this.n) );
		
		this.n = [-this.n[0],-this.n[1],-this.n[2],];
	}
	
	rotate_fps(pitch, yaw){
		this.yaw += yaw;
		this.pitch += pitch;
		
		if(this.pitch > 80 | this.pitch < -80){
			this.pitch = (this.pitch / Math.abs(this.pitch))* 80;
		}
		
		this.n[1] = Math.sin(radians(this.pitch));
		this.n[0] = Math.cos(radians(this.pitch)) * Math.cos(radians(this.yaw));
		this.n[2] = Math.cos(radians(this.pitch)) * Math.sin(radians(this.yaw));
		
		//console.log(this.n);
		
		this.v = normalize(cross(this.n,[0,1,0]));
		this.u = normalize(cross(this.v,this.n));
		
		this.n = vec3(-this.n[0],-this.n[1],-this.n[2]);
	}
	
	rotateOrigin(o,angle,s){
		//if(s == 0){
		//	s = 1;
		//}
		
		var move
		if(this.last){
			var move = mult(translate(-this.last[0],-this.last[1],-this.last[2]),o);
			this.pos = vec3(mult(translate(move[0],move[1],move[2]),vec4(this.pos)));
		}

		this.pos = vec3(mult_mv(translate(-o[0],-o[1],-o[2]),vec4(this.pos)));
		//this.pos = vec3(mult_mv(scale(s,s,s),vec4(this.pos)));
		this.pos = vec3(mult_mv(rotate(angle,[0,1,0]),vec4(this.pos)));
		this.pos = vec3(mult_mv(translate(o[0],o[1],o[2]),vec4(this.pos)));
		this.last = o;
	}
	
	rotate(angle, axis){
		
		axis = normalize(axis);
		
		var c = Math.cos( radians(angle) );
		var s = Math.sin( radians(angle) );
		var omc = 1.0 - c;

		var v = axis;
		
		var x = v[0];
		var y = v[1];
		var z = v[2];
		
		
		var r = [
			vec3( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s),
			vec3( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s),
			vec3( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c)
		];
		r.matrix = true;

		this.n = normalize(mult(r,this.n));
		this.v = normalize(cross(this.n,[0,1,0]));
		this.u = normalize(cross(this.v,this.n));
		
		this.n = vec3(-this.n[0],-this.n[1],-this.n[2]);
	}
	//Set Up for bounded movment
	move(xyz) {
		var z = this.pos[1];	
		var s = 1000/(this.bound[1]/(z+0));
		s = 1;
		this.pos = vec3(this.pos[0]+(xyz[0]),
						this.pos[1]+(xyz[1]),
						this.pos[2]+(xyz[2]));
	}
	//Set Up for bounded movment
	move_fps(xyz) {
		var x = xyz[0];
		var z = xyz[2];
		
		xyz[0] = -(x * Math.sin(radians(this.yaw))) + (z * Math.cos(radians(this.yaw)));
		xyz[2] = (x * Math.cos(radians(this.yaw))) + (z * Math.sin(radians(this.yaw)));
		
		this.pos = vec3(this.pos[0]+xyz[0],
						this.pos[1]+xyz[1],
						this.pos[2]+xyz[2]);
	}
	
	getMatrix_Relitive(v){
		var p = [this.pos[0]+v[0],this.pos[1]+v[1],this.pos[2]+v[2]];
		var m =  [
			vec4(this.v[0],this.v[1],this.v[2],-dot(this.v,p)),
			vec4(this.u[0],this.u[1],this.u[2],-dot(this.u,p)),
			vec4(this.n[0],this.n[1],this.n[2],-dot(this.n,p)),
			vec4(0,0,0,1)
		];
		m.matrix = true;
		return m;
	}
	getPerspective_proj_Relitive(v){
		var distance = this.far - this.near;
		var f = 1.0 / Math.tan( radians(this.fov) / 2 );
		
		var m = [
			vec4(f / this.aspect,0,0,0),
			vec4(0,f,0,0),
			vec4(0,0,-parseFloat((this.near + this.far)) / distance,parseFloat(-2 * this.near * this.far / distance)),
			vec4(0,0,-1,0)
		];
		m.matrix = true;
		return m;
	}
	
	getMatrix(){
		var m =  [
			vec4(this.v[0],this.v[1],this.v[2],-dot(this.v,this.pos)),
			vec4(this.u[0],this.u[1],this.u[2],-dot(this.u,this.pos)),
			vec4(this.n[0],this.n[1],this.n[2],-dot(this.n,this.pos)),
			vec4(0,0,0,1)
		];
		m.matrix = true;
		return m;
	}
	getPerspective_proj(){
		var distance = this.far - this.near;
		var f = 1.0 / Math.tan( radians(this.fov) / 2 );
		
		var m = [
			vec4(f / this.aspect,0,0,0),
			vec4(0,f,0,0),
			vec4(0,0,-parseFloat((this.near + this.far)) / distance,parseFloat(-2 * this.near * this.far / distance)),
			vec4(0,0,-1,0)
		];
		m.matrix = true;
		return m;
	}
}