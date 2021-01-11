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



// --------------------------------------------------------------------------------

showCheekPads(false);

showLeather(false);
showLeather(true);

// --------------------------------------------------------------------------------


function rescaleUVs(uv_bufAttr) {
  // Not perfect but gets the job done
  // more or less...
  const in_arr = uv_bufAttr.array;
  min_x = min_y = Infinity;
  max_x = max_y = -Infinity;

  max_delta_x = -Infinity;
  max_delta_y = -Infinity;

  i = 0;
  while ( i < in_arr.length-2 ) {
    x = in_arr[i];
    i++;
    y = in_arr[i];

    // delta
    if (i > 2){ 
      delta_x = Math.abs(in_arr[i-2] - x);
      delta_y = Math.abs(in_arr[i-2] - x);
      max_delta_x = (max_delta_x < delta_x) ? delta_x : max_delta_x;
      max_delta_y = (max_delta_y < delta_y) ? delta_y : max_delta_y;
    }
    // TODO check if deltas are too big
    // look lower visor it's like stretched?!

    
    // Min Max Stuff
    if (min_x > x) {
      min_x = x;
    }
    if (max_x < x) {
      max_x = x;
    }

    if (min_y > y) {
      min_y = y;
    }
    if (max_y < y) {
      max_y = y;
    }
    i++;
  }

  console.log("mins " + min_x + " " + min_y);
  console.log("mins " + max_x + " " + max_y);

  console.log("ratio " + (max_x - min_x)/(max_y - min_y));

  i=0
  while ( i < in_arr.length-2 ) {
    x = in_arr[i];
    in_arr[i] = (x - min_x) * 1/max_x;

    i++;
    y = in_arr[i];
    in_arr[i] = (y - min_y) * 1/max_y;

    i++;
  }


  // TODO now translate

  // TODO and scale

  uv_bufAttr.array = in_arr;
  uv_bufAttr.needsUpdate = true;
  return uv_bufAttr;
}

left_pad = DEBUG_helmet.getObjectByName( helmet_components_names.CHEEK_PAD_LEFT )
uvs = left_pad.geometry.attributes.uv
new_uvs = rescaleUVs(uvs)
left_pad.geometry.setAttribute("uv", new_uvs);

visor_upper = DEBUG_helmet.getObjectByName( helmet_components_names.VISOR_UPPER )
uvs = visor_upper.geometry.attributes.uv
new_uvs = rescaleUVs(uvs)
visor_upper.geometry.setAttribute("uv", new_uvs);

visor_lower = DEBUG_helmet.getObjectByName( helmet_components_names.VISOR_LOWER )
uvs = visor_lower.geometry.attributes.uv
new_uvs = rescaleUVs(uvs)
visor_lower.geometry.setAttribute("uv", new_uvs);


render();


