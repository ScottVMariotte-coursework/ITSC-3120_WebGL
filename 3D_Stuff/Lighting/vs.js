var myVertexShader = `

	uniform vec4 ambiantProduct, diffuseProduct, specularProduct;
	attribute vec4 vPosition;
	attribute vec4 vColor;
	
	varying vec4 color;
	
	uniform mat4 M_comp;
	uniform mat4 M_per;
	uniform mat4 M_cam;
	
	uniform vec4 lightPosition;
	uniform float shininess;
	
	void main() {
		
		vec3 pos = -(M_cam * vPosition).xyz;
		vec3 light = lightPosition.xyz;
		vec3 L = normalize(light-pos);
		
		vec3 E = normalize(-pos);
		vec3 H = normalize(L + E);
		
		vec3 N = normalize((M_cam * vNormal).xyz);
		
		vec4 ambiant = ambiantProduct;
		
		float Kd = max(dot(L,N),0.0);
		vec4 diffuse = Kd * diffuseProduct;
		
		float Ks = pow(max(dot(N,H),0.0),shininess);
		vec4 specular = Ks * specularProduct;
		
		if(dot(L,N) < 0.0){
			specular = vec4(0.0,0.0,0.0,1.0);
		}
		
		//fColor = ambiant + diffuse + specular;
		//fColor.a = 1.0;
		
		gl_Position = M_per*M_cam*M_comp*vPosition;
		//gl_Position = M_comp*vPosition;
		
		color = ambiant + diffuse + specular;
		color.a = 1.0;
	}
`;

