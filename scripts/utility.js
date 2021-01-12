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
			geometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
      return new THREE.Mesh( geometry, textureMaterial );

      break;
    case modelNames.OLD_HELMET:
      console.log("loading single mesh helmet");

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

                // // Mat 2
                // const texture = new THREE
                //   .TextureLoader()
                //   .load('models/textures/rig_posedman5_baseColor.png');
                // texture.encoding = THREE.sRGBEncoding;
                // texture.flipY = false;
                // local_material = new THREE
                //   .MeshBasicMaterial( { map: texture } );

                // Mat 3
                const texture = loadTexture('models/textures/rig_posedman5_baseColor.png');
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false;
                local_material = new THREE
                  .MeshBasicMaterial( { map: texture } );

                // // Mat 4
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
    case modelNames.HELMET:
      console.log("loading helmet");

      var loader = new THREE.GLTFLoader();
      var local_geometry, local_material, local_mesh;
      var helmet = new THREE.Object3D();
      var mesh_num = 0;

			helmet_center_geom = new THREE.SphereBufferGeometry( 0.2, 8, 8 );
      helmet_center = new THREE.Mesh( helmet_center_geom, defaultMaterial );
      helmet_center.name = helmet_ids2components[mesh_num];
      mesh_num++;
      helmet.add(helmet_center);


      loader.load(
        "models/helmet.gltf",
        function ( model ) {
          DEBUG_helmet = model;


          model.scene.traverse(
            function (child) {
              if (child.type == "Mesh" || child.type == "SkinnedMesh") {
                DEBUG_child = child;

                local_geometry = child.geometry;
                //local_geometry.center();

                local_material = textureMaterial;

                local_mesh = new THREE.Mesh(
                  local_geometry,
                  local_material
                );

                local_mesh.name = helmet_ids2components[mesh_num];

                //local_mesh.scale.multiplyScalar(0.10);
                local_mesh.scale.multiplyScalar(8);
                //local_mesh.position.set(1.0, 1.0, 1.0);

                DEBUG_mesh = local_mesh;

                //scene.add(local_mesh);
                helmet.add(local_mesh);

                //console.log( helmet_ids2components[mesh_num])
                //console.log(mesh_num)
                mesh_num++;
                //console.log("------------------------")
              }
            }
          );

          DEBUG_helmet = helmet;
          helmet.position.set(0,-14,0); // TODO centrare in Maya
          scene.add(helmet);

          //noCheekPads(helmet);

          //console.log((mesh_num-1) + " mesh loaded");
        }
      );
      //scene.add(local_mesh);
      return helmet;

      break;
    default:
      throw new Error("Unknown modelName! Cannot load " + modelName)
      break;
  }
}

function loadTexture(file) {
  // Prof's code
  var texture = new THREE.TextureLoader().load( file , function ( texture ) {

    texture.minFilter = THREE.LinearMipMapLinearFilter;
    //texture.anisotropy = renderer.getMaxAnisotropy();
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set( 0, 0 ); // inutile tanto non viene usato nello shader
    texture.needsUpdate = true;
    render();
  } )
  return texture;
}

function loadCubeMap(path) {
	// load cube map for background
	var loader = new THREE.CubeTextureLoader();
	loader.setPath( 'models/textures/cubemaps/' + path + '/' );

	var textureCube = loader.load([
    'posx.jpg', 'negx.jpg',
    'posy.jpg', 'negy.jpg',
    'posz.jpg', 'negz.jpg'
  ]);
	return textureCube;
}


// TODO fare in modo che il modello sia completamente pronto prima di eseguire questi
function showCheekPads(show=true, helmet=DEBUG_helmet) {
  var comps = [
    helmet_components_names.CHEEK_PAD_LEFT,
    helmet_components_names.CHEEK_PAD_RIGHT,
    helmet_components_names.CONNECTOR_LEFT,
    helmet_components_names.CONNECTOR_RIGHT
  ];

  comps.forEach( c => {
    helmet.getObjectByName(c).visible = show;
  })

  render();
}

function showLeather(show=true, helmet=DEBUG_helmet) {
  var comps = [
    helmet_components_names.NECK_ROLL,
    helmet_components_names.CHEEK_PAD_LEFT,
    helmet_components_names.CHEEK_PAD_RIGHT,
    helmet_components_names.CONNECTOR_LEFT,
    helmet_components_names.CONNECTOR_RIGHT
  ];

  comps.forEach( c => {
    helmet.getObjectByName(c).visible = show;
  })

  render();
}



function update_name2mat() {
  // TODO can be better: controls
  mat_name2mat = {
    //"default" : defaultMaterial,
    //"texture" : textureMaterial,
    "default" : textureMaterial,
    "gold"    : goldMaterial,
    "fur"    : furMaterial,
    "copper"  : copperMaterial,
    "brass"   : brassMaterial,
    "bronze"  : bronzeMaterial,
    "metal"   : metalMaterial,
    "leather0" : leather0Material,
    "leather1" : leather1Material,
    "fur"     : furMaterial,
    "normals" : normalsMaterial,
  };
}


// TODO below materials changers
function changeComponentMaterial(comp_name, mat_name) {
  if (!materials_loaded) {
    throw new Error("Materials not ready yet!");
  }
  if (! comp_name in helmet_components_names ) {
    throw new Error("Unknown component: " + comp_name);
  }
  if (! mat_name in mat_name2mat ) {
    throw new Error("Unknown material: " + comp_name);
  }

  console.log(mat_name); // DEBUG
  console.log( mat_name2mat[mat_name] ); // DEBUG

  // TODO check on undefined IMPORTANT

  component = helmet.getObjectByName(comp_name);
  component.material = mat_name2mat[mat_name];
  component.material.needsUpdate = true;

  render();
};

