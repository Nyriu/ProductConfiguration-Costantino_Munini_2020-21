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



// MATERIALs STUFF
materials_loaded = false; // true iff all materials have been loaded // TODO really needed?

// All Sahder Materials
var textureMaterial; // default

var goldMaterial;
var copperMaterial;
var brassMaterial;
var bronzeMaterial;

var leather0Material;
var leather1Material;
var furMaterial;

var normalsMaterial;




var helmet;



// CHANGABLE HELMET SETTINGS
var mat_name2mat; // dict string to material shader
const helmet_materials_list = [ // TODO move to globals
  "default",

  "gold",
  "copper",
  "brass",
  "bronze",

  "leather0",
  "leather1",
  "fur",

  "normals",
];

var helmetParameters_materials = { // TODO move to globals
  "visor_upper_mat" : helmet_materials_list[0],
  "visor_lower_mat" : helmet_materials_list[0],
  "cheek_pads"      : helmet_materials_list[0],
  "neck_roll"       : helmet_materials_list[0],
}




// TODO REMOVE BELOW
// DEBUG STUFF
var DEBUG_tmp;
var DEBUG_helmet;
var DEBUG_child;
var DEBUG_mesh;
var DEBUG_knot;
var DEBUG_sphere;


