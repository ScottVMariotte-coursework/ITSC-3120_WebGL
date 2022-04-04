var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	varying vec4 color;

	uniform mat4 M_comp;
	uniform mat4 M_cam;
	uniform mat4 M_orth;
	
	void main() {
		gl_Position = M_orth*M_cam*M_comp*vPosition;
		//gl_Position = M_comp*vPosition;
		color = vColor;
	}
`;

