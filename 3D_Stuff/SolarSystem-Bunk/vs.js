var myVertexShader = `
	attribute vec2 vTexCoord;
	attribute vec4 vPosition;
	attribute vec4 vColor;
	
	varying vec4 color;
	varying vec2 fTexCoord;
	
	uniform mat4 M_mod;
	uniform mat4 M_view;
	uniform mat4 M_per;
	
	void main() {
		gl_Position = M_per*M_view*M_mod*vPosition;
		color = vColor;
	}
`;

