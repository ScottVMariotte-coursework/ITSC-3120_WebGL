var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	attribute vec2 vTexCoord;
	
	varying vec4 fColor;
	varying vec2 fTexCoord;
	
	uniform mat4 M_mod;
	uniform mat4 M_view;
	uniform mat4 M_per;
	void main()
	{
		fColor = vec4(0,1,0,1);
		
		gl_Position = M_per*M_view*M_mod*vPosition;
		//gl_Position = M_per*M_view*M_mod * rz * vPosition;
		fTexCoord = vTexCoord;
	}
`;

