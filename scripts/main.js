var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding;

var camera   = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.2, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var scene    = new THREE.Scene();

var lightMesh = new THREE.Mesh(
  new THREE.SphereGeometry( 1, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffff00, wireframe:true
  }));
lightMesh.position.set( 7.0, 7.0, 7.0 );

// EM //
var cubeMapForesta = loadCubeMap("foresta");
var irradianceForesta = loadCubeMap("irradianceForesta");

scene.background = cubeMapForesta;

// UNIFORMs //
uniforms_default = {
  cspec:	{ type: "v3", value: new THREE.Vector3() },
  cdiff:	{ type: "v3", value: new THREE.Vector3() },
  roughness: {type: "f", value: 0.5 },
  pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
  clight:	{ type: "v3", value: new THREE.Vector3() },
  envMap: { type: "t", value: cubeMapForesta },
  irradianceMap:  { type: "t", value: irradianceForesta }
};
uniforms = uniforms_default;

//// TODO move promise in utility.js

var diffuseMap;
var specularMap;
var roughnessMap;


// TODO move to utility
var loaderPromise = new Promise((resolve, reject) => {
  // here we loads all the textures
  // TODO must split

  // DEFAULT HELMET MAPS
  normalMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Normal.png");
  normalMap.flipY = false;
  //normalMap.encoding = THREE.sRGBEncoding;

  diffuseMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_BaseColor.png");
  diffuseMap.flipY = false;
  diffuseMap.encoding = THREE.sRGBEncoding;

  roughnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Roughness.png");
  roughnessMap.flipY = false;
  //roughnessMap.encoding = THREE.sRGBEncoding;

  metalnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Metallic.png");
  metalnessMap.flipY = false;
  //metalnessMap.encoding = THREE.sRGBEncoding;


  // COPPER MAPS
  copper_normalMap    = loadTexture("materials/copper/cross_brushed_copper_normal.png");
  copper_diffuseMap   = loadTexture("materials/copper/cross_brushed_copper_basecolor.png");
  copper_roughnessMap = loadTexture("materials/copper/cross_brushed_copper_roughness.png");
  copper_metalnessMap = loadTexture("materials/copper/cross_brushed_copper_metallic.png");
  copper_diffuseMap.encoding = THREE.sRGBEncoding;

  // BRASS MAPS
  brass_normalMap    = loadTexture("../materials/brass/se4nbarc_4K_Normal.jpg ");
  brass_diffuseMap   = loadTexture("../materials/brass/se4nbarc_4K_Albedo.jpg ");
  brass_roughnessMap = loadTexture("../materials/brass/se4nbarc_4K_Roughness.jpg ");
  brass_metalnessMap = loadTexture("../materials/brass/se4nbarc_4K_Metalness.jpg ");
  brass_diffuseMap.encoding = THREE.sRGBEncoding;

  // BRONZE MAPS
  bronze_normalMap    = loadTexture("../materials/bronze/se4pcbbc_4K_Normal.jpg ");
  bronze_diffuseMap   = loadTexture("../materials/bronze/se4pcbbc_4K_Albedo.jpg ");
  bronze_roughnessMap = loadTexture("../materials/bronze/se4pcbbc_4K_Roughness.jpg ");
  bronze_metalnessMap = loadTexture("../materials/bronze/se4pcbbc_4K_Metalness.jpg ");
  bronze_diffuseMap.encoding = THREE.sRGBEncoding;

  // LEATHERs MAPS
  leather0_normalMap    = loadTexture("materials/leather/leather_bull_Normal.png");
  leather0_diffuseMap   = loadTexture("materials/leather/leather_bull_Base_Color.png");
  leather0_roughnessMap = loadTexture("materials/leather/leather_bull_Roughness.png");
  leather0_diffuseMap.encoding = THREE.sRGBEncoding;

  leather1_normalMap    = loadTexture("materials/Fabric_Leather_oizt3np0_2K_surface_ms/oizt3np_2K_Normal.jpg");
  leather1_diffuseMap   = loadTexture("materials/Fabric_Leather_oizt3np0_2K_surface_ms/oizt3np_2K_Albedo.jpg");
  leather1_roughnessMap = loadTexture("materials/Fabric_Leather_oizt3np0_2K_surface_ms/oizt3np_2K_Roughness.jpg");
  leather1_diffuseMap.encoding = THREE.sRGBEncoding;

  // GOLD MAPS
  gold_normalMap    = loadTexture("materials/Metal_Pure_schvfgwp_2K_surface_ms/schvfgwp_2K_Normal.jpg");
  gold_diffuseMap   = loadTexture("materials/Metal_Pure_schvfgwp_2K_surface_ms/schvfgwp_2K_Albedo.jpg");
  gold_roughnessMap = loadTexture("materials/Metal_Pure_schvfgwp_2K_surface_ms/schvfgwp_2K_Roughness.jpg");
  //gold_roughnessMap = loadTexture("materials/Imperfections_uh4obimc_2K_surface_ms/uh4obimc_2K_Roughness.jpg");
  //gold_roughnessMap = loadTexture("materials/Imperfections_Grunge_tedxadjc_2K_surface_ms/tedxadjc_2K_Roughness.jpg");
  gold_metalnessMap = loadTexture("materials/Metal_Pure_schvfgwp_2K_surface_ms/schvfgwp_2K_Metalness.jpg");
  gold_diffuseMap.encoding = THREE.sRGBEncoding;

  // FUR MAPS
  fur_normalMap    = loadTexture("materials/Creature_Fur_rlsu3wp0_2K_surface_ms/rlsu3wp_2K_Normal.jpg");
  fur_diffuseMap   = loadTexture("materials/Creature_Fur_rlsu3wp0_2K_surface_ms/rlsu3wp_2K_Albedo.jpg");
  fur_roughnessMap = loadTexture("materials/Creature_Fur_rlsu3wp0_2K_surface_ms/rlsu3wp_2K_Roughness.jpg");
  fur_diffuseMap.encoding = THREE.sRGBEncoding;


  // METAL MAPS
  // bad bad bad
  // TODO remove
  metal_normalMap    = loadTexture("materials/Metal_Misc_tgtldcqaw_2K_surface_ms/tgtldcqaw_2K_Normal.jpg");
  metal_diffuseMap   = loadTexture("materials/Metal_Misc_tgtldcqaw_2K_surface_ms/tgtldcqaw_2K_Albedo.jpg");
  metal_roughnessMap = loadTexture("materials/Metal_Misc_tgtldcqaw_2K_surface_ms/tgtldcqaw_2K_Roughness.jpg");
  metal_metalnessMap = loadTexture("materials/Metal_Misc_tgtldcqaw_2K_surface_ms/Metalness.jpg");
  metal_diffuseMap.encoding = THREE.sRGBEncoding;

  resolve(true);
})
.then(() => {
  materials_loaded = true; // notify globally 
  // DEFAULT HELMET MAPS
  // textureMaterial
  console.log(cubeMapForesta)
  console.log(irradianceForesta)
  uniforms_texture = {
    normalMap:	  { type: "t", value: normalMap },
    diffuseMap:	  { type: "t", value: diffuseMap },
    roughnessMap:	{ type: "t", value: roughnessMap },
    metalnessMap:	{ type: "t", value: metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) }, // TODO scegliere meglio
    normalScale: {type: "v2", value: new THREE.Vector2(1,1)},
    roughness: {type: "f", value: 0.2}, // TODO REMOVE
    cspec:	{ type: "v3", value: new THREE.Vector3(0.8,0.8,0.8) }, // TODO REMOVE
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta }
  };

  uniforms_texture.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_texture.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  textureMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_texture,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    //vertexShader: vs_glossy ,
    //fragmentShader: fs_glossy,
    //vertexShader: vs_iem ,
    //fragmentShader: fs_iem,
    side : THREE.DoubleSide,
  });

  // normalsMaterial
  uniforms_normals = {
    cspec:	{ type: "v3", value: new THREE.Vector3(0.04,0.04,0.04) },
    cdiff:	{ type: "v3", value: new THREE.Vector3(0.8,0.8,0.8) },
    roughness: {type: "f", value: 0.2},
    normalMap:	{ type: "t", value: normalMap},
    normalScale: {type: "v2", value: new THREE.Vector2(1,1)},
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
  };

  uniforms_normals.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_normals.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  normalsMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_normals,
    vertexShader:   vs_normals,
    fragmentShader: fs_normals,
    side : THREE.DoubleSide,
  });

  // copperMaterial
  uniforms_copper = {
    normalMap:	  { type: "t", value: copper_normalMap },
    diffuseMap:	  { type: "t", value: copper_diffuseMap },
    roughnessMap:	{ type: "t", value: copper_roughnessMap },
    metalnessMap:	{ type: "t", value: copper_metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(6.5, 6.5) }
  };

  uniforms_copper.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_copper.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  copperMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_copper,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    side : THREE.DoubleSide,
  });

  // brassMaterial
  uniforms_brass = {
    normalMap:	  { type: "t", value: brass_normalMap },
    diffuseMap:	  { type: "t", value: brass_diffuseMap },
    roughnessMap:	{ type: "t", value: brass_roughnessMap },
    metalnessMap:	{ type: "t", value: brass_metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(4,4) }
  };

  uniforms_brass.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_brass.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  brassMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_brass,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    side : THREE.DoubleSide,
  });

  // bronzeMaterial
  uniforms_bronze = {
    normalMap:	  { type: "t", value: bronze_normalMap },
    diffuseMap:	  { type: "t", value: bronze_diffuseMap },
    roughnessMap:	{ type: "t", value: bronze_roughnessMap },
    metalnessMap:	{ type: "t", value: bronze_metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(4,4) }
  };

  uniforms_bronze.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_bronze.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  bronzeMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_bronze,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    side : THREE.DoubleSide,
  });

  // leathersMaterial
  // 0
  uniforms_leather0 = {
    normalMap:	  { type: "t", value: leather0_normalMap },
    diffuseMap:	  { type: "t", value: leather0_diffuseMap },
    roughnessMap:	{ type: "t", value: leather0_roughnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(7.6,7.6) }
  };

  uniforms_leather0.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_leather0.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  leather0Material = new THREE.ShaderMaterial({
    uniforms: uniforms_leather0,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });
  // 1
  uniforms_leather1 = {
    normalMap:	  { type: "t", value: leather1_normalMap },
    diffuseMap:	  { type: "t", value: leather1_diffuseMap },
    roughnessMap:	{ type: "t", value: leather1_roughnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(7.6,7.6) }
  };

  uniforms_leather1.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_leather1.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  leather1Material = new THREE.ShaderMaterial({
    uniforms: uniforms_leather1,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });


  // goldMaterial
  uniforms_gold = {
    normalMap:	  { type: "t", value: gold_normalMap },
    diffuseMap:	  { type: "t", value: gold_diffuseMap },
    roughnessMap:	{ type: "t", value: gold_roughnessMap },
    metalnessMap:	{ type: "t", value: gold_metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(8,8) }
  };

  uniforms_gold.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_gold.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  goldMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_gold,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    side : THREE.DoubleSide,
  });

  // furMaterial
  uniforms_fur = {
    normalMap:	  { type: "t", value: fur_normalMap },
    diffuseMap:	  { type: "t", value: fur_diffuseMap },
    roughnessMap:	{ type: "t", value: fur_roughnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(9.5,9.5) }
    // TODO sarebbe da aggiungere rotazione?
  };

  uniforms_fur.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_fur.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  furMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_fur,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });


  // metalMaterial
  uniforms_metal = {
    normalMap:	  { type: "t", value: metal_normalMap },
    diffuseMap:	  { type: "t", value: metal_diffuseMap },
    roughnessMap:	{ type: "t", value: metal_roughnessMap },
    metalnessMap:	{ type: "t", value: metal_metalnessMap },
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) } // TODO scegliere meglio
  };

  uniforms_metal.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  uniforms_metal.clight.value = new THREE.Vector3(
    lightParameters.red   * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue  * lightParameters.intensity
  );

  metalMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_metal,
    vertexShader:   vs_texture,
    fragmentShader: fs_texture,
    side : THREE.DoubleSide,
  });


  update_name2mat();

  // Load and show the model
  helmet = loadModel(modelNames.HELMET);
  //noCheekPads(helmet);
});

