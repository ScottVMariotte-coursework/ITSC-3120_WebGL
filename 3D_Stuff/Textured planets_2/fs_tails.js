var fs_tails =`
	precision mediump float;
	varying vec4 fColor;
	varying vec2 fTexCoord;
	varying vec3 fragNormal;
	varying vec3 sun_d;
	
	uniform sampler2D texture;
	
	void main() {
		
		vec3 ambiant_i = vec3(0,0,0); 
		vec3 sun_i = vec3(5,5,5);
		vec3 sun_d = vec3(0.0,1.0,0.0);
		
		float h = 512.0;
		float w = 1024.0;
		
		vec4 tex = texture2D(texture, vec2(fTexCoord.x,fTexCoord.y));
		
		tex += texture2D(texture, vec2(fTexCoord.x,fTexCoord.y-(2.0/h)));
		tex += texture2D(texture, vec2(fTexCoord.x,fTexCoord.y-(1.0/h)));
		tex += texture2D(texture, vec2(fTexCoord.x,fTexCoord.y+(1.0/h)));
		tex += texture2D(texture, vec2(fTexCoord.x,fTexCoord.y+(2.0/h)));
		
		tex += texture2D(texture, vec2(fTexCoord.x-(2.0/w),fTexCoord.y));
		tex += texture2D(texture, vec2(fTexCoord.x-(1.0/w),fTexCoord.y));
		tex += texture2D(texture, vec2(fTexCoord.x+(1.0/w),fTexCoord.y));
		tex += texture2D(texture, vec2(fTexCoord.x+(2.0/w),fTexCoord.y));
		
		tex = tex / 9.0;
		gl_FragColor = tex;
	}
`;

