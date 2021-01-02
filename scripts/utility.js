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


function loadModel(modelName) {
  /* Given a modelNames element returns the respective mesh with default material */
  switch (modelName) {
    case modelNames.KNOT:
      console.log("knot");

      //var material = matParams_redPlastic;
      var geometry = new THREE.TorusKnotGeometry( 2, 0.5, 200, 32 );

      return new THREE.Mesh( geometry, ourMaterial );

      break;
    case modelNames.HELMET:
      console.log("helmet");

      var loader = new THREE.GLTFLoader();
      var local_mesh, local_geometry;
      loader.load(
        "models/scene.gltf",
        function ( model ) {
          DEBUG_tmp = model;
          //console.log(model);

          model.scene.traverse(
            function (child) {

              if (child.type == "Mesh" || child.type == "SkinnedMesh") {

                //console.log(child)
                //console.log(child.type)

                //DEBUG_child = child;

                local_geometry = child.geometry;
                local_geometry.center();

                local_mesh = new THREE.Mesh(
                  local_geometry,
                  ourMaterial
                );

                local_mesh.scale.multiplyScalar(0.10);

                DEBUG_mesh = local_mesh;

                scene.add(local_mesh);
                //console.log("------------------------")
              }
            }
          );
        }
      );
      //scene.add(local_mesh);
      return local_mesh;
      //throw new Error("HELMET loading not implemented yet!");

      break;
    default:
      throw new Error("Unknown modelName! Cannot load " + modelName)
      break;
  }
}

    /*
const loader = new THREE.OBJLoader();
loader.load(
  // resource URL
  "./models/model.obj",
  // called when resource is loaded
  function ( object ) {
    //console.log(object);
    //console.log(object.children[0]);

    //scene.add( object.children[0] );
    //scene.add( object.children[1] );
    //scene.add( object.children[2] );
    //scene.add( object.children[3] );
    //scene.add( object.children[4] );
    //scene.add( object.children[5] );
    //scene.add( object.children[6] );
    scene.add( object.children[7] );
    //scene.add( object.children[8] );

  },
  // called when loading is in progresses
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' );

  }
);
*/

