
class ViewPort{
	constructor(x_min,y_min,x_count,y_count){
		this.x_min = x_min;
		this.y_min = y_min;
		this.x_count = x_count;
		this.y_count = y_count;
	}
	
	set(){
		gl.viewport( this.x_min, this.y_min, this.x_count, this.y_count);
	}
}