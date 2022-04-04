
class Planet{
	
	constructor(primary,diameter,distance,perihelion,aphelion,orbitalPeriod,rotate,texture){
		this.primary = primary;
		this.diameter = diameter;
		this.distance = distance * Math.pow(10,6);
		this.perihelion = perihelion * Math.pow(10,6);
		this.aphelion = aphelion * Math.pow(10,6);
		
		this.orbitalPeriod = orbitalPeriod;
		this.rotate = rotate;
		
		this.texture = texture;
	}
	getPrimary(){
		return this.primary;
	}
	primaryIsNull(){
		if(this.primary){
				return false;
		}else{
			return true;
		}
	}
	getDiameter(){
		return this.diameter;
	}
	getDistance(){
		return this.distance;
	}
	getOrbitalPeriod(){
		return this.orbitalPeriod;
	}
	bindTexture(){
		gl.bindTexture( gl.TEXTURE_2D, this.texture);
	}
}