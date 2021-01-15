function loadModel() {
  console.log("loading helmet");

  var loader = new THREE.GLTFLoader();
  var local_geometry, local_material, local_mesh;
  var helmet = new THREE.Object3D();
  var mesh_num = 0;

  helmet_center_geom = new THREE.SphereBufferGeometry( 0.2, 8, 8 );
  helmet_center = new THREE.Object3D();
  helmet_center.name = helmet_ids2components[mesh_num];
  helmet_center.visible = false;
  mesh_num++;
  helmet.add(helmet_center);

  loader.load(
    "models/helmet.gltf",
    function ( model ) {
      model.scene.traverse(
        function (child) {
          if (child.type == "Mesh" || child.type == "SkinnedMesh") {
            DEBUG_child = child; // TODO REMOVE

            local_geometry = child.geometry;
            local_material = textureMaterial;

            local_mesh = new THREE.Mesh(
              local_geometry,
              local_material
            );

            local_mesh.name = helmet_ids2components[mesh_num];
            local_mesh.scale.multiplyScalar(8);

            DEBUG_mesh = local_mesh; // TODO REMOVE

            helmet.add(local_mesh);
            mesh_num++;
          }
        }
      );

      DEBUG_helmet = helmet; // TODO REMOVE
      helmet.position.set(0,-14,0); // TODO centrare in Maya
      scene.add(helmet);
    }
  );
  return helmet;
}

function loadTexture(file) {
  var texture = new THREE.TextureLoader().load( file , function ( texture ) {
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.needsUpdate = true;
    render();
  } )
  return texture;
}

function loadCubeMap(path) {
	// load cube map for background
	var loader = new THREE.CubeTextureLoader();
	loader.setPath( 'cubemaps/' + path + '/' );

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
  mat_name2mat = {
    "default" : textureMaterial,

    "gold"    : goldMaterial,
    "copper"  : copperMaterial,
    "brass"   : brassMaterial,
    "bronze"  : bronzeMaterial,

    "leather0" : leather0Material,
    "leather1" : leather1Material,
    "fur"     : furMaterial,
  };
}


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

  component = helmet.getObjectByName(comp_name);
  component.material = mat_name2mat[mat_name];
  component.material.needsUpdate = true;

  render();
};


function changeEnvironment(env_name) {
  if (!materials_loaded) {
    throw new Error("Materials not ready yet!");
  }
  if (! env_name in env_name2env ) {
    throw new Error("Unknown env: " + env_name);
  }

  uniforms_texture .envMap.value =
  uniforms_gold    .envMap.value =
  uniforms_copper  .envMap.value =
  uniforms_brass   .envMap.value =
  uniforms_bronze  .envMap.value =
  uniforms_leather0.envMap.value =
  uniforms_leather1.envMap.value =
  uniforms_fur     .envMap.value =
    env_name2env[env_name][0];

  uniforms_texture .irradianceMap.value =
  uniforms_gold    .irradianceMap.value =
  uniforms_copper  .irradianceMap.value =
  uniforms_brass   .irradianceMap.value =
  uniforms_bronze  .irradianceMap.value =
  uniforms_leather0.irradianceMap.value =
  uniforms_leather1.irradianceMap.value =
  uniforms_fur     .irradianceMap.value =
    env_name2env[env_name][1];

  scene.background = env_name2env[env_name][0];
  render();
};

