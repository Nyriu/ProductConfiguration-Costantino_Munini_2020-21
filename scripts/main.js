var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding;
var composer = new THREE.EffectComposer(renderer);
var canvas;
var pixelRatio;

var camera   = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
var controls = new THREE.OrbitControls(camera, renderer.domElement);
var scene    = new THREE.Scene();

var lightMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffff00, wireframe: true
  }));
lightMesh.position.set(4.0, 4.0, 7.0);
lightMesh.visible = false;

// EM //
var cubeMapForesta = loadCubeMap("foresta");
var cubeMapFiume = loadCubeMap("fiume");
var cubeMapCascata = loadCubeMap("cascata");
var cubeMapNeve = loadCubeMap("neve");

var irradianceForesta = loadCubeMap("irradianceForesta");
var irradianceFiume = loadCubeMap("irradianceFiume");
var irradianceCascata = loadCubeMap("irradianceCascata");
var irradianceNeve = loadCubeMap("irradianceNeve");

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
  // DEFAULT HELMET MAPS
  normalMap    = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Normal.png");
  diffuseMap   = loadTexture("models/textures/T_VikingBerserk_UpperArmor_BaseColor.png");
  roughnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Roughness.png");
  metalnessMap = loadTexture("models/textures/T_VikingBerserk_UpperArmor_Metallic.png");
  normalMap   .flipY = false;
  diffuseMap  .flipY = false;
  roughnessMap.flipY = false;
  metalnessMap.flipY = false;

  // COPPER MAPS
  copper_normalMap    = loadTexture("materials/copper/cross_brushed_copper_normal.png");
  copper_diffuseMap   = loadTexture("materials/copper/cross_brushed_copper_basecolor.png");
  copper_roughnessMap = loadTexture("materials/copper/cross_brushed_copper_roughness.png");
  copper_metalnessMap = loadTexture("materials/copper/cross_brushed_copper_metallic.png");

  // BRASS MAPS
  brass_normalMap    = loadTexture("../materials/brass/se4nbarc_4K_Normal.jpg ");
  brass_diffuseMap   = loadTexture("../materials/brass/se4nbarc_4K_Albedo.jpg ");
  brass_roughnessMap = loadTexture("../materials/brass/se4nbarc_4K_Roughness.jpg ");
  brass_metalnessMap = loadTexture("../materials/brass/se4nbarc_4K_Metalness.jpg ");

  // BRONZE MAPS
  bronze_normalMap    = loadTexture("../materials/bronze/se4pcbbc_4K_Normal.jpg ");
  bronze_diffuseMap   = loadTexture("../materials/bronze/se4pcbbc_4K_Albedo.jpg ");
  bronze_roughnessMap = loadTexture("../materials/bronze/se4pcbbc_4K_Roughness.jpg ");
  bronze_metalnessMap = loadTexture("../materials/bronze/se4pcbbc_4K_Metalness.jpg ");

  // LEATHERs MAPS
  // 0
  leather0_normalMap    = loadTexture("materials/leather0/leather_bull_Normal.png");
  leather0_diffuseMap   = loadTexture("materials/leather0/leather_bull_Base_Color.png");
  leather0_roughnessMap = loadTexture("materials/leather0/leather_bull_Roughness.png");
  // 1
  leather1_normalMap    = loadTexture("materials/leather1/oizt3np_2K_Normal.jpg");
  leather1_diffuseMap   = loadTexture("materials/leather1/oizt3np_2K_Albedo.jpg");
  leather1_roughnessMap = loadTexture("materials/leather1/oizt3np_2K_Roughness.jpg");

  // GOLD MAPS
  gold_normalMap    = loadTexture("materials/gold/schvfgwp_2K_Normal.jpg");
  gold_diffuseMap   = loadTexture("materials/gold/schvfgwp_2K_Albedo.jpg");
  gold_roughnessMap = loadTexture("materials/gold/schvfgwp_2K_Roughness.jpg");
  gold_metalnessMap = loadTexture("materials/gold/schvfgwp_2K_Metalness.jpg");

  // FUR MAPS
  fur_normalMap    = loadTexture("materials/fur/rlsu3wp_2K_Normal.jpg");
  fur_diffuseMap   = loadTexture("materials/fur/rlsu3wp_2K_Albedo.jpg");
  fur_roughnessMap = loadTexture("materials/fur/rlsu3wp_2K_Roughness.jpg");
  fur_aoMap        = loadTexture("materials/fur/rlsu3wp_2K_AO.jpg");

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
    textureRepeat: { type: "v2", value: new THREE.Vector2(1, 1) },
    normalScale: { type: "v2", value: new THREE.Vector2(1, 1) },
    invertTangentW: { value: 1.0 }, // put 1 only when using helmet normalMaps, 0 otherwise

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: ambientLightPam },
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
    ambientLight: { type: "v3", value: ambientLightPam },
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
    ambientLight: { type: "v3", value: ambientLightPam },
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
    ambientLight: { type: "v3", value: ambientLightPam },
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
    textureRepeat: { type: "v2", value: new THREE.Vector2(6.6, 6.6) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: ambientLightPam },
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
    textureRepeat: { type: "v2", value: new THREE.Vector2(7.6, 7.6) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: ambientLightPam },
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
    textureRepeat: { type: "v2", value: new THREE.Vector2(8, 8) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapNeve },
    irradianceMap:  { type: "t", value: irradianceNeve },
    ambientLight: { type: "v3", value: ambientLightPam },
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
    aoMap:	      { type: "t", value: fur_aoMap },
    textureRepeat: { type: "v2", value: new THREE.Vector2(9.5, 9.5) },

    // Lights
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    envMap: { type: "t", value: cubeMapForesta },
    irradianceMap:  { type: "t", value: irradianceForesta },
    ambientLight: { type: "v3", value: ambientLightPam },
  };

  furMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_fur,
    vertexShader:   vs_dielectric_ao,
    fragmentShader: fs_dielectric_ao,
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
  render();
});


