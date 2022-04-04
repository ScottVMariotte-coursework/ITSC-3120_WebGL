//Object Refrence
var verts;
var faces;

class GObject {
	constructor(verts,faces,str_object){
		this.verts = verts;
		this.faces = faces;
		
		if(str_object == "cube"){
			this.verts = [
				vec3(-.5,-.5,-.5),
				vec3(-.5,.5,-.5),
				vec3(.5,-.5,-.5),
				vec3(.5,.5,-.5),
				
				vec3(-.5,-.5,.5),
				vec3(-.5,.5,.5),
				vec3(.5,-.5,.5),
				vec3(.5,.5,.5),
			]
			this.faces = [
				vec4(0,1,2,3),
				vec4(0,2,4,6),
				vec4(1,3,5,7),
				vec4(4,5,6,7),
				vec4(0,4,1,5),
				vec4(2,6,3,7)
			]
		}else{
			this.verts = verts;
			this.faces = faces;
		}
	}

	get verts(){
		return verts;
	}
	get faces(){
		return faces;
	}
	set verts(value){
		verts = value;
	}
	set faces(value){
		faces = value;
	}
	
	facesAsArr(){
		var indecies = []
		for(var i = 0; i < faces.length; i ++){
			indecies.push(faces[i][0]);
			indecies.push(faces[i][1]);
			indecies.push(faces[i][2]);
			indecies.push(faces[i][3]);
		}
		return indecies;
	}
}