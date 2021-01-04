// DEBUG STUFF


//DEBUG_tmp.scene.traverse(
//  function (child) {
//
//    if (child.type == "Mesh" || child.type == "SkinnedMesh") {
//
//      console.log(child)
//      console.log(child.type)
//
//      DEBUG_child = child;
//
//      var local_geometry = child.geometry;
//      local_geometry.center();
//
//      var local_mesh = new THREE.Mesh(
//        local_geometry,
//        ourMaterial
//      );
//
//      local_mesh.scale.multiplyScalar(0.10);
//
//      DEBUG_mesh = local_mesh;
//
//      scene.add(local_mesh);
//      console.log("------------------------")
//    }
//
//  }
//)


// --------------------------------------------------------------------------------
//DEBUG_mesh.position.set(0.0, 0.0, 0.0);



// --------------------------------------------------------------------------------
const origin = new THREE.Vector3(0);

DEBUG_helmet.traverse(
  function (child) {
    if (child.name != "center" && (child.type == "Mesh" || child.type == "SkinnedMesh")) {
      if ( DEBUG_helmet.position.equals(origin) ) {
        console.log("new pos")
        var new_pos = child.geometry.boundingBox.center().multiplyScalar(-1);
        DEBUG_helmet.position.set(
          new_pos.x,
          new_pos.y,
          new_pos.z
        );
      } else {
        // mean
        console.log("else")
        var old_pos = DEBUG_helmet.position;
        var tmp_pos = child.geometry.boundingBox.center().multiplyScalar(-1);
        DEBUG_helmet.position.set(
          0.5 * (old_pos.x + tmp_pos.x),
          0.5 * (old_pos.y + tmp_pos.y),
          0.5 * (old_pos.z + tmp_pos.z)
        );
      }
    }
  }
);

render();
DEBUG_helmet.position;


// --------------------------------------------------------------------------------

DEBUG_helmet.traverse(
  function (child) {
    if (child.name != "center" && (child.type == "Mesh" || child.type == "SkinnedMesh")) {
      DEBUG_child = child;
      console.log("zering");

      console.log(child.geometry.boundingBox.center());

      console.log(child.position);
      var old_pos = child.position;
      //console.log(old_pos);
      child.position.set(
        old_pos.x,
        //0.0,
        - child.geometry.boundingBox.center().y,
        old_pos.z
      );
      console.log(child.position);
      console.log("----------");

      render();
    }
  }
);






