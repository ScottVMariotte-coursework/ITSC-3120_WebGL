var fs_tails =`
	precision mediump float;
	varying vec4 color;
	varying vec2 fTexCoord;
	uniform sampler2D texture;
	void main() {
		gl_FragColor =color;
		//gl_FragColor = texture2D(texture, fTexCoord);
	}
`;