// FUNCTIONS //
function init() {
  renderer.setClearColor( 0xf0f0f0 );

  camera.position.set(3.0125698739296674, -0.24927753550987475, 5.726534689706049);
  camera.rotation.set(0.04350279482356695, 0.4838971371052188, -0.020248918756045297);

  scene.add(camera);
  
  scene.add(lightMesh);

  document.getElementById("model").appendChild(renderer.domElement);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.3);

  controls.addEventListener('change', render);
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.maxPolarAngle = 2;
  controls.minPolarAngle = 1;
  controls.enablePan = false;

  controls.update();

  window.addEventListener('resize', onResize, false);

  canvas = document.getElementById("model").children[1];
  pixelRatio = renderer.getPixelRatio();
  // Post Proc //
  composer.addPass(new THREE.RenderPass(scene, camera));

  fxaaPass = new THREE.ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvas.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvas.offsetHeight * pixelRatio);
  composer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  composer.addPass(fxaaPass);

  effectToon = new THREE.ShaderPass(ToonShader);
  effectToon.uniforms['resolution'].value.x = canvas.offsetWidth  * pixelRatio;
  effectToon.uniforms['resolution'].value.y = canvas.offsetHeight * pixelRatio;
}

//var effectToon;
function addEffectToon() {
  composer.addPass(effectToon);
  composer.render();
}

function removeEffectToon() {
  composer.removePass(effectToon);
  composer.render();
}

function onResize() {
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.3);
  camera.aspect = (window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvas.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvas.offsetHeight * pixelRatio);
  composer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  effectToon.uniforms['resolution'].value.x = canvas.offsetWidth  * pixelRatio;
  effectToon.uniforms['resolution'].value.y = canvas.offsetHeight * pixelRatio;

}

function update() {
  requestAnimationFrame(update);
}

function render() {
  updateUniforms();
  composer.render();
}

function clearGui() {
	if (gui) gui.destroy();
	gui = new dat.GUI();
	gui.open();
}

var uvRepeat = { // Serve?
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
update();
render();
