var fs_tails =`
	precision mediump float;
	varying vec4 fColor;
	varying vec2 fTexCoord;
	
	varying vec3 fragPos;
	varying vec3 fragNormal;
	varying vec3 ld;
	
	uniform vec3 vp;
	uniform sampler2D texture;
	
	void main() {
		vec3 amb = vec3(0,0,0); 
		
		vec3 light_color = vec3(1,1,1);
		float si = 6.0;
		
		vec3 vd = normalize(vp - fragPos);
		vec3 rd = reflect(-ld,fragNormal);
		float st = 0.9;
		float s = pow(max(dot(vd,rd),0.0),32.0);
		vec3 spec = st * s * light_color;
		
		vec3 diff = max(dot(fragNormal, ld), 0.0) * light_color;
		
		vec4 tex = texture2D(texture, fTexCoord);
		gl_FragColor = vec4((spec)* si * tex.rgb,tex.a);
		gl_FragColor = vec4(vd, 1);
		//gl_FragColor = vec4(0,1,0,1);
	}
`;