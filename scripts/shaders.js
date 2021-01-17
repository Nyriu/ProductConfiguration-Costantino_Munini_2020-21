// ------- DEFAULT SHADER ------- //
// * point light
// * ambient light
// * env map (cubeMap)
// * irradiance map (cubeMap)
// * normalMap, diffuseMap, metalnessMap, roughnessMap

const vs_default =
`
precision highp float;
precision highp int;
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform float invertTangentW; // can be 1.0 or 0.0

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vec3 objectTangent = vec3( tangent.xyz );
  vec3 transformedTangent = normalMatrix * objectTangent;
  vTangent = normalize( transformedTangent );
  // w is 1 or -1 depending on the sign of det( M tangent )
  vBitangent =
    invertTangentW         * normalize( cross( vNormal, vTangent ) * -tangent.w) +
    (1.0 - invertTangentW) * normalize( cross( vNormal, vTangent ) * tangent.w);
  vUv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_default =
`
precision highp float;
precision highp int;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 ambientLight;
uniform vec3 clight;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform sampler2D metalnessMap;
uniform samplerCube envMap;
uniform samplerCube irradianceMap;
uniform vec2 normalScale;
uniform sampler2D roughnessMap;
uniform vec2 textureRepeat;
const float PI = 3.14159;
#define saturate(a) clamp( a, 0.0, 1.0 )
vec3 cdiff;
vec3 cspec;
float metalness;
float roughness;

float pow2( const in float x ) { return x*x; }

float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevel ) {

  float maxMIPLevelScalar = maxMIPLevel;

  float sigma = PI * roughness * roughness / ( 1.0 + roughness );
  float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

  // clamp to allowable LOD ranges.
  return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

vec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {

  float dotNV = saturate( dot( normal, viewDir ) );

  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

  vec4 r = roughness * c0 + c1;

  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

  vec2 brdf = vec2( -1.04, 1.04 ) * a004 + r.zw;

  return specularColor * brdf.x + brdf.y;
}

vec3 FSchlick(float vDoth, vec3 f0) {
  return f0 + (vec3(1.0)-f0)*pow(1.0 - vDoth,5.0);
}

float DGGX(float NoH, float alpha) {
  float alpha2 = alpha * alpha;
  float k = NoH*NoH * (alpha2 - 1.0) + 1.0;
  return alpha2 / (PI * k * k );
}

float G1(float nDotv, float alpha) {
  float alpha2 = alpha*alpha;
  return 2.0 * (nDotv / (nDotv + sqrt(alpha2 + (1.0-alpha2)*nDotv*nDotv )));
}

float GSmith(float nDotv, float nDotl, float alpha) {
  return G1(nDotl,alpha)*G1(nDotv,alpha);
}

void main() {
  vec4 lPosition = viewMatrix * vec4( pointLightPosition, 1.0 );
  vec3 l = normalize(lPosition.xyz - vPosition.xyz);
  vec3 normal = normalize( vNormal );
  vec3 tangent = normalize( vTangent );
  vec3 bitangent = normalize( vBitangent );
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
  vec3 vReflect = reflect(vPosition,n);
  vec3 r = inverseTransformDirection( vReflect, viewMatrix );
  vec3 worldN = inverseTransformDirection( n, viewMatrix );
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);

  metalness = texture2D( metalnessMap, vUv*textureRepeat ).r;

  cdiff = texture2D( diffuseMap, vUv*textureRepeat ).rgb;
  cdiff = pow( cdiff, vec3(2.2)); // texture in sRGB, linearize

  cspec = (1.0-metalness)*vec3(0.04) + metalness*cdiff;
  cdiff = (1.0-metalness)*cdiff;
  roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map

  float alpha = roughness * roughness;
  
  float specularMIPLevel = getSpecularMIPLevel(alpha, 8.0 * (2.0 - metalness));
  vec3 fresnel = FSchlick(vDoth, cspec);

  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));
  vec3 envLight = textureCubeLodEXT( envMap, vec3(-r.x, r.yz), specularMIPLevel ).rgb;
  // texture in sRGB, linearize
  envLight = pow( envLight, vec3(2.2));
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);

  vec3 outRadiance =
    cdiff * irradiance + // IEM
    envLight * BRDF_Specular_GGX_Environment(n, v, cspec, alpha) + // EM
    PI * clight * nDotl * BRDF // pointLight
    + ambientLight*cdiff
    ;

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
  //gl_FragColor = vec4(r,1.0);
}
`


// ------- DIELECTRICS ------- //
const vs_dielectric =
`
precision highp float;
precision highp int;
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vec3 objectTangent = vec3( tangent.xyz );
  vec3 transformedTangent = normalMatrix * objectTangent;
  vTangent = normalize( transformedTangent );
  // w is 1 or -1 depending on the sign of det( M tangent )
  vBitangent = normalize( cross( vNormal, vTangent ) * (-tangent.w) );
  vUv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_dielectric =
