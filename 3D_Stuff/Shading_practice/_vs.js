var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec2 vTexCoord;
	
	varying vec4 fColor;
	varying vec2 fTexCoord;
	
	varying vec3 fragPos;
	varying vec3 fragNormal;
	varying vec3 ld;
	
	uniform mat4 M_mod;
	uniform mat4 M_rot;
	uniform mat4 M_view;
	uniform mat4 M_per;
	uniform vec3 viewPos;
	
	void main()
	{
		fragPos = vec3(M_mod*vPosition);
		ld = normalize(vec3(vec3(0,0,0)-fragPos));
		fragNormal = normalize(vec3(M_rot*vPosition));
		
		gl_Position = M_per*M_view*M_mod*vPosition;
		fTexCoord = vTexCoord;
	}
`;

