function loadModel(modelName) {
  /* Given a modelNames element
   * returns the respective mesh with default material
   * */
  switch (modelName) {
    case modelNames.KNOT:
      console.log("loading knot");

      //var material = matParams_redPlastic;
      var geometry = new THREE.TorusKnotGeometry( 2, 0.5, 200, 32 );

      return new THREE.Mesh( geometry, defaultMaterial );

      break;
    case modelNames.SPHERE:
      console.log("loading sphere");

      // TODO texture shader
			geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
      return new THREE.Mesh( geometry, textureMaterial );

      break;
    case modelNames.HELMET:
      console.log("loading helmet");

      var loader = new THREE.GLTFLoader();
      var local_geometry, local_material, local_mesh;
      loader.load(
        "models/scene.gltf",
        function ( model ) {
          DEBUG_tmp = model;
          //console.log(model);

          var mesh_num = 0;

          model.scene.traverse(
            function (child) {

              if (child.type == "Mesh" || child.type == "SkinnedMesh") {
                mesh_num++;

                //console.log(child)
                //console.log(child.type)

                DEBUG_child = child;

                local_geometry = child.geometry;
                local_geometry.center();

                // ------ MATERIAL STUFF ------ //
                // // Mat 1
                // local_material = defaultMaterial;

                // Mat 2
                const texture = new THREE
                  .TextureLoader()
                  .load('models/textures/rig_posedman5_baseColor.png');
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false;
                local_material = new THREE
                  .MeshBasicMaterial( { map: texture } );

                // // Mat 3
                // local_material = child.material;

                local_mesh = new THREE.Mesh(
                  local_geometry,
                  local_material
                );

                local_mesh.scale.multiplyScalar(0.10);

                DEBUG_mesh = local_mesh;

                scene.add(local_mesh);
                //console.log("------------------------")
              }
            }
          );
          console.log(mesh_num + " mesh loaded");
        }
      );
      //scene.add(local_mesh);
      return local_mesh;

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


function loadTexture(file) {
  // Prof's code
  var texture = new THREE.TextureLoader().load( file , function ( texture ) {

    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.anisotropy = renderer.getMaxAnisotropy();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.needsUpdate = true;
    render();
  } )
  return texture;
}

