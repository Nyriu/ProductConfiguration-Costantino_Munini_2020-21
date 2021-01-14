// ------- TEXTURE MATERIAL ------- //
// With metalness
// TODO REMOVE
const vs_texture =
`
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

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

const fs_texture =
`
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 clight;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;
uniform sampler2D metalnessMap;
uniform vec2 textureRepeat;
const float PI = 3.14159;

vec3 cdiff;
vec3 cspec;
float metalness;
float roughness;

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
  // matrix to convert bewtween tangent space and view space
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
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

  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`

// ------- DIELECTRIC TEXTURE MATERIAL ------- //
// Texture material without metalness
// Used when the metalness map is not given
// TODO REMOVE
const vs_old_dielectric =
`
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalize(normalMatrix * normal);

  vec3 objectTangent = vec3( tangent.xyz );
  vec3 transformedTangent = normalMatrix * objectTangent;
  vTangent = normalize( transformedTangent );
  // w is 1 or -1 depending on the sign of det( M tangent )
  vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
  vUv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_old_dielectric =
`
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 clight;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;
uniform vec2 textureRepeat;
const float PI = 3.14159;

vec3 cdiff;
vec3 cspec;
float roughness;

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
  // matrix to convert bewtween tangent space and view space
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
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

  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;
  vec3 BRDF =
    (vec3(1.0)-fresnel)*cdiff/PI +
    fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;

  // TODO simplifyy formula (also above)

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`


// ------- NORMALS MATERIAL ------- //
// TODO REMOVE
const vs_normals =
`
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

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

const fs_normals =
`
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space

uniform vec3 clight;
uniform vec3 cspec;
//uniform vec3 ambientLight; // TODO REMOVE

uniform vec3 cdiff;
uniform float roughness;
uniform sampler2D normalMap;

uniform samplerCube envMap;
uniform samplerCube irradianceMap;

uniform vec2 normalScale;
const float PI = 3.14159;


vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {
  float maxMIPLevelScalar = float( maxMIPLevel );

  float sigma = PI * roughness * roughness / ( 1.0 + roughness );
  float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

  // clamp to allowable LOD ranges.
  return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

#define saturate(a) clamp( a, 0.0, 1.0 )

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
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
  // matrix to convert bewtween tangent space and view space
  mat3 vTBN = mat3( tangent, bitangent, normal );
  vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);
  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;


	vec3 vReflect = reflect(vPosition,n);
  vec3 r = inverseTransformDirection( vReflect, viewMatrix );

  float specularMIPLevel = getSpecularMIPLevel(alpha,8 );

  vec3 envLight = textureCubeLodEXT( envMap, vec3(-r.x, r.yz), specularMIPLevel ).rgb;
  // texture in sRGB, linearize
  envLight = pow( envLight, vec3(2.2));


  vec3 worldN = inverseTransformDirection( n, viewMatrix );
  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));

  // TODO rimuovere commenti
  //vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI;
  //vec3 BRDF = fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);

  vec3 BRDF = 
    (vec3(1.0)-fresnel)*cdiff/PI +
    fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);

  //vec3 outRadiance = PI * clight * nDotl * BRDF;
  //vec3 outRadiance = cdiff * irradiance;

  vec3 outRadiance =
    PI * clight * nDotl * BRDF +                                   // Point Light
    envLight * BRDF_Specular_GGX_Environment(n, v, cspec, alpha) + // Glossy Env Map
    cdiff * irradiance;                                            // Irradiance Env Map

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`



// ------- TEST MATERIAL ------- //
// TODO REMOVE
const vs_test =
`
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

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

