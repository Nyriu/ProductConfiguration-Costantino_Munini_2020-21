// ------- DEFAULT MATERIAL ------- //
// TODO it's plastic... remove
const vs_default =
`
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_default =
`
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 pointLightPosition; // in world space
uniform vec3 clight;
uniform vec3 cspec;
uniform vec3 cdiff;
uniform float roughness;
const float PI = 3.14159;

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
  vec3 n = normalize( vNormal );  // interpolation destroys normalization, so we have to normalize
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
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`

// ------- TEXTURE MATERIAL ------- //
// With metalness
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
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`

// ------- DIELECTRIC TEXTURE MATERIAL ------- //
// Texture material without metalness
// Used when the metalness map is not given
const vs_dielectric =
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

const fs_dielectric =
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

  //roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map
  roughness = texture2D( roughnessMap, vUv*textureRepeat).r; // no need to linearize roughness map

  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`





// ------- NORMALS MATERIAL ------- //

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
uniform vec3 cdiff;
uniform float roughness;
uniform sampler2D normalMap;
uniform vec2 normalScale;
const float PI = 3.14159;

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
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`