uniforms_default.pointLightPosition.value = 
new THREE.Vector3(
  lightMesh.position.x,
  lightMesh.position.y,
  lightMesh.position.z
);

uniforms_default.clight.value = new THREE.Vector3(
  lightParameters.red   * lightParameters.intensity,
  lightParameters.green * lightParameters.intensity,
  lightParameters.blue  * lightParameters.intensity
);


// MATERIALs //
defaultMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms_default,
  vertexShader:   vs_default,
  fragmentShader: fs_default,
  side : THREE.DoubleSide,
});


// FUNCTIONs //
var gui;
var stats = new Stats();

function init() {

  renderer.setClearColor( 0xf0f0f0 );

  Coordinates.drawAllAxes();

  //camera.position.set( 0, 10, 10 );
  camera.position.set( 1.3287146680718807, -0.6371460764972972, 0.918281954038343);
  camera.rotation.set( 0.6065836757257353, 0.8714509908129087, -0.4881194964406582);
  scene.add( camera );

  
  scene.add(lightMesh);

  document.body.appendChild( renderer.domElement );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  controls.addEventListener( 'change', render );
  controls.minDistance = 1;
  controls.maxDistance = 100;
  //controls.maxPolarAngle = Math.PI / 2;
  controls.enablePan = false;
  //controls.target.copy( mesh.position );

  //controls.target = 
  controls.update();

  window.addEventListener( 'resize', onResize, false );


  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );

}

