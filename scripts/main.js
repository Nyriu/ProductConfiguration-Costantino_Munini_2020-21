var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding;

var camera   = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var scene    = new THREE.Scene();

var lightMesh = new THREE.Mesh(
  new THREE.SphereGeometry( 1, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffff00, wireframe:true
  }));
lightMesh.position.set( 4.0, 4.0, 7.0 );
lightMesh.visible = false;

// EM //
var cubeMapForesta = loadCubeMap("foresta");
var cubeMapFiume = loadCubeMap("fiume");
var cubeMapCascata = loadCubeMap("cascata");
var cubeMapNeve = loadCubeMap("neve");
cubeMapForesta.encoding = THREE.sRGBEncoding;
cubeMapFiume.encoding = THREE.sRGBEncoding;
cubeMapCascata.encoding = THREE.sRGBEncoding;
cubeMapNeve.encoding = THREE.sRGBEncoding;

var irradianceForesta = loadCubeMap("irradianceForesta");
var irradianceFiume = loadCubeMap("irradianceFiume");
var irradianceCascata = loadCubeMap("irradianceCascata");
var irradianceNeve = loadCubeMap("irradianceNeve");
irradianceForesta.encoding = THREE.sRGBEncoding;
irradianceFiume.encoding = THREE.sRGBEncoding;
irradianceCascata.encoding = THREE.sRGBEncoding;
irradianceNeve.encoding = THREE.sRGBEncoding;

scene.background = cubeMapNeve;


var environmentParameters = {
  env : 'neve'
}
var env_list = [
  "foresta",
  "fiume"  ,
  "cascata",
  "neve"   ,
];
var env_name2env = {
  "foresta" : [cubeMapForesta, irradianceForesta],
  "fiume"   : [cubeMapFiume, irradianceFiume],
  "cascata" : [cubeMapCascata, irradianceCascata],
  "neve"    : [cubeMapNeve, irradianceNeve],
};





