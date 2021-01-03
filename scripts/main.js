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
lightMesh.position.set( 7.0, 7.0, 7.0 );


// UNIFORMs //
uniforms_default = {
  cspec:	{ type: "v3", value: new THREE.Vector3() },
  cdiff:	{ type: "v3", value: new THREE.Vector3() },
  roughness: {type: "f", value: 0.5},
  pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
  clight:	{ type: "v3", value: new THREE.Vector3() },
};
uniforms = uniforms_default;

//// TODO move promise in utility.js
//var loaderPromise = new Promise(function(resolve, reject) {
//  function loadDone(x) {
//    console.log("loader successfully completed loading task");
//    resolve(x); // it went ok!
//  }
//  var loader = new THREE.TextureLoader();
//  loader.load("https://codefisher.org/static/images/pastel-svg/256/bullet-star.png", loadDone);
//});

var diffuseMap;
var specularMap;
var roughnessMap;

var loaderPromise = new Promise((resolve, reject) => {
  diffuseMap   = loadTexture( "models/textures/rig_posedman5_baseColor.png" );
  specularMap  = loadTexture( "models/textures/rig_posedman5_baseColor.png" );
  roughnessMap = loadTexture( "models/textures/rig_posedman5_metallicRoughness.png" );
  console.log("textures: " + diffuseMap + " " + specularMap + " " + roughnessMap)
  resolve(true);
})
.then(() => {
  console.log("then")
  uniforms_texture = {
   specularMap: { type: "t", value: specularMap },
   diffuseMap:	{ type: "t", value: diffuseMap },
   roughnessMap:	{ type: "t", value: roughnessMap },
   pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
   clight:	{ type: "v3", value: new THREE.Vector3() },
   textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) }
  };

  uniforms_default.pointLightPosition.value = 
  new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
  );

  textureMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms_texture,
    vertexShader: vs_texture,
    fragmentShader: fs_texture
  });
});


//
//var diffuseMap   = loadTexture( "models/textures/rig_posedman5_baseColor.png" );
//var specularMap  = loadTexture( "models/textures/rig_posedman5_baseColor.png" );
//var roughnessMap = loadTexture( "models/textures/rig_posedman5_metallicRoughness.png" );
//
//uniforms_texture = {
//  specularMap: { type: "t", value: specularMap}, // Questo viene eseguito prima del loading
//  diffuseMap:	{ type: "t", value: diffuseMap},// Questo viene eseguito prima del loading
//  roughnessMap:	{ type: "t", value: roughnessMap},// Questo viene eseguito prima del loading
//  pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
//  clight:	{ type: "v3", value: new THREE.Vector3() },
//  textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) }
//};

//uniforms_default.pointLightPosition.value = uniforms_default.pointLightPosition.value =

//uniforms_texture.pointLightPosition.value =
//  new THREE.Vector3(
//    lightMesh.position.x,
//    lightMesh.position.y,
//    lightMesh.position.z
//  );

// MATERIALs //
// defaultMaterial = new THREE.ShaderMaterial({
//   uniforms: uniforms_default,
//   vertexShader: vs_default,
//   fragmentShader: fs_default
// });


// FUNCTIONs //

var gui;
var stats = new Stats();

function init() {

  renderer.setClearColor( 0xf0f0f0 );


  Coordinates.drawAllAxes();

  camera.position.set( 0, 10, 10 );
  scene.add( camera );

  //DEBUG_knot = loadModel(modelNames.KNOT);
  //scene.add(DEBUG_knot);

  //DEBUG_sphere = loadModel(modelNames.SPHERE); // TODO la sfera usa shader texture e per ora NON funziona
  //scene.add(DEBUG_sphere);

  var helmet = loadModel(modelNames.HELMET);
  //scene.add(helmet);

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

//function clearGui() {

//	if ( gui ) gui.destroy();
//	gui = new dat.GUI();
//	gui.open();

//}

//function buildGui() {

//	clearGui();
//	lightSettings = gui.addFolder('Light Parameters');
//	lightSettings.add(lightParameters,'red').min(0).max(1).onChange( function(newVal) { render() });
//	lightSettings.add(lightParameters,'green').min(0).max(1).onChange( function(newVal) { render() });
//	lightSettings.add(lightParameters,'blue').min(0).max(1).onChange( function(newVal) { render() });
//	lightSettings.add(lightParameters,'intensity').min(0).max(10000).onChange( function(newVal) { render() });

//	materialSettings = gui.addFolder('material settings');
//	materialSettings.add(materialParameters,'cdiff_red').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'cdiff_green').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'cdiff_blue').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'cspec_red').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'cspec_green').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'cspec_blue').min(0).max(1).onChange( function(newVal) { render() });
//	materialSettings.add(materialParameters,'roughness').min(0).max(1).onChange( function(newVal) { render() });
//}

function updateUniforms() {
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
}

init();
//buildGui();

update();
render();


