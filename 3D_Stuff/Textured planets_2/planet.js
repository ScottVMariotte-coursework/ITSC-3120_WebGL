
class Planet{
	
	constructor(diameter,distance,perihelion,aphelion,orbitalPeriod,rotate,texture){
		
		this.diameter = diameter;
		this.distance = distance * Math.pow(10,6);
		this.perihelion = perihelion * Math.pow(10,6);
		this.aphelion = aphelion * Math.pow(10,6);
		
		this.orbitalPeriod = orbitalPeriod;
		this.rotate = rotate;
		
		this.texture = texture;
	}
	getRotation(){
		return this.rotate;
	}
	
	getDiameter(){
		return this.diameter;
	}
	getDistance(){
		return this.distance;
	}
	getorbitalPeriod(){
		return this.orbitalPeriod;
	}
	orbit(time){
		
	}
	bindTexture(){
		gl.bindTexture( gl.TEXTURE_2D, this.texture);
	}
}