var loaderPromise = new Promise((resolve, reject) => {
  // here we loads all the textures
  // TODO split in different loaders?

  // DEFAULT HELMET MAPS
  normalMap    = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Normal.png");
  diffuseMap   = loadTexture("models/textures/T_VikingBerserk_UpperArmor_BaseColor.png");
  roughnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Roughness.png");
  metalnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Metallic.png");
  //occlusionMap = loadTexture("models/textures/internal_ground_ao_texture.jpeg");
  normalMap   .flipY = false;
  diffuseMap  .flipY = false;
  roughnessMap.flipY = false;
  metalnessMap.flipY = false;
  // TODO provare a flippare la occlusion
  // non cambia nulla perche' forse bisogna usare UV diversi
  diffuseMap.encoding = THREE.sRGBEncoding;

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
  // 0
  leather0_normalMap    = loadTexture("materials/leather0/leather_bull_Normal.png");
  leather0_diffuseMap   = loadTexture("materials/leather0/leather_bull_Base_Color.png");
  leather0_roughnessMap = loadTexture("materials/leather0/leather_bull_Roughness.png");
  leather0_diffuseMap.encoding = THREE.sRGBEncoding;
  // 1
  leather1_normalMap    = loadTexture("materials/leather1/oizt3np_2K_Normal.jpg");
  leather1_diffuseMap   = loadTexture("materials/leather1/oizt3np_2K_Albedo.jpg");
  leather1_roughnessMap = loadTexture("materials/leather1/oizt3np_2K_Roughness.jpg");
  leather1_diffuseMap.encoding = THREE.sRGBEncoding;

  // GOLD MAPS
  gold_normalMap    = loadTexture("materials/gold/schvfgwp_2K_Normal.jpg");
  gold_diffuseMap   = loadTexture("materials/gold/schvfgwp_2K_Albedo.jpg");
  gold_roughnessMap = loadTexture("materials/gold/schvfgwp_2K_Roughness.jpg");
  gold_metalnessMap = loadTexture("materials/gold/schvfgwp_2K_Metalness.jpg");
  gold_diffuseMap.encoding = THREE.sRGBEncoding;

  // FUR MAPS
  fur_normalMap    = loadTexture("materials/fur/rlsu3wp_2K_Normal.jpg");
  fur_diffuseMap   = loadTexture("materials/fur/rlsu3wp_2K_Albedo.jpg");
  fur_roughnessMap = loadTexture("materials/fur/rlsu3wp_2K_Roughness.jpg");
  fur_diffuseMap.encoding = THREE.sRGBEncoding;

  resolve(true);
})
.then(() => {
  // DEFAULT HELMET MAPS
  // textureMaterial
  uniforms_texture = {
    // Material specific
    normalMap:	  { type: "t", value: normalMap },
    diffuseMap:	  { type: "t", value: diffuseMap },
    roughnessMap:	{ type: "t", value: roughnessMap },
    metalnessMap:	{ type: "t", value: metalnessMap },
    //aoMap: { type: "t", value: occlusionMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) },
    normalScale: { type: "v2", value: new THREE.Vector2(1,1) }, // TODO only used in EM and IEM
    invertTangentW: { value: 1.0 }, // put 1 only when using helmet normalMaps, 0 otherwise

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  textureMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_texture,
    vertexShader: vs_default,
    fragmentShader: fs_default,
    side : THREE.DoubleSide,
  });

  //
  // copperMaterial
  uniforms_copper = {
    // Material specific
    normalMap:	  { type: "t", value: copper_normalMap },
    diffuseMap:	  { type: "t", value: copper_diffuseMap },
    roughnessMap:	{ type: "t", value: copper_roughnessMap },
    metalnessMap:	{ type: "t", value: copper_metalnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(6.5, 6.5) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  copperMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_copper,
    vertexShader:   vs_default,
    fragmentShader: fs_default,
    side : THREE.DoubleSide,
  });



  // brassMaterial
  uniforms_brass = {
    // Material specific
    normalMap:	  { type: "t", value: brass_normalMap },
    diffuseMap:	  { type: "t", value: brass_diffuseMap },
    roughnessMap:	{ type: "t", value: brass_roughnessMap },
    metalnessMap:	{ type: "t", value: brass_metalnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(4,4) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  brassMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_brass,
    vertexShader: vs_default,
    fragmentShader: fs_default,
    side : THREE.DoubleSide,
  });


  // bronzeMaterial
  uniforms_bronze = {
    // Material specific
    normalMap:	  { type: "t", value: bronze_normalMap },
    diffuseMap:	  { type: "t", value: bronze_diffuseMap },
    roughnessMap:	{ type: "t", value: bronze_roughnessMap },
    metalnessMap:	{ type: "t", value: bronze_metalnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(4,4) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  bronzeMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_bronze,
    vertexShader: vs_default,
    fragmentShader: fs_default,
    side : THREE.DoubleSide,
  });


  // leathersMaterial
  // 0
  uniforms_leather0 = {
    // Material specific
    normalMap:	  { type: "t", value: leather0_normalMap },
    diffuseMap:	  { type: "t", value: leather0_diffuseMap },
    roughnessMap:	{ type: "t", value: leather0_roughnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(6.6,6.6) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  leather0Material = new THREE.ShaderMaterial({
    uniforms: uniforms_leather0,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });
  // 1
  uniforms_leather1 = {
    // Material specific
    normalMap:	  { type: "t", value: leather1_normalMap },
    diffuseMap:	  { type: "t", value: leather1_diffuseMap },
    roughnessMap:	{ type: "t", value: leather1_roughnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(7.6,7.6) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  leather1Material = new THREE.ShaderMaterial({
    uniforms: uniforms_leather1,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });


  // goldMaterial
  uniforms_gold = {
    // Material specific
    normalMap:	  { type: "t", value: gold_normalMap },
    diffuseMap:	  { type: "t", value: gold_diffuseMap },
    roughnessMap:	{ type: "t", value: gold_roughnessMap },
    metalnessMap:	{ type: "t", value: gold_metalnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(8,8) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  goldMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_gold,
    vertexShader: vs_default,
    fragmentShader: fs_default,
    side : THREE.DoubleSide,
  });

  // furMaterial
  uniforms_fur = {
    // Material specific
    normalMap:	  { type: "t", value: fur_normalMap },
    diffuseMap:	  { type: "t", value: fur_diffuseMap },
    roughnessMap:	{ type: "t", value: fur_roughnessMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(9.5,9.5) },
    // TODO sarebbe da aggiungere rotazione?

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1) },
  };

  furMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_fur,
    vertexShader:   vs_dielectric,
    fragmentShader: fs_dielectric,
    side : THREE.DoubleSide,
  });


  uniforms_texture.pointLightPosition.value =
  uniforms_gold  .pointLightPosition.value =
  uniforms_copper.pointLightPosition.value =
  uniforms_brass .pointLightPosition.value =
  uniforms_bronze.pointLightPosition.value =
  uniforms_leather0.pointLightPosition.value =
  uniforms_leather1.pointLightPosition.value =
  uniforms_fur     .pointLightPosition.value =
    new THREE.Vector3(
      lightMesh.position.x,
      lightMesh.position.y,
      lightMesh.position.z
    );

  uniforms_texture.clight.value =
  uniforms_gold  .clight.value =
  uniforms_copper.clight.value =
  uniforms_brass .clight.value =
  uniforms_bronze.clight.value =
  uniforms_leather0.clight.value =
  uniforms_leather1.clight.value =
  uniforms_fur     .clight.value =
    new THREE.Vector3(
      lightParameters.red   * lightParameters.intensity,
      lightParameters.green * lightParameters.intensity,
      lightParameters.blue  * lightParameters.intensity
    );

  // update a dictonary to access materials with strings
  update_name2mat();

  // Load and show the model
  helmet = loadModel();

  // show canvas
  document.getElementById('loader').style.display = 'none';
  document.getElementById('can').style.display = 'block';

  render();
});


