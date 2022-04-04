var myVertexShader = `

attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec2 vTexCoord;

varying vec4 fColor;
varying vec2 fTexCoord;

uniform mat4 M_Model;
uniform mat4 M_Persp;
uniform mat4 M_Camera;

uniform float theta;

void main() {
	float angle = radians(theta);
    float c = cos(angle);
    float s = sin(angle);

    // Remember: these matrices are column-major

    mat4 rz = mat4( c, -s, 0.0, 0.0,
            s,  c, 0.0, 0.0,
            0.0,  0.0, 1.0, 0.0,
            0.0,  0.0, 0.0, 1.0 );

		gl_Position = M_Persp*M_Camera*M_Model * rz * vPosition;
		//gl_Position = M_Persp*M_Camera*M_Model* vPosition;
		fColor = vColor;
		fTexCoord = vTexCoord;
}
`;

