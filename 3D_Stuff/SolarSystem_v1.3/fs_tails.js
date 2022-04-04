var fs_tails =`
	precision mediump float;
	varying vec4 fColor;
	varying vec2 fTexCoord;
	varying vec3 fragNormal;
	varying vec3 sun_d;
	varying float fB;
	
	uniform sampler2D texture;
	
	void main() {
		
		if(fB == 1.0){
			gl_FragColor = texture2D(texture, fTexCoord);
		}else{
			vec3 ambiant_i = vec3(0,0,0); 
			vec3 sun_i = vec3(1.5,1.5,1.2);
			vec3 sun_d = vec3(0,0,1);
			vec4 tex = texture2D(texture, fTexCoord);
		
			vec3 light_i = ambiant_i + sun_i * max(dot(fragNormal, sun_d),0.0);
		
			gl_FragColor = vec4(tex.rgb * light_i,tex.a);
		}
		
		
		
		
		
		//gl_FragColor = texture2D(texture, fTexCoord);
	}
`;