var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	varying vec4 color;

	uniform mat4 M_comp;

	void main() {
		gl_Position = M_comp*vPosition;
		color = vColor;
	}
`;

