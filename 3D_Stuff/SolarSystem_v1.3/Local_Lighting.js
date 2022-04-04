var myVertexShader_Local = `

	uniform vec4 vNormal;
	attribute vec4 vPosition;
	
	varying vec3 N, L ,E, color;
	uniform vec4 lightPosition;
	
	uniform mat4 M_mod;
	uniform mat4 M_per;
	uniform mat4 M_view;
	
	void main() {
		
		color = vec3(vNormal);
		
		vec3 pos = -(M_view * vPosition).xyz;
		vec3 light = lightPosition.xyz;
		
		L = normalize(light - pos);
		E = -pos;
		N = normalize((M_view * vNormal).xyz);
		gl_Position = M_per*M_view*M_mod*vPosition;
	}
`;

