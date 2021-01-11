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


var loaderPromise = new Promise((resolve, reject) => {
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
  resolve(true);
})
.then(() => {
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

  // Load and show the model
  var helmet = loadModel(modelNames.HELMET);
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


  // TODO update to modify materials
	//materialSettings = gui.addFolder('material settings');
	//materialSettings.add(materialParameters,'cdiff_red').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'cdiff_green').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'cdiff_blue').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'cspec_red').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'cspec_green').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'cspec_blue').min(0).max(1).onChange( function(newVal) { render() });
	//materialSettings.add(materialParameters,'roughness').min(0).max(1).onChange( function(newVal) { render() });
}

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
buildGui();

update();
render();


