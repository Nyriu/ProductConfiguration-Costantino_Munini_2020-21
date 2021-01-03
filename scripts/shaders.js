// ------- DEFAULT MATERIAL ------- //
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
const vs_texture =
`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 uVv;

void main() {
  vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
  vPosition = vPos.xyz;
  vNormal = normalMatrix * normal;
  uVv = uv;
  gl_Position = projectionMatrix * vPos;
}
`

const fs_texture =
`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 uVv;
uniform vec3 pointLightPosition; // in world space
uniform vec3 clight;
uniform sampler2D specularMap;
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
  vec3 n = normalize( vNormal );  // interpolation destroys normalization, so we have to normalize
  vec3 v = normalize( -vPosition);
  vec3 h = normalize( v + l);
  // small quantity to prevent divisions by 0
  float nDotl = max(dot( n, l ),0.000001);
  float lDoth = max(dot( l, h ),0.000001);
  float nDoth = max(dot( n, h ),0.000001);
  float vDoth = max(dot( v, h ),0.000001);
  float nDotv = max(dot( n, v ),0.000001);

  cdiff = texture2D( diffuseMap, uVv*textureRepeat ).rgb;
  // texture in sRGB, linearize
  cdiff = pow( cdiff, vec3(2.2));
  cspec = texture2D( specularMap, uVv*textureRepeat ).rgb;
  // texture in sRGB, linearize
  cspec = pow( cspec, vec3(2.2));
  roughness = texture2D( roughnessMap, uVv*textureRepeat).r; // no need to linearize roughness map
  vec3 fresnel = FSchlick(vDoth, cspec);
  float alpha = roughness * roughness;
  vec3 BRDF = (vec3(1.0)-fresnel)*cdiff/PI + fresnel*GSmith(nDotv,nDotl, alpha)*DGGX(nDoth,alpha)/
    (4.0*nDotl*nDotv);
  vec3 outRadiance = PI* clight * nDotl * BRDF;
  // gamma encode the final value
  gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);
}
`






