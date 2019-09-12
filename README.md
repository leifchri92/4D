# 4Dexplorer

Website for the visualization of 4D geometry using the [three.js](https://threejs.org/) library for 3D geometry and [hammer.js](https://hammerjs.github.io/) library for touch events.

The scene is specified using the regular three.js syntax. See the [three.js Github](https://github.com/mrdoob/three.js/tree/master) for a simple example.

[4Dtemplate.html](4Dtemplate.html) contains the code for the main webpage. [js/4Dtemplate.js](./js/4Dtemplate.js) contains the code for the interactive 4D scene.

## Adding a 4D object to the scene

All objects in the scene are contained in the g_objects. 

Regular 3D objects may be added to g_objects, and then will be rendered in the scene. See the makeCube() function in [js/4Dtemplate.js](./js/4Dtemplate.js) for an example of 3D mesh.

To add 4D objects, first create a three.js object ([THREE.Mesh](https://threejs.org/docs/index.html#api/en/objects/Mesh), [THREE.LineSegments](https://threejs.org/docs/index.html#api/en/objects/LineSegments), etc). Then add a vertices4D property to the object containing an array of [THREE.Vector4](https://threejs.org/docs/index.html#api/en/math/Vector4) objects. Optionally, you may add another array of [THREE.Vector4](https://threejs.org/docs/index.html#api/en/math/Vector4) as wireframeVertices to render a wireframe for the added model. wireframeVertices should be rendered as linesegments. See makeAxes4D() and makeTorus4D() in [js/4Dtemplate.js](./js/4Dtemplate.js) for examples.
