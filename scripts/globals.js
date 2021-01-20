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

var ambientLightPam = new THREE.Vector3(0.2, 0.2, 0.2);



// MATERIALs STUFF
materials_loaded = true; // true iff all materials have been loaded


var uniforms_texture; // default
var uniforms_gold;
var uniforms_copper;
var uniforms_brass;
var uniforms_bronze;
var uniforms_leather0;
var uniforms_leather1;
var uniforms_fur;

// All Sahder Materials
var textureMaterial; // default

var goldMaterial;
var copperMaterial;
var brassMaterial;
var bronzeMaterial;

var leather0Material;
var leather1Material;
var furMaterial;



var helmet;



// CHANGABLE HELMET SETTINGS
var mat_name2mat; // dict string to material shader
const helmet_materials_list = [
  "default",

  "gold",
  "copper",
  "brass",
  "bronze",

  "leather0",
  "leather1",
  "fur",
];
const metallic_materials_list = [
  "default",
  "gold",
  "copper",
  "brass",
  "bronze",
];
const dielectric_materials_list = [
  "default",
  "leather0",
  "leather1",
  "fur",
];

var helmetParameters_materials = {
  "visor_upper_mat" : metallic_materials_list[0],
  "visor_lower_mat" : metallic_materials_list[0],
  "cheek_pads"      : dielectric_materials_list[0],
  "neck_roll"       : dielectric_materials_list[0],
}

