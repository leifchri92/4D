function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2  
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  var c = vec3();
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  //var v = vec3(c); // change
  c = normalize(c); // change
  return c; // change
}

function calcNormals(vertices) {
    var normals = [];
    for (var i=0; i<vertices.length; i+=3) {
        var normal = calcNormal(vertices[i], vertices[i+1], vertices[i+2])
        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }

    return normals;
}

function distance(p1, p2) {

  if (p1.length != p2.length) {
    throw "distance(): trying to calculate distance between points of different dimensions";
  }

  var sum=0;
  for (var i=0; i<p1.length; i++) {
    sum += (p2[i] - p1[i])*(p2[i] - p1[i]);
  }

  return Math.sqrt(sum);
}

function degrees(radians) {
  return radians * 180 / Math.PI;
}