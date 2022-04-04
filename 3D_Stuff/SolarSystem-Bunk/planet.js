
class Planet{
	
	constructor(diameter,distance,perihelion,aphelion,orbitalPeriod,roation, texture){
		
		this.diameter = diameter;
		this.distance = distance * Math.pow(10,6);
		this.perihelion = perihelion * Math.pow(10,6);
		this.aphelion = aphelion * Math.pow(10,6);
		
		this.orbitalPeriod = orbitalPeriod;
		this.texture = texture;
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