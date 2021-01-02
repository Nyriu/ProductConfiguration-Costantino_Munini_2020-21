var renderer = new THREE.WebGLRenderer( { antialias: true } );
var camera   = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var scene    = new THREE.Scene();


vs = document.getElementById("vertex").textContent;
fs = document.getElementById("fragment").textContent;

ourMaterial = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vs, fragmentShader: fs });


//// default: white, 1.0 intensity
//var lightParameters = {
//  red: 1.0,
//  green: 1.0,
//  blue: 1.0,
//  intensity: 1.0,
//}

//// default: red plastic
//var materialParameters = {
//  cdiff_red: 0.7,
//  cdiff_green: 0.0,
//  cdiff_blue: 0.0,
//  cspec_red: 0.04,
//  cspec_green: 0.04,
//  cspec_blue: 0.04,
//  roughness: 0.3
//}


//geometry = new THREE.TorusKnotGeometry( 2, 0.5, 200, 32 );

////var loader = new THREE.GLTFLoader();
//var loader = new THREE.OBJLoader();
//loader.useIndices = true;
//	//loader.load( "./models/scene.gltf", function ( model ) {
//	loader.load( "./models/model.obj", function ( model ) {
//		console.log(model);

//		//console.log(model.scene.children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]);

//    //geometry = model.scene.children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[0]
//    //                      .children[2].geometry;

//    geometry = model.children[0].geometry;

//		//geometry = obj.children[0].geometry;
//		geometry.center();

//    //ourMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

//		mesh = new THREE.Mesh( geometry, ourMaterial );


//		mesh.scale.multiplyScalar( 0.1 );
//		THREE.BufferGeometryUtils.computeTangents(geometry);
//		scene.add( mesh );
//	} );


//const loader = new THREE.OBJLoader();
//loader.load(
//  // resource URL
//  "./models/model.obj",
//  // called when resource is loaded
//  function ( object ) {
//    //console.log(object);
//    //console.log(object.children[0]);
//
//    //scene.add( object.children[0] );
//    //scene.add( object.children[1] );
//    //scene.add( object.children[2] );
//    //scene.add( object.children[3] );
//    //scene.add( object.children[4] );
//    //scene.add( object.children[5] );
//    //scene.add( object.children[6] );
//    scene.add( object.children[7] );
//    //scene.add( object.children[8] );
//
//  },
//  // called when loading is in progresses
//  function ( xhr ) {
//
//    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
//
//  },
//  // called when loading has errors
//  function ( error ) {
//
//    console.log( 'An error happened' );
//
//  }
//);

//var mesh = new THREE.Mesh( geometry, ourMaterial );

var lightMesh = new THREE.Mesh( new THREE.SphereGeometry( 1, 16, 16),
  new THREE.MeshBasicMaterial ({color: 0xffff00, wireframe:true}));
lightMesh.position.set( 7.0, 7.0, 7.0 );
uniforms.pointLightPosition.value = new THREE.Vector3(lightMesh.position.x,
  lightMesh.position.y,
  lightMesh.position.z);

var gui;
var stats = new Stats();

function init() {

  renderer.setClearColor( 0xf0f0f0 );


  Coordinates.drawAllAxes();

  camera.position.set( 0, 10, 10 );
  scene.add( camera );

  //scene.add( mesh );

  //DEBUG_knot = loadModel(modelNames.KNOT);
  //scene.add(DEBUG_knot);

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