// FUNCTIONs //
var gui;
var stats = new Stats();

function init() {

  renderer.setClearColor( 0xf0f0f0 );

  //Coordinates.drawAllAxes();

  //camera.position.set( 0, 10, 10 );
  camera.position.set( 3.0125698739296674, -0.24927753550987475, 5.726534689706049 );
  camera.rotation.set( 0.04350279482356695, 0.4838971371052188, -0.020248918756045297);

  scene.add( camera );
  
  scene.add(lightMesh);

  document.getElementById("model").appendChild( renderer.domElement );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth / 4, window.innerHeight / 4 );

  controls.addEventListener( 'change', render );
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.maxPolarAngle = 2;
  controls.minPolarAngle = 1;
  controls.enablePan = false;

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


function buildGui() {

	clearGui();
	lightSettings = gui.addFolder('Light Parameters');
	lightSettings.add(lightParameters,'red').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'green').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'blue').min(0).max(1).onChange( function(newVal) { render() });
	lightSettings.add(lightParameters,'intensity').min(0).max(3).onChange( function(newVal) { render() });

	environmentSettings = gui.addFolder('Environment Parameters');
	environmentSettings.add(environmentParameters, 'env', env_list).name('Environment').listen()
    .onChange( function(newVal) {
      changeEnvironment(newVal);
    });


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
    'visor_upper_mat', metallic_materials_list )
    .name('Upper Visor Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.VISOR_UPPER,
          newVal
        )});
  materialSettings.add(helmetParameters_materials,
    'visor_lower_mat', metallic_materials_list )
    .name('Lower Visor Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.VISOR_LOWER,
          newVal
        )});
  materialSettings.add(helmetParameters_materials,
    'cheek_pads', dielectric_materials_list )
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
    'neck_roll', dielectric_materials_list )
    .name('Neck Roll Material').listen()
    .onChange(
      newVal => {
        changeComponentMaterial(
          helmet_components_names.NECK_ROLL,
          newVal);
      });

}

var uvRepeat = { 
  "uv_repeat" : 1.0,
}




function updateUniforms() {
  if (
    uniforms_texture  != undefined &&
    uniforms_gold     != undefined &&
    uniforms_copper   != undefined &&
    uniforms_brass    != undefined &&
    uniforms_bronze   != undefined &&
    uniforms_leather0 != undefined &&
    uniforms_leather1 != undefined &&
    uniforms_fur      != undefined
  ) {
    uniforms_texture .clight.value =
      uniforms_gold    .clight.value =
      uniforms_copper  .clight.value =
      uniforms_brass   .clight.value =
      uniforms_bronze  .clight.value =
      uniforms_leather0.clight.value =
      uniforms_leather1.clight.value =
      uniforms_fur     .clight.value =
      new THREE.Vector3(
        lightParameters.red   * lightParameters.intensity,
        lightParameters.green * lightParameters.intensity,
        lightParameters.blue  * lightParameters.intensity
      );
  }
}

init();
//buildGui();

update();
render();