`
precision highp float;
precision highp int;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 ambientLight;
uniform vec3 clight;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform samplerCube envMap;
uniform samplerCube irradianceMap;
uniform vec2 normalScale;
uniform sampler2D roughnessMap;
uniform vec2 textureRepeat;
const float PI = 3.14159;
#define saturate(a) clamp( a, 0.0, 1.0 )
vec3 cdiff;
vec3 cspec;
float roughness;

float pow2( const in float x ) { return x*x; }

float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevel ) {

  float maxMIPLevelScalar = maxMIPLevel;

  float sigma = PI * roughness * roughness / ( 1.0 + roughness );
  float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

  // clamp to allowable LOD ranges.
  return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

vec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {

  float dotNV = saturate( dot( normal, viewDir ) );

  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

  vec4 r = roughness * c0 + c1;

  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

  vec2 brdf = vec2( -1.04, 1.04 ) * a004 + r.zw;

  return specularColor * brdf.x + brdf.y;
}

vec3 FSchlick(float vDoth, vec3 f0) {
  return f0 + (vec3(1.0)-f0)*pow(1.0 - vDoth,5.0);
}

float DGGX(float NoH, float alpha) {
  float alpha2 = alpha * alpha;
  float k = NoH*NoH * (alpha2 - 1.0) + 1.0;
  return alpha2 / (PI * k * k );
}

float G1(float nDotv, float alpha) {
  float alpha2 = alpha*alpha;
  return 2.0 * (nDotv / (nDotv + sqrt(alpha2 + (1.0-alpha2)*nDotv*nDotv )));
}

float GSmith(float nDotv, float nDotl, float alpha) {
  return G1(nDotl,alpha)*G1(nDotv,alpha);
}

void main() {
  vec4 lPosition = viewMatrix * vec4( pointLightPosition, 1.0 );
  vec3 l = normalize(lPosition.xyz - vPosition.xyz);
  vec3 normal = normalize( vNormal );
  vec3 tangent = normalize( vTangent );
  vec3 bitangent = normalize( vBitangent );
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
  vec3 vReflect = reflect(vPosition,n);
  vec3 r = inverseTransformDirection( vReflect, viewMatrix );
  vec3 worldN = inverseTransformDirection( n, viewMatrix );
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);

  cdiff = texture2D( diffuseMap, vUv*textureRepeat ).rgb;
  cdiff = pow( cdiff, vec3(2.2)); // texture in sRGB, linearize

  cspec = vec3(0.04);
  roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map

  float alpha = roughness * roughness;
  
  float specularMIPLevel = getSpecularMIPLevel(alpha, 8.0);
  vec3 fresnel = FSchlick(vDoth, cspec);

  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));
  vec3 envLight = textureCubeLodEXT( envMap, vec3(-r.x, r.yz), specularMIPLevel ).rgb;
  // texture in sRGB, linearize
  envLight = pow( envLight, vec3(2.2));
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);

  vec3 outRadiance =
    cdiff * irradiance + // IEM
    envLight * BRDF_Specular_GGX_Environment(n, v, cspec, alpha) + // EM
    PI * clight * nDotl * BRDF // pointLight
    + ambientLight*cdiff
    ;

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
  //gl_FragColor = vec4(r,1.0);
}
`