function onResize() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = ( window.innerWidth / window.innerHeight );
  camera.updateProjectionMatrix();

}

function update() {
  requestAnimationFrame( update );
  stats.update();
}

function render() {
  updateUniforms();
  renderer.render( scene, camera );

}

function clearGui() {
	if ( gui ) gui.destroy();
	gui = new dat.GUI();
	gui.open();
}



const helmet_materials_list = [ // TODO move to globals
  "default",
  "gold",
  "fur",
  "copper",
  "brass",
  "bronze",
  "leather0",
  "leather1",
  "normals",
];

var helmetParameters_materials = { // TODO move to globals
  "visor_upper_mat" : helmet_materials_list[0],
  "visor_lower_mat" : helmet_materials_list[0],
  "cheek_pads"      : helmet_materials_list[0],
  "neck_roll"       : helmet_materials_list[0],
}

function buildGui() {

	clearGui();
	lightSettings = gui.addFolder('Light Parameters');
	lightSettings.add(lightParameters,'red').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'green').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'blue').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'intensity').min(0).max(20).onChange( function(newVal) { render() });

	helmetSettings = gui.addFolder('Helmet settings');
  helmetSettings.add( helmetParameters_show, 'show_leather').name('Leather').listen()
    .onChange( function(newVal) {
      showLeather(newVal);
      helmetParameters_show.show_cheekPads = newVal;
    });
  helmetSettings.add( helmetParameters_show, 'show_cheekPads').name('Cheek Pads').listen()
    .onChange( function(newVal) {
      showCheekPads(newVal);
    });

	materialSettings = gui.addFolder('Helmet Materials settings');
  materialSettings.add(helmetParameters_materials,
    'visor_upper_mat', helmet_materials_list )
    .name('Upper Visor Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.VISOR_UPPER,
          newVal
        )});
  materialSettings.add(helmetParameters_materials,
    'visor_lower_mat', helmet_materials_list )
    .name('Lower Visor Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.VISOR_LOWER,
          newVal
        )});
  materialSettings.add(helmetParameters_materials,
    'cheek_pads', helmet_materials_list )
    .name('Cheek Pads Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.CHEEK_PAD_LEFT,
          newVal);
        changeComponentMaterial(
          helmet_components_names.CHEEK_PAD_RIGHT,
          newVal);
      });
  materialSettings.add(helmetParameters_materials,
    'neck_roll', helmet_materials_list )
    .name('Neck Roll Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.NECK_ROLL,
          newVal);
      });

  gui.add(uvRepeat, "uv_repeat").min(0.1).max(32)
    .name("UV Repeat")
    .onChange( function(newVal) {
      //uniforms_gold.textureRepeat.value.set(newVal, newVal);    // DONE
      //uniforms_fur.textureRepeat.value.set(newVal, newVal);     //DONE
      //uniforms_copper.textureRepeat.value.set(newVal, newVal);  // DONE
      //uniforms_brass.textureRepeat.value.set(newVal, newVal);   // DONE
      //uniforms_bronze.textureRepeat.value.set(newVal, newVal);  // DONE
      //uniforms_texture.textureRepeat.value.set(newVal, newVal); // DONE
      //uniforms_leather0.textureRepeat.value.set(newVal, newVal);// DONE
      //uniforms_leather1.textureRepeat.value.set(newVal, newVal);// DONE
      render();
    });

}

var uvRepeat = { 
  "uv_repeat" : 1.0,
}




function updateUniforms() {
  // TODO for every material
  // TODO IMPORTANTE
		uniforms.cspec.value = new THREE.Vector3(
      materialParameters.cspec_red,
      materialParameters.cspec_green,
      materialParameters.cspec_blue
    );
		uniforms.cdiff.value = new THREE.Vector3(
      materialParameters.cdiff_red,
					materialParameters.cdiff_green,
      materialParameters.cdiff_blue
    );
		uniforms.roughness.value = materialParameters.roughness>0.0?materialParameters.roughness:0.01;
		uniforms.clight.value = new THREE.Vector3(
				lightParameters.red * lightParameters.intensity,
		    lightParameters.green * lightParameters.intensity,
				lightParameters.blue * lightParameters.intensity
    );
  // TODO update uniform to rescale textures?
}

init();
buildGui();

update();
render();


