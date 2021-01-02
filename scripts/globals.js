// ENUMs
const modelNames = {
  TORUS : "TorusKnot",
  HELMET : "VikingHelmet",
}


// LIGHTs
// default: white, 1.0 intensity
var lightParameters = {
  red: 1.0,
  green: 1.0,
  blue: 1.0,
  intensity: 1.0,
}



// MATERIALs

// RED PLASTIC
const matParams_redPlastic = {
  cdiff_red: 0.7,
  cdiff_green: 0.0,
  cdiff_blue: 0.0,
  cspec_red: 0.04,
  cspec_green: 0.04,
  cspec_blue: 0.04,
  roughness: 0.3
}


// GLOBAL VARs
var geometry;
var material;
var mesh;

var materialParameters = matParams_redPlastic


var uniforms = {
  cspec:	{ type: "v3", value: new THREE.Vector3() },
  cdiff:	{ type: "v3", value: new THREE.Vector3() },
  roughness: {type: "f", value: 0.5},
  pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
  clight:	{ type: "v3", value: new THREE.Vector3() },
};

var vs;
var fs;

var ourMaterial;



// DEBUG STUFF
var DEBUG_tmp;
var DEBUG_child;
var DEBUG_mesh;
var DEBUG_knot;


