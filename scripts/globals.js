// ENUMs
const modelNames = {
  TORUS : "TorusKnot",
  SPHERE : "Sphere",
  OLD_HELMET : "old_VikingHelmet",
  HELMET : "VikingHelmet",
}

const helmet_components = {
  "CENTER" : 0, // Obj3D Sphere

  // maybe not historically accurate...
  // metal components
  "CALOTTE" : 1, // calotta 

  "NASAL" : 4, // nasale

  "VISOR_UPPER" : 3, // or peak, vizor, vizard
  "VISOR_LOWER" : 5, // visiera

  // leather components
  "NECK_ROLL"       : 2, // paranuca
  "CHEEK_PAD_LEFT"  : 7, // guanciale
  "CHEEK_PAD_RIGHT" : 9, // guanciale
  
  "CONNECTOR_LEFT"  : 6, // pezzo che collega
  "CONNECTOR_RIGHT" : 8, // calotta-guanciale
};

const helmet_ids2components = {}
for (k in helmet_components) {
  var id = helmet_components[k];
  helmet_ids2components[id] = k;
}

const helmet_components_names = {}
for (k in helmet_components) {
  helmet_components_names[k] = k;
}

var helmetParameters_show = {
  show_leather   : true,
  show_cheekPads : true,
}


// LIGHTs
// default: white, 1.0 intensity
var lightParameters = {
  red:   1.0,
  green: 1.0,
  blue:  1.0,
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
var uniforms_normals;
//var uniforms = uniforms_default; // TODO remove


//var vs;
//var fs;

var defaultMaterial;
var textureMaterial;
var normalsMaterial;



// DEBUG STUFF
var DEBUG_tmp;
var DEBUG_helmet;
var DEBUG_child;
var DEBUG_mesh;
var DEBUG_knot;
var DEBUG_sphere;