const fs_test =
`
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space

uniform vec3 clight;
//uniform vec3 ambientLight; // TODO REMOVE

vec3 cdiff;
vec3 cspec;
float roughness;
float metalness;

uniform sampler2D diffuseMap;
uniform sampler2D metalnessMap;
uniform sampler2D roughnessMap; 
uniform sampler2D normalMap;

uniform vec2 textureRepeat;


uniform samplerCube envMap;
uniform samplerCube irradianceMap;

uniform vec2 normalScale;
const float PI = 3.14159;


vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {
  float maxMIPLevelScalar = float( maxMIPLevel );

  float sigma = PI * roughness * roughness / ( 1.0 + roughness );
  float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

  // clamp to allowable LOD ranges.
  return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}

#define saturate(a) clamp( a, 0.0, 1.0 )

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
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
  // matrix to convert bewtween tangent space and view space
  mat3 vTBN = mat3( tangent, bitangent, normal );
  //vec3 mapN = texture2D( normalMap, vUv*textureRepeat ).xyz * 2.0 - 1.0; // TODO
  vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);
  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;

  metalness = texture2D( metalnessMap, vUv*textureRepeat ).r;

  cdiff = texture2D( diffuseMap, vUv*textureRepeat ).rgb;
  cdiff = pow( cdiff, vec3(2.2)); // texture in sRGB, linearize

  cspec = (1.0-metalness)*vec3(0.04) + metalness*cdiff;
  cdiff = (1.0-metalness)*cdiff;
  roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map


	vec3 vReflect = reflect(vPosition,n);
  vec3 r = inverseTransformDirection( vReflect, viewMatrix );

  float specularMIPLevel = getSpecularMIPLevel(alpha,8 );

  vec3 envLight = textureCubeLodEXT( envMap, vec3(-r.x, r.yz), specularMIPLevel ).rgb;
  // texture in sRGB, linearize
  envLight = pow( envLight, vec3(2.2));


  vec3 worldN = inverseTransformDirection( n, viewMatrix );
  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));

  // TODO rimuovere commenti
  //vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI;
  //vec3 BRDF = fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);

  vec3 BRDF = 
    (vec3(1.0)-fresnel)*cdiff/PI +
    fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);

  //vec3 outRadiance = PI * clight * nDotl * BRDF;
  //vec3 outRadiance = cdiff * irradiance;

  vec3 outRadiance =
    PI * clight * nDotl * BRDF +                                   // Point Light
    metalness * envLight * BRDF_Specular_GGX_Environment(n, v, cspec, alpha + 0.2) + // Glossy Env Map
    cdiff * irradiance;                                            // Irradiance Env Map

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`

// ------- GLOSSY REFLECTION MAPPING ------- //
// TODO change title
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
//uniform sampler2D aoMap;
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


// ------- NEW DIELECTRICS ------- //
// TODO change title
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
uniform samplerCube irradianceMap;
uniform sampler2D roughnessMap;

uniform vec2 textureRepeat;
uniform vec2 normalScale;

const float PI = 3.14159;
vec3 cdiff;
vec3 cspec;
float roughness;

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
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

  vec3 fresnel = FSchlick(vDoth, cspec);

  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  irradiance = pow( irradiance, vec3(2.2));

  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/(4.0*nDotl*nDotv);

  vec3 outRadiance =
    cdiff * irradiance +       // IEM
    PI * clight * nDotl * BRDF // pointLight
    + ambientLight*cdiff
    ;

  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
  //gl_FragColor = vec4(r,1.0);
}
`

// ------- Pre-filtered EM with diffuse BRDF ------- //
const vs_iem =
`
attribute vec4 tangent;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 wPosition;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec2 vUv;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  wPosition = (modelMatrix * vec4( position, 1.0 )).xyz;
  vNormal = normalize(normalMatrix * normal);
  vec3 objectTangent = vec3( tangent.xyz );
  vec3 transformedTangent = normalMatrix * objectTangent;
  vTangent = normalize( transformedTangent );
  // w is 1 or -1 depending on the sign of det( M tangent )
  vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
  vUv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_iem =
`
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vPosition;
varying vec3 wPosition;
varying vec2 vUv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 clight;
uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform samplerCube irradianceMap;
uniform sampler2D roughnessMap;
uniform vec2 normalScale;
const float PI = 3.14159;
uniform vec2 textureRepeat;

vec3 cdiff;
vec3 cspec;
float roughness;

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
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
  vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
  //mapN.xy = normalScale * mapN.xy;
  vec3 n = normalize( vTBN * mapN );
  vec3 v = normalize( -vPosition);
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

  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 irradiance = textureCube(irradianceMap, worldN).rgb;
  cdiff = texture2D( diffuseMap, vUv  *textureRepeat).rgb;
  irradiance = pow( irradiance, vec3(2.2));
  vec3 outRadiance = cdiff * irradiance + PI * clight * nDotl * BRDF;
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`
