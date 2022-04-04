var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec2 vTexCoord;
	
	varying vec4 fColor;
	varying vec2 fTexCoord;
	varying vec3 fragNormal;
	varying vec3 sun_d;
	varying float fB;
	
	
	uniform float b;
	uniform mat4 M_mod;
	uniform mat4 M_scale;
	uniform mat4 M_view;
	uniform mat4 M_per;
	uniform mat4 M_rot_a;
	void main()
	{
		fragNormal = vec3(M_rot_a*normalize(vec4(0,0,0,2)-(vPosition)));
		gl_Position = M_per*M_view*M_mod*M_scale*M_rot_a*vPosition;
		
		fColor = vec4(0,1,0,1);

		
		fB = b;
		fTexCoord = vTexCoord;
	}
`;

