// DEBUG STUFF


DEBUG_tmp.scene.traverse(
  function (child) {

    if (child.type == "Mesh" || child.type == "SkinnedMesh") {

      console.log(child)
      console.log(child.type)

      DEBUG_child = child;

      var local_geometry = child.geometry;
      local_geometry.center();

      var local_mesh = new THREE.Mesh(
        local_geometry,
        ourMaterial
      );

      local_mesh.scale.multiplyScalar(0.10);

      DEBUG_mesh = local_mesh;

      scene.add(local_mesh);
      console.log("------------------------")
    }

  }
)



//DEBUG_mesh.position.set = new THREE.Vector3(0);