// ------- DIELECTRICS WITH AO------- //
const vs_dielectric_ao =
`
precision highp float;
precision highp int;
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vec3 objectTangent = vec3( tangent.xyz );
  vec3 transformedTangent = normalMatrix * objectTangent;
  vTangent = normalize( transformedTangent );
  // w is 1 or -1 depending on the sign of det( M tangent )
  vBitangent = normalize( cross( vNormal, vTangent ) * (-tangent.w) );
  vUv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_dielectric_ao =
`
precision highp float;
precision highp int;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 ambientLight;
uniform vec3 clight;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform samplerCube envMap;
uniform samplerCube irradianceMap;
uniform vec2 normalScale;
uniform sampler2D roughnessMap;
uniform vec2 textureRepeat;

uniform sampler2D aoMap;

const float PI = 3.14159;
#define saturate(a) clamp( a, 0.0, 1.0 )
vec3 cdiff;
vec3 cspec;
float roughness;

float pow2( const in float x ) { return x*x; }

float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevel ) {

  float maxMIPLevelScalar = maxMIPLevel;

  float sigma = PI * roughness * roughness / ( 1.0 + roughness );
  float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

  // clamp to allowable LOD ranges.
  return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

vec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {

  float dotNV = saturate( dot( normal, viewDir ) );

  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

  vec4 r = roughness * c0 + c1;

  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

  vec2 brdf = vec2( -1.04, 1.04 ) * a004 + r.zw;

  return specularColor * brdf.x + brdf.y;
}

vec3 FSchlick(float vDoth, vec3 f0) {
  return f0 + (vec3(1.0)-f0)*pow(1.0 - vDoth,5.0);
}

float DGGX(float NoH, float alpha) {
  float alpha2 = alpha * alpha;
  float k = NoH*NoH * (alpha2 - 1.0) + 1.0;
  return alpha2 / (PI * k * k );
}

float G1(float nDotv, float alpha) {
  float alpha2 = alpha*alpha;
  return 2.0 * (nDotv / (nDotv + sqrt(alpha2 + (1.0-alpha2)*nDotv*nDotv )));
}

float GSmith(float nDotv, float nDotl, float alpha) {
  return G1(nDotl,alpha)*G1(nDotv,alpha);
}

void main() {
  vec4 lPosition = viewMatrix * vec4( pointLightPosition, 1.0 );
  vec3 l = normalize(lPosition.xyz - vPosition.xyz);
  vec3 normal = normalize( vNormal );
  vec3 tangent = normalize( vTangent );
  vec3 bitangent = normalize( vBitangent );
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
  vec3 vReflect = reflect(vPosition,n);
  vec3 r = inverseTransformDirection( vReflect, viewMatrix );
  vec3 worldN = inverseTransformDirection( n, viewMatrix );
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);

  cdiff = texture2D( diffuseMap, vUv*textureRepeat ).rgb;
  cdiff = pow( cdiff, vec3(2.2)); // texture in sRGB, linearize

  cspec = vec3(0.04);
  roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map

  float alpha = roughness * roughness;
  
  float specularMIPLevel = getSpecularMIPLevel(alpha, 8.0);
  vec3 fresnel = FSchlick(vDoth, cspec);

  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));
  vec3 envLight = textureCubeLodEXT( envMap, vec3(-r.x, r.yz), specularMIPLevel ).rgb;
  // texture in sRGB, linearize
  envLight = pow( envLight, vec3(2.2));
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);

  vec3 outRadiance =
    cdiff * irradiance + // IEM
    envLight * BRDF_Specular_GGX_Environment(n, v, cspec, alpha) + // EM
    PI * clight * nDotl * BRDF // pointLight
    + ambientLight*cdiff
    ;

  outRadiance = outRadiance * texture2D( aoMap, vUv*textureRepeat).r;

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
  //gl_FragColor = vec4(r,1.0);
}
`


// ------------------------------------------------------------------------------------
// ------- POST-PROC SHADERs ------- //
// ------------------------------------------------------------------------------------

// Luminosity Shader
// Needed to gray scale before Sobel

/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

var LuminosityShader = {

	uniforms: {

		'tDiffuse': { value: null }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'#include <common>',

		'uniform sampler2D tDiffuse;',

		'varying vec2 vUv;',

		'void main() {',

		'	vec4 texel = texture2D( tDiffuse, vUv );',

		'	float l = linearToRelativeLuminance( texel.rgb );',

		'	gl_FragColor = vec4( l, l, l, texel.w );',

		'}'

	].join( '\n' )

};


// Sobel Filter
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/SobelOperatorShader.js

/**
 * Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)
 *
 * As mentioned in the video the Sobel operator expects a grayscale image as input.
 *
 */

var SobelOperatorShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: new THREE.Vector2() }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform sampler2D tDiffuse;',
		'uniform vec2 resolution;',
		'varying vec2 vUv;',

		'void main() {',

		'	vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );',

		// kernel definition (in glsl matrices are filled in column-major order)

		'	const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );', // x direction kernel
		'	const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );', // y direction kernel

		// fetch the 3x3 neighbourhood of a fragment

		// first column

		'	float tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;',
		'	float tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;',
		'	float tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;',

		// second column

		'	float tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;',
		'	float tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;',
		'	float tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;',

		// third column

		'	float tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;',
		'	float tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;',
		'	float tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;',

		// gradient value in x direction

		'	float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ',
		'		Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ',
		'		Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ',

		// gradient value in y direction

		'	float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ',
		'		Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ',
		'		Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ',

		// magnitute of the total gradient

		'	float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );',

		'	gl_FragColor = vec4( vec3( G ), 1 );',

		'}'

	].join( '\n' )

};





// Dots
/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

var DotScreenShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'tSize':  { value: new THREE.Vector2( 256, 256 ) },
		'center': { value: new THREE.Vector2( 0.5, 0.5 ) },
		'angle': { value: 1.57 },
		'scale': { value: 1.0 }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform vec2 center;',
		'uniform float angle;',
		'uniform float scale;',
		'uniform vec2 tSize;',

		'uniform sampler2D tDiffuse;',

		'varying vec2 vUv;',

		'float pattern() {',

		'	float s = sin( angle ), c = cos( angle );',

		'	vec2 tex = vUv * tSize - center;',
		'	vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;',

		'	return ( sin( point.x ) * sin( point.y ) ) * 4.0;',

		'}',

		'void main() {',

		'	vec4 color = texture2D( tDiffuse, vUv );',

		'	float average = ( color.r + color.g + color.b ) / 3.0;',

		'	gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );',

		'}'

	].join( '\n' )
}







var ToonShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: new THREE.Vector2() }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'#include <common>', // to use linearToRelativeLuminance

		'uniform sampler2D tDiffuse;',
		'uniform vec2 resolution;',
		'varying vec2 vUv;',

		'void main() {',

		'	vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );',

		//'	vec4 texel = texture2D( tDiffuse, vUv );',
		//'	float l = linearToRelativeLuminance( texel.rgb );',

		// kernel definition (in glsl matrices are filled in column-major order)

		'	const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );', // x direction kernel
		'	const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );', // y direction kernel

		// fetch the 3x3 neighbourhood of a fragment

		// first column

		'	float tx0y0 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).rgb );',
		'	float tx0y1 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).rgb );',
		'	float tx0y2 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).rgb );',

		// second column

		'	float tx1y0 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).rgb );',
		'	float tx1y1 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).rgb );',
		'	float tx1y2 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).rgb );',

		// third column

		'	float tx2y0 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).rgb );',
		'	float tx2y1 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).rgb );',
		'	float tx2y2 = linearToRelativeLuminance( texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).rgb );',

		// gradient value in x direction

		'	float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ',
		'		Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ',
		'		Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ',

		// gradient value in y direction

		'	float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ',
		'		Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ',
		'		Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ',

		// magnitute of the total gradient

		'	float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );',

		//'	gl_FragColor = vec4( vec3( G ), 1 );',

    ' vec3 fragColor = vec3( texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).rgb);',

		'	gl_FragColor = vec4( fragColor * (1.0-G), 1 );', // TODO modify here?
		//'	gl_FragColor = vec4( vec3(1.0 - G), 1 );',

		'}'

	].join( '\n' )

};


