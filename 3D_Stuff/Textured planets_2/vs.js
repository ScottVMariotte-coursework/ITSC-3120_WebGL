var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	attribute vec2 vTexCoord;
	
	varying vec4 fColor;
	varying vec2 fTexCoord;
	varying vec3 fragNormal;
	varying vec3 sun_d;
	
	uniform mat4 M_mod;
	uniform mat4 M_view;
	uniform mat4 M_per;
	uniform mat4 M_rot;
	void main()
	{
		fColor = vec4(0,1,0,1);
		
		sun_d = vec3(normalize(vPosition));
		
		gl_Position = M_per*M_view*M_mod*vPosition;
		//gl_Position = M_per*M_view*M_mod * rz * vPosition;
		
		fragNormal = vec3(M_rot*vPosition);
		fTexCoord = vTexCoord;
	}
`;

