// ENUMs
const modelNames = {
  TORUS : "TorusKnot",
  SPHERE : "Sphere",
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
//var geometry;
//var material;
//var mesh;

var materialParameters = matParams_redPlastic


var uniforms_default;
var uniforms_texture;
//var uniforms = uniforms_default; // TODO remove


//var vs;
//var fs;

var defaultMaterial;
var textureMaterial;



// DEBUG STUFF
var DEBUG_tmp;
var DEBUG_child;
var DEBUG_mesh;
var DEBUG_knot;
var DEBUG_sphere;


