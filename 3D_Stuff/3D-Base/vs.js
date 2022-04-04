var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	varying vec4 color;

	uniform mat4 M_mod;
	uniform mat4 M_view;
	uniform mat4 M_per;
	
	void main() {
		gl_Position = M_per*M_view*vPosition;
		//gl_Position = M_mod*vPosition;
		color = vColor;
	}
`;

