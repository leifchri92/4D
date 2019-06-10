/* 
 * 4Dtemplate.js Renders an interactive scene with 4D and 3D elements
 *
 * This file requires three.js, hammer.js
 *
 * author Leif Christiansen <leifchristiansen92@gmail.com>
 */
/*
    ToDo:
    * ThreeJS requires that additional models be added to the scene for each desired render mode (eg triangles, lines, points)
    These models are differentiated by name, eg by setting the THREE.Mesh.name attribute
    Ideally this would be accomplished in a more controlled and transparent method
    * Make g_projectionStart4D an enumeration
    * improve touch event handling
*/

//#############################################################
// Global Variables
//#############################################################
//-------------------------------------------------------------
// Scene Parameters

var g_container;
var g_camera, g_scene, g_renderer, g_scene2;
var g_light; // reference to light
var g_specular = 100;
var g_axes4d; // reference to 4D axes Object
var g_objects = new THREE.Group(); // group that will hold all other objects in our scene

// window width and height are dynamically resized
var g_windowWidth = 800; 
var g_windowHeight = 600;
var g_windowHalfX = g_windowWidth / 2;
var g_windowHalfY = g_windowHeight / 2;
var g_axes4dSize = 0.15 // proportion of the canvas covered by the 4D axes

var g_identityMatArray = [
                    1.0, 0.0, 0.0, 0.0, 
                    0.0, 1.0, 0.0, 0.0, 
                    0.0, 0.0, 1.0, 0.0, 
                    0.0, 0.0, 0.0, 1.0 ]; 
var g_identityMat = new THREE.Matrix4();
var g_sceneRotation = new THREE.Matrix4();

//-------------------------------------------------------------
// Input Controls

var g_inputFlag = false;
var g_xInput = g_yInput = g_xInputPrev = g_yInputPrev = 0;
var g_shiftFlag = false;
var g_altFlag = false;
var g_ctrlFlag = false;

var InteractionEnum = Object.freeze({"translate":0, "rotate":1});
var g_interactionMode = InteractionEnum.translate; 

var g_animateRotateFlag = false;
var RotationEnum = Object.freeze({"none":0, "shift":1, "ctr":2, "alt":3});
var g_animateRotateMode = RotationEnum.none;
var g_animating = false;
var g_momentumThreshold = 1.5; // the minimum required delta to animate rotation
var g_dXMomentum = 0;
var g_dYMomentum = 0;

var g_speed = 100; // interaction (rotation, translation) speed

//-------------------------------------------------------------
// Rendering Parameters

var Projection4DEnum = Object.freeze({"perspective":0, "orthographic":1})
var g_projection4DMode = Projection4DEnum.orthographic;
// var Projection4DStartEnum = Object.freeze({"x":0, "y":1, "z":2, "w":3})
var g_projectionStart4D = "w"; // can't be an enum since it reads value off of slider

var g_doRenderWorldAxes = true;
var g_doRender4DAxes = true;
var g_smoothFlag = false;

// Wrap the 4d model matrix in an object so that we update the scene when the matrix is changed
function ModelMatrix4D() {
	this.m = new THREE.Matrix4();
}
ModelMatrix4D.prototype.premultiply = function( mat ) {
	this.m.premultiply( mat );
	update4DModels();
}
var g_modelMatrix4D = new ModelMatrix4D();

// Check if device is mobile and return bool
function isMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

//#############################################################
// Main Program
//#############################################################
window.onload = function init() {
	g_container = document.getElementById( 'webgl-container' );
	g_windowWidth = g_windowHeight = g_container.offsetWidth-20;

	// scene

	g_scene = new THREE.Scene();
	g_scene.background = new THREE.Color( 0x387fb3 );

    g_scene2 = new THREE.Scene(); // this scene will be used for the 4D axes

	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	g_scene.add(ambientLight);

	g_light = new THREE.PointLight( 0xffffff, 1, 100 );
	g_light.position.set( 2, 2, 5 );
	g_scene.add( g_light );

	// camera

	g_camera = new THREE.PerspectiveCamera( 45, g_windowWidth / g_windowHeight, 0.1, 2000 );
	g_camera.position.z = 5;
	g_camera.name = "camera";
	g_scene.add( g_camera );

	g_camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 2000 );
	g_camera2.position.z = 5;
	g_scene2.add( g_camera2 );

	// models

	var axes3d = makeAxes3D( 1.5 );
	if ( !g_doRenderWorldAxes ) axes3d.visible = false;
	g_objects.add( axes3d );

	g_axes4d = makeAxes4D( 1 );
	if ( !g_doRender4DAxes ) axes4d.visible = false;
	g_scene2.add( g_axes4d );

	g_scene.add( g_objects );

	// renderer

	g_renderer = new THREE.WebGLRenderer( { alpha: true } );
	g_renderer.setPixelRatio( window.devicePixelRatio );
	g_renderer.setSize( g_windowWidth, g_windowHeight );
	g_renderer.autoClear = false;
	g_container.appendChild( g_renderer.domElement );

	// event listeners

	initEventHandlers();
	window.addEventListener( 'resize', onWindowResize, false );

	render();
}

//#############################################################
// Drawing
//#############################################################
// Reproject all 4D objects into 3D
// Note: A model is considered 4D if it has the additional vertices4D property
function update4DModels() {
	for ( let child of g_objects.children ) {
        if ( child.hasOwnProperty('geometry') ) {
			if ( child.geometry.hasOwnProperty( 'vertices4D' ) ) {
				console.log(child.name);
				child.geometry.vertices = from4Dto3D( child.geometry.vertices4D, g_modelMatrix4D.m.elements );
                child.geometry.verticesNeedUpdate = true;
	            child.geometry.elementsNeedUpdate = true;

                if ( child instanceof THREE.Mesh ) {
                	if ( child.name.includes("flat") ) child.geometry.computeFaceNormals();
	                else child.geometry.computeVertexNormals();
	                child.geometry.normalsNeedUpdate = true;

	                var vnh = g_objects.getObjectByName( "normals-"+child.name ); 
	                if ( vnh ) {
		                vnh.update();
		                vnh.setRotationFromMatrix( g_sceneRotation );
	            	}
	            }

			}
		}
	}

	let tmp = g_projection4DMode;
	g_projection4DMode = Projection4DEnum.orthographic;
	g_axes4d.geometry.vertices = from4Dto3D( g_axes4d.geometry.vertices4D, g_modelMatrix4D.m.elements );
	g_axes4d.geometry.verticesNeedUpdate = true;
	g_projection4DMode = tmp;

	render();
}

// Applies animated rotation using g_dXMomentum, g_dYMomentum, and g_animateRotateMode
function animate() {
	if (!g_animateRotateFlag || g_inputFlag) {
		g_animating = false;
		return;
	}

	requestAnimationFrame( animate );

    if (g_animateRotateMode == RotationEnum.shift) {
        g_modelMatrix4D.premultiply( makeRot4d( 0, 0, -g_dXMomentum ));
    } else if (g_animateRotateMode == RotationEnum.alt) {
        g_modelMatrix4D.premultiply( makeRot4d( g_dXMomentum, g_dYMomentum, 0 ));
    } else if (g_animateRotateMode == RotationEnum.none) { 
        g_sceneRotation.premultiply( rollingBall( -g_dXMomentum, g_dYMomentum ) );
		g_objects.setRotationFromMatrix( g_sceneRotation );
		g_axes4d.setRotationFromMatrix( g_sceneRotation );
    }

    render();

    g_animating = true;
}

function clearScene() {
	var toRemove = [];
	for ( let child of g_objects.children ) {
        if ( !( child.name.includes( "axes" ) ) ) {
            toRemove.push( child );
        }
    }

    for ( var i=0; i<toRemove.length; i++) g_objects.remove( toRemove[i] );
}

function render() {
	g_renderer.clear();

	// render main scene
	g_renderer.setViewport( 0, 0, g_windowWidth, g_windowHeight );
	g_renderer.render( g_scene, g_camera );

	// render the 4D axes
	g_renderer.clearDepth();
    var size = g_windowHeight * g_axes4dSize;
	g_renderer.setViewport( 0, g_windowHeight-size, size, size );
	g_renderer.render( g_scene2, g_camera2 );
}

//#############################################################
// Event Handlers
// Note: x and y input are normalized to [-1, 1]
//#############################################################
function initEventHandlers() {
    document.addEventListener( 'keydown', onKeyDown );
    
    document.getElementById('geometry-dropdown').onchange = handleGeometryDropdown;
    document.getElementById('subdivisions-slider').onchange = handleSubdivisionsSlider;
	document.getElementById('calabi-yau-n-dropdown').onchange = handleCYNDropdown;
    document.getElementById('ximax-slider').onchange = handleXimaxSlider;
    document.getElementById('xiN-slider').onchange = handleXiNSlider;
    document.getElementById('thetaN-slider').onchange = handleThetaNSlider;
	document.getElementById('momentum').checked = g_animateRotateFlag;
    document.getElementById('momentum').onchange = function () {
        g_animateRotateFlag = !g_animateRotateFlag;
        g_dXMomentum = 0;
        g_dYMomentum = 0;
    }
    document.getElementById('rotation-slider').value = g_speed;
    document.getElementById('rotation-slider').onchange = function () {
        g_speed = this.value;
    };
    document.getElementById('specular-slider').value = g_specular;
    document.getElementById('specular-slider').onchange = function () {
        g_specular = this.value;
        g_objects.children.forEach( function(ele) {
            if (ele.material != undefined && ele instanceof THREE.Mesh) {
                ele.material.shininess = g_specular;
                ele.material.needsUpdate = true;
                render();
            }
        });
    };

    g_renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
    g_renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
    g_renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
    g_renderer.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

    // g_renderer.domElement.addEventListener( 'touchstart', onTouchStart, false );
    // g_renderer.domElement.addEventListener( 'touchmove', onTouchMove, false );
    // g_renderer.domElement.addEventListener( 'touchend', onTouchEnd, false );
    
    g_renderer.domElement.addEventListener( 'contextmenu', event => event.preventDefault() );

    document.getElementById("reset-4D-button").onclick = reset4DTransforms;
    document.getElementById("reset-3D-button").onclick = reset3DTransforms;
    
    document.getElementById("frame-axes-toggle").onchange = toggleWorldAxes;
    document.getElementById("frame-axes-toggle").checked = g_doRenderWorldAxes;
    
    document.getElementById("4D-axes-toggle").onchange = toggle4DAxes;
    document.getElementById('4D-axes-toggle').checked = g_doRender4DAxes;
    
    document.getElementById("wireframe-toggle").onchange = toggleEdges;
    
    document.getElementById("points-toggle").onchange = togglePoints;
    
    document.getElementById("faces-toggle").onchange = toggleFaces;
    
    document.getElementById("shading-toggle").onchange = toggleSmoothShading;
    document.getElementById("shading-toggle").checked = g_smoothFlag;
    // document.getElementById("").onchange = toggleNormals;

    document.getElementById("4D-perspective-toggle").onchange = toggle4DPerspective;
    document.getElementById("4D-perspective-toggle").checked = (g_projection4DMode == Projection4DEnum.orthographic);

    document.getElementById("z-4D-rot-toggle").onchange = function() {
        // fixed z-axis
        g_shiftFlag = !g_shiftFlag;
        g_altFlag = false;
        document.getElementById("4D-rot-toggle").checked = false;
        g_ctrlFlag = false;
        document.getElementById("light-move-toggle").checked = false;
    }
    document.getElementById("4D-rot-toggle").onchange = function() {
        g_shiftFlag = false;
        document.getElementById("z-4D-rot-toggle").checked = false;
        g_altFlag = !g_altFlag;
        g_ctrlFlag = false;
        document.getElementById("light-move-toggle").checked = false;
    }
    document.getElementById("light-move-toggle").onchange = function() {
        g_shiftFlag = false;
        document.getElementById("z-4D-rot-toggle").checked = false;
        g_altFlag = false;
        document.getElementById("4D-rot-toggle").checked = false;
        g_ctrlFlag = !g_ctrlFlag;
    }

    $('input[name=projection-start]').change(function () {
        g_projectionStart4D = $('input[name=projection-start]:checked').val();
        console.log($('input[name=projection-start]:checked').val())
        update4DModels();
        render();
    });

    render();


    if ( isMobile() ) {
        initMobileEventHandlers( g_container );

        setupMobileUI();
    } else {
        $('.mobile').remove();
        $('#webgl-container').addClass('col-xs-8');
        $('#controls').addClass('col-xs-4');
    }

    $('body').fadeIn();
    onWindowResize();
}

function setupMobileUI() {
    $('.desktop').remove();

    $('#webgl-container').addClass('col-xs-12');
    var styles = {
        "background-color": "rgba(255,255,255,1)",
        "display": "none",
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "z-index": "8888",
        "width": "100%"
    }
    $('#controls').css(styles);

    $("input[type='radio']").css('transform', 'scale(1.5)');
    $("input[type='checkbox']").css('transform', 'scale(1.5)');
    // $("button").css('transform', 'scale(1.2)');
}

var debug = document.getElementById("debug");
function log(text) {
    return;
    debug.innerHTML += text + "<br>";
}
function clear() {
    debug.innerHTML = "";
}
var pinchScaleOld, pinchScale, pinchScaleDelta;
var pinchRotationOld, pinchRotation, pinchRotationDelta;
function initMobileEventHandlers(canvas=null) {
    // prevent the window from resizing with double taps and pinching
    $('#webgl-container').bind('touchend', function(ev) {
        ev.preventDefault();
    });

    var mc = new Hammer(canvas);
    
    // create gesture recognizers
    // two finger pan will be a special case of pinch
    var pinch = new Hammer.Pinch();
    var twopan = new Hammer.Pan( {event: 'twopan', pointers: 2} );
    var threepan =  new Hammer.Pan( {event: 'threepan', pointers: 3} );
    var twopress = new Hammer.Press( {event: 'twopress', pointers: 2, time: 1} );
    var threepress = new Hammer.Press( {event: 'threepress', pointers: 3, time: 1} );
    var tap = new Hammer.Tap( {event: 'tap', pointers: 1, taps: 1} );
    var doubletap = new Hammer.Tap( {event: 'doubletap', pointers: 1, taps: 2, interval: 500} );
    var tripletap = new Hammer.Tap( {event: 'tripletap', pointers: 1, taps: 3, interval: 500, posThreshold: 100} );

    pinch.requireFailure( twopan );
    mc.get('press').recognizeWith( doubletap );
    mc.get('press').recognizeWith( tripletap );
    doubletap.requireFailure( tripletap );
    mc.get('pan').requireFailure( pinch );

    // add the gesture recognizers
    mc.add( [ twopan, twopress, pinch, doubletap, tripletap, tap ] );

    clear();
    log("It's hammertime");

    mc.get('press').set({time: 1});
    mc.on('press twopress threepress', function(ev) {
        clear();
        log('press');
        var x = ev.center.x;
        var y = ev.center.y;
        var rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - g_windowWidth/2)/(g_windowWidth/2);
        y = ((y - rect.top) - g_windowHeight/2)/(g_windowHeight/2);

        onInputStart( x, y );
        pinchScale = pinchScaleOld = ev.scale;
        pinchRotation = pinchRotationOld = ev.rotation;
    });

    mc.on('pan twopan threepan', function(ev) {
        clear();
        log('pan');
        ev.preventDefault();
        var eventType = ev.eventType;

        var x = ev.center.x;
        var y = ev.center.y;
        var rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - g_windowWidth/2)/(g_windowWidth/2);
        y = ((y - rect.top) - g_windowHeight/2)/(g_windowHeight/2);

        if ( ev.type == 'pan' ) {
            g_interactionMode = InteractionEnum.rotate;
        } 

        if ( eventType == Hammer.INPUT_START ) {
            onInputStart( x, y );
        } else if ( eventType == Hammer.INPUT_MOVE) {
            onInputMove( x, y );
        } else if ( eventType == Hammer.INPUT_END) {
            onInputEnd();

            // g_shiftFlag = false;
            // g_altFlag = false;
            // g_panFlag = false;
        }
    });

    mc.on('pinch', function(ev) {
        ev.preventDefault();
        var eventType = ev.eventType;

        clear();

        var x = ev.center.x;
        var y = ev.center.y;
        var rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - g_windowWidth/2)/(g_windowWidth/2);
        y = ((y - rect.top) - g_windowHeight/2)/(g_windowHeight/2);

        if ( eventType == Hammer.INPUT_START ) {
            pinchScale = pinchScaleOld = ev.scale;
        } else if ( eventType == Hammer.INPUT_MOVE ) {
            pinchScale = ev.scale;
            pinchScaleDelta = pinchScaleOld - pinchScale;
            pinchRotation = ev.rotation;
            pinchRotationDelta = pinchRotationOld - pinchRotation;

            if ( Math.abs(pinchRotationDelta) > 0.6 ) {
                log("rotation");
                log(ev.rotation);
                
            } else if ( Math.abs(pinchScaleDelta) < 0.01 ) {
                log("twopan");
                g_altFlag = true;
                onInputMove( x, y );
            } else {
                log("pinch")
                if ( ev.scale < 1 ) zoom( 1 );
                else zoom( -1 );
            }

            pinchScaleOld = pinchScale;
            pinchRotationOld = pinchRotation;
            log(pinchRotationDelta)
        } else if ( eventType == Hammer.INPUT_END) {
            g_shiftFlag = false;
            g_altFlag = false;
        }  

        if ( eventType == Hammer.INPUT_END) {
            onInputStart(x,y);
            onInputEnd();
        }
    });

    mc.on('doubletap', function(ev) {
        ev.preventDefault();

        clear();
        log("Double Tap");

        reset3DTransforms();
    });

    mc.on('tripletap', function(ev) {
        ev.preventDefault();

        clear();
        log("Triple Tap");

        reset4DTransforms();
    });

    document.getElementById('settings-btn').onclick = function(ev) {
        $('#controls').show();
    }
    document.getElementById('settings-close-btn').onclick = function(ev) {
        $('#controls').hide();
    }

    $('input[name=interaction-mode]').change(function () {
        var val = $('input[name=interaction-mode]:checked').val();
        console.log(val)

        g_altFlag = g_shiftFlag = false;
        if (val == 'three') {
        } else if (val == 'xw-yw') {
            g_altFlag = true;
        } else if (val == 'fixed-z') {
            g_shiftFlag = true;
        }
        render();
    });
}  

// Model selection
function handleGeometryDropdown() {
	clearScene();
    showGeometryControls( this.value );

    if (this.value == "torus4D") {
		var subSlider = document.getElementById('subdivisions-slider');
	    addTorus4DTo( g_objects, parseFloat( subSlider.value ), true );
    } else if (this.value == "cube") {
    	addCubeTo( g_objects );
    } else if (this.value == "steiner") {
    	console.log("Steiner")
        load4OFFFromServer("models/steiner.4off");
    } else if (this.value == "none") {
       
    } else if (this.value == "one-side-torus4D") {
       	var subSlider = document.getElementById('subdivisions-slider');
	    addTorus4DTo( g_objects, parseFloat( subSlider.value ), false );
    } else if (this.value == "calabi-yau") {
    	addFermatSurfaceTo( g_objects, 2 );
    } else if (this.value == "C5") {
        
    }

    render();
}

// Show and hide additional controls based on the model
function showGeometryControls( model ) {
 	$('#calabi-yau-ximax-tr').hide();
    $('#calabi-yau-xiN-tr').hide();
    $('#calabi-yau-thetaN-tr').hide();
    $('#subdivisions-tr').hide()
    $('#calabi-yau-tr').hide();
    $('#calabi-yau-n-tr').hide();

    if ( model == 'torus4D' ) {
    	$('#subdivisions-tr').show()
	} else if ( model == 'calabi-yau' ) {
		$('#calabi-yau-ximax-tr').show();
        $('#calabi-yau-xiN-tr').show();
        $('#calabi-yau-thetaN-tr').show();
        $('#calabi-yau-n-tr').show();
	}
}

function onWindowResize() {
	g_windowWidth = g_windowHeight = g_container.offsetWidth-20;

	g_windowHalfX = g_windowWidth / 2;
	g_windowHalfY = g_windowWidth / 2;

	g_camera.aspect = g_windowWidth / g_windowHeight;
	g_camera.updateProjectionMatrix();

	g_renderer.setSize( g_windowWidth, g_windowHeight );

	render();
}

//-------------------------------------------------------------
// Torus controls

function handleSubdivisionsSlider() {
    var geoDropdown = document.getElementById('geometry-dropdown');
    if (geoDropdown.value == "torus4D") {
    	clearScene();
		addTorus4DTo( g_objects, parseFloat( this.value ), true );
    }

    render();
}

//-------------------------------------------------------------
// Fermat Surface controls

function handleCYNDropdown() {
    clearScene();
    addFermatSurfaceTo( g_objects, parseInt(document.getElementById("calabi-yau-n-dropdown").value) );
    render();
}

function handleXimaxSlider() {
    handleCYNDropdown();
}

function handleXiNSlider() {
    handleCYNDropdown();
}

function handleThetaNSlider() {
    handleCYNDropdown();
}

//-------------------------------------------------------------
// Mouse/Touch controls

function onInputStart( x, y ) {
    // console.log("inputStart")
	g_inputFlag = true;
	g_xInput = x * g_speed;
	g_yInput = y * g_speed;
	g_xInputPrev = g_xInput;
	g_yInputPrev = g_yInput;
	g_dXMomentum = 0;
    g_dYMomentum = 0;

	render();
}

function onInputMove( x, y ) {
	if ( !g_inputFlag ) return;

    // console.log("onInputMove");

	g_xInput = x * g_speed;
	g_yInput = y * g_speed;
	var xDelta = g_xInputPrev - g_xInput;
	var yDelta = g_yInputPrev - g_yInput;
	g_xInputPrev = g_xInput;
	g_yInputPrev = g_yInput;

	if ( g_interactionMode == InteractionEnum.translate ) {
		g_camera.position.x += xDelta / g_windowHalfX;
		g_camera.position.y += -yDelta / g_windowHalfX;
	} else if ( g_interactionMode == InteractionEnum.rotate ) {
		if ( g_shiftFlag ) {
			g_modelMatrix4D.premultiply( makeRot4d( 0, 0, -xDelta ) );
			g_animateRotateMode = RotationEnum.shift;
		} else if ( g_altFlag ) {
            g_modelMatrix4D.premultiply( makeRot4d( xDelta, yDelta, 0 ));
            g_animateRotateMode = RotationEnum.alt;
        } else if (g_ctrlFlag ) {
            var pos = g_light.position;
            pos.x += -xDelta;
            pos.y += yDelta;
            g_light.position = pos;
            g_animateRotateMode = RotationEnum.ctrl;
        } else {
			g_sceneRotation.premultiply( rollingBall( -xDelta, yDelta ) );
			g_objects.setRotationFromMatrix( g_sceneRotation );
			g_axes4d.setRotationFromMatrix( g_sceneRotation );
            g_animateRotateMode = RotationEnum.none;
		}
	} 

    g_dXMomentum = xDelta;
    g_dYMomentum = yDelta;

    if ( Math.abs(g_dXMomentum) < g_momentumThreshold && Math.abs(g_dYMomentum) < g_momentumThreshold ) {
        g_dXMomentum = 0;
        g_dYMomentum = 0;
    }

	render();
}

function onInputEnd() {
	g_inputFlag = false;

	render();

    if ( g_animateRotateFlag && !g_animating ) animate();
}

function zoom( delta ) {
	var newFov = g_camera.fov + delta/2;
	if (newFov > 0 && newFov < 180) {
		g_camera.fov = newFov;
		g_camera.updateProjectionMatrix();
	}

	render();
}

// Touch events

function onTouchStart( ev ) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;

    if (ev.touches.length == 2) {
    	g_interactionMode = InteractionEnum.translate;
    } else if (ev.touches.length == 1) {
    	g_interactionMode = InteractionEnum.rotate;
    }

	onInputStart(x, y); 
}

function onTouchMove( ev ) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;

    onInputMove(x, y); 
}

function onTouchEnd( ev ) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;

	onInputEnd(x, y); 
}

// Mouse events

function onMouseDown( ev ) {
	if (ev.button == 2) { // right button
		g_interactionMode = InteractionEnum.translate;
	} else if (ev.button == 0) { // left button
		g_interactionMode = InteractionEnum.rotate;
	}

	var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - g_windowWidth/2)/(g_windowWidth/2);
    y = ((y - rect.top) - g_windowHeight/2)/(g_windowHeight/2);

    onInputStart(x, y); 
}

function onMouseMove( ev ) {
	if ( !g_inputFlag ) return;
	
	var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - g_windowHeight/2)/(g_windowHeight/2);
    y = ((y - rect.top) - g_windowWidth/2)/(g_windowWidth/2); 

    if (ev.altKey) g_altFlag = true;
    if (ev.shiftKey) g_shiftFlag = true;
    if (ev.ctrlKey) g_ctrlFlag = true;

    onInputMove(x, y);   
}

function onMouseUp( ev ) {
	if ( !g_inputFlag ) return;
	g_shiftFlag = false;
    g_altFlag = false;
    g_ctrlFlag = false;

	onInputEnd();
}

function onMouseWheel( ev ) {
    ev.preventDefault();

	zoom( Math.sign( ev.wheelDelta ) * 2 );
}

//-------------------------------------------------------------
// Keyboard events

function onKeyDown( ev ) {
    if ( ev.key == '0' ) {
        toggle4DPerspective();
    } else if ( ev.key == 'R' ) {
        reset4DTransforms();
    } else if ( ev.key == 'r' ) {
        reset3DTransforms();
    } else if ( ev.key == 'n' ) {
        toggleNormals();
    } else if ( ev.key == 'a' ) {
        toggleWorldAxes();
    } else if ( ev.key == 'A' ) {
        toggle4DAxes();
    } else if ( ev.key == 'v' ) {
        togglePoints();
    } else if ( ev.key == 'f' ) {
        toggleFaces();
    } else if ( ev.key == 's' ) {
        toggleSmoothShading();
    } else if ( ev.key == 'h' ) {
        var eles = document.getElementsByClassName( "desktop-shortcut" );
        for ( var i=0; i<eles.length; i++ ) {
            var ele = eles[i];
            if ( ele.style.display == "none" ) ele.style.display = "block";
            else ele.style.display = "none";
        }
    } else if ( ev.key == 'e' ) {
    	toggleEdges();
    }

    render();
}

function toggle4DPerspective() {
    if ( g_projection4DMode == Projection4DEnum.perspective ) {
        g_projection4DMode = Projection4DEnum.orthographic;
    } else {
        g_projection4DMode = Projection4DEnum.perspective;
    }
    update4DModels();
}

function reset4DTransforms() {
    g_modelMatrix4D.m.elements = g_identityMatArray.slice();
    update4DModels();

    render();
}

function reset3DTransforms() {
    g_sceneRotation.elements = g_identityMatArray.slice();
    g_objects.setRotationFromMatrix( g_sceneRotation );
    g_axes4d.setRotationFromMatrix( g_sceneRotation );
    
    render();
}

function toggleNormals() {
    for ( let child of g_objects.children ) {
        if ( child.name.includes( "normals" ) ) {
            console.log('toggle normals');
            child.visible = !child.visible;
        }
    }
}

function togglePoints() {
    for ( let child of g_objects.children ) {
        if ( child.name.includes( "points" ) ) {
            child.visible = !child.visible;
            document.getElementById("points-toggle").checked = child.visible;
        }
    }

    render();
}

function toggleEdges() {
    for ( let child of g_objects.children ) {
        if ( child.name.includes( "edges" ) ) {
            child.visible = !child.visible;
            document.getElementById("wireframe-toggle").checked = child.visible;
        }
    }

    render();
}

function toggleFaces() {
    for ( let child of g_objects.children ) {
        if ( child instanceof THREE.Mesh ) {
            if ( g_smoothFlag ) {
                if ( child.name.includes("smooth") ) {
                    child.visible = !child.visible;
                    document.getElementById("faces-toggle").checked = child.visible;
                }
            } else {
                if ( child.name.includes("flat") ) {
                    child.visible = !child.visible;
                    document.getElementById("faces-toggle").checked = child.visible;
                }
            }
        }
    }

    render();
}

function toggleSmoothShading() {
    g_smoothFlag = !g_smoothFlag;

    for ( let child of g_objects.children ) {
        if ( child instanceof THREE.Mesh ) {
        	if ( child.name.includes("smooth") ) child.visible = g_smoothFlag;
        	else if ( child.name.includes("flat") ) child.visible = !g_smoothFlag;
        	document.getElementById("shading-toggle").checked = g_smoothFlag;
        }
    }

    render();
}

function toggleWorldAxes() {
	console.log("toggle")

    var axes = g_objects.getObjectByName( "axes3d" );
    axes.visible = !axes.visible;
    document.getElementById("frame-axes-toggle").checked = axes.visible;

    render();
}

function toggle4DAxes() {
    g_axes4d.visible = !g_axes4d.visible;

    render();
}

//#############################################################
// Geometry
//#############################################################
var m = new THREE.Matrix4();
function rollingBall( dx, dy ) {
	if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return g_identityMat;

	var dr = Math.sqrt(dx*dx + dy*dy)
	var R = 100;
	var cos = R/Math.sqrt(R*R + dr*dr)
	var sin = dr/Math.sqrt(R*R + dr*dr)

	m.elements = [
		cos + (dy/dr)*(dy/dr)*(1-cos),
		-(dx/dr)*(dy/dr)*(1-cos),
		-(dx/dr)*sin,
		1,

		-(dx/dr)*(dy/dr)*(1-cos),
		cos+(dx/dr)*(dx/dr)*(1-cos),
		-(dy/dr)*sin,
		0,

		(dx/dr)*sin,
		(dy/dr)*sin,
		cos,
		0,

		0,
		0,
		0,
		0
	];

	return m;
}

function makeRot4d( x_in, y_in, z_in ) {    
    if (Math.abs(x_in) < 0.00001 && Math.abs(y_in) < 0.00001 && Math.abs(z_in) < 0.00001) return g_identityMat;
    
    let R = 50.0;
    
    var x = x_in;
    var y = y_in;
    var z = z_in;
    var d = Math.sqrt(x*x+y*y+z*z);
    var d1 = 1.0 / d;
    x *= d1;
    y *= d1;
    z *= d1;
    var D1 = 1.0 / Math.sqrt(d*d + R*R);
    var c = R*D1;
    var s = d*D1;
    
   	m.elements = [
        1.0-x*x*(1.0-c), //0
        -(1.0-c)*x*y, //1
        -(1.0-c)*x*z, //2
        -s*x, //3

        -(1.0-c)*x*y, //4
        1.0-y*y*(1.0-c), //5
        -(1.0-c)*y*z, //6
        -s*y, //7
        
        -(1.0-c)*x*z, //8
        -(1.0-c)*y*z, //9
        1.0-z*z*(1.0-c), //10
        -s*z, //11
        
        s*x,//12
        s*y,//13
        s*z,//14
        c//15
    ];

    return m;
}

function from4Dto3D(vertices, mat4) {
    var obj_scale = 1.0;
    var s = 255.99 / (2.0 * 1.0)

    var output = []

    for (var i=0; i<vertices.length; i++) {
        var v = vertices[i];

        var x = v.x;
        var y = v.y;
        var z = v.z;
        var w = v.w;

        var new_x = obj_scale * (mat4[ 0 ] * x + mat4[ 4 ] * y +
            mat4[ 8 ] * z + mat4[ 12 ] * w )
        
        var new_y = obj_scale * (mat4[ 1 ] * x + mat4[ 5 ] * y +
            mat4[ 9 ] * z + mat4[ 13 ] * w )
        
        var new_z = obj_scale * (mat4[ 2 ] * x + mat4[ 6 ] * y +
            mat4[ 10 ] * z + mat4[ 14 ] * w )
        
        var new_w = obj_scale * (mat4[ 3 ] * x + mat4[ 7 ] * y +
            mat4[ 11 ] * z + mat4[ 15 ] * w )

        var focalControl;
        if (g_projection4DMode == Projection4DEnum.perspective) {
            if (g_projectionStart4D == "x") {
                focalControl = 1+new_x;
            } else if (g_projectionStart4D == "y") {
                focalControl = 1+new_y;
            } else if (g_projectionStart4D == "z") {
                focalControl = 1+new_z;
            } else if (g_projectionStart4D == "w") {
                focalControl = 1+new_w;
            }
        } else {
            focalControl = 1;
        }
        
        var newVertex;
        if (g_projectionStart4D == "x") 
            newVertex = new THREE.Vector3(new_y/(focalControl), new_z/(focalControl), new_w/(focalControl));
        else if (g_projectionStart4D == "y")
            newVertex = new THREE.Vector3(new_x/(focalControl), new_z/(focalControl), new_w/(focalControl))
        else if (g_projectionStart4D == "z")
            newVertex = new THREE.Vector3(new_x/(focalControl), new_y/(focalControl), new_w/(focalControl))
        else if (g_projectionStart4D == "w")
            newVertex = new THREE.Vector3(new_x/(focalControl), new_y/(focalControl), new_z/(focalControl))
        else
        	console.log("ERROR: Unknown ProjectionStart4D " + g_projectionStart4D);

        output.push(newVertex);
    }

    return output;
}

//#############################################################
// Loading Models from Files
//#############################################################
function stringToInts(str, sep=" ") {
    var ints = [];
    var temp = str.split(sep)
    for (var j=0;j<temp.length;j++) {
        var tempStr = temp[j];
        if (tempStr != "") {
            var tempInt = parseInt(tempStr);
            if (!isNaN(tempInt)) {
                ints.push(tempInt);
            }
        }
    }

    return ints;
}

function stringToFloats(str, sep=" ") {
    var floats = [];
    var temp = str.split(sep);
    for (var i=0; i<temp.length; i++) {
        var tempStr = temp[i];
        if (tempStr != "") {
            var tempFloat = parseFloat(tempStr);
            if (!isNaN(tempFloat)) {
                floats.push(tempFloat);
            }
        }
    }

    return floats;
}

function loadOFFFromServer(file) {
    readTextFile(file, loadOFFDataToModels3D);
}

function load4OFFFromServer(file) {
    readTextFile(file, load4OFFDataToModels4D);
}

function loadOFFDataToModels3D(offText) {
    var lines = offText.split('\n');

    var numVerts;
    var numFaces;
    var i=0;
    for (; i<lines.length; i++) {
        var line = lines[i];

        if (line.startsWith("#") || line.startsWith("OFF") || line=="") {
            
        } else {
            var temp = line.split(" ")
            numVerts = parseInt(temp[0]);
            numFaces = parseInt(temp[1]);

            i++;
            break;
        }
    }
    if (i==lines.length) {
        alert("Error reading OFF file.")
        return;
    }

    var vertices = [];
    for (var p=0; p<numVerts; p++) {
        var line = lines[i];
        var temp = line.split(" ").filter(function(el) {return el.length != 0}).map(parseFloat);
        vertices.push(new THREE.Vector3(temp[0], temp[1], temp[2]));
        i++;
    }

    var faces = [];
    for (var p=0; p<numFaces; p++) {
        var line = lines[i];
        var temp = line.split(" ").filter(function(el) {return el.length != 0});
        temp.shift()
        temp = temp.map(parseFloat);
        faces.push(temp);
        i++;
    }

    // var colors = [];
    // var wireframeVertices = [];
    var facesTriangulated = [];
    for (var q=0; q<faces.length; q++) {
        var face = faces[q];
        var color = new THREE.Color(Math.random(), Math.random(), Math.random());
        for (var p=2; p<face.length; p++) {
            facesTriangulated.push(face[0]);
            facesTriangulated.push(face[p-1]);
            facesTriangulated.push(face[p]);
        }

        // for (var p=0; p<face.length; p++) {
        //     wireframeVertices.push(vertices[face[p]]);
        //     wireframeVertices.push(vertices[face[(p+1)%face.length]]);
        // }
    }
    
    // var offModel = new Model3D(vertexData, normalData, colors, 1, gl.TRIANGLES, wireframeVertices, "off");
    // console.log(offModel);

    var geometry = new THREE.Geometry();
    geometry.vertices4D = vertices4D;
    geometry.vertices = vertices;
    geometry.faces = facesTriangulated;
 
    geometry.verticesNeedUpdate = true;

    var color = new THREE.Color(0.0, 0.2, 0.7);
    var material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: g_specular,
        side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh( geometry, material );
    mesh.name = "3off";

    addMeshTo( g_objects, mesh );
    render();
}

function load4OFFDataToModels4D(offText) {
    console.log("Loading")
    var lines = offText.split('\n');

    var numVerts;
    var numFaces;
    var i=0;
    for (; i<lines.length; i++) {
        var line = lines[i];

        if (line.startsWith("#") || line.startsWith("4OFF") || line=="") {
            
        } else {
            var ints = stringToInts(line);
            numVerts = ints[0];
            numFaces = ints[1];

            // console.log(numVerts, numFaces)
            i++;
            break;
        }
    }
    if (i==lines.length) {
        alert("Error reading OFF file.")
        return;
    }

    var vertices4D = [];
    for (var p=0; p<numVerts;) {
        var line = lines[i].split("#")[0];
        if (line.length !=0 ) {
            var floats = stringToFloats(line);            
            if (floats.length == 4) {
                vertices4D.push(new THREE.Vector4(floats[0], floats[1], floats[2], floats[3]));
                p++;
            }
        }
        i++;
    }

    var faces = [];
    for (var p=0; p<numFaces;) {
        var line = lines[i].split("#")[0];
        if (line.length !=0 ) {
            var floats = stringToFloats(line);
            if (!isNaN(floats[0])) {  
                var vertsInFace = floats[0];
                if ((floats.length-1) == vertsInFace) {
                    faces.push(floats.slice(1,floats.length));
                    p++;
                }          

            }
        }
        i++;
    }

    var facesTriangulated = [];
    // var wireframeVertices = [];
    var colors = [];
    for (var q=0; q<faces.length; q++) {
        var face = faces[q];
        for (var p=2; p<face.length; p++) {
            facesTriangulated.push( new THREE.Face3( face[0], face[p-1], face[p] ) );
        }
        
        // for (var p=0; p<face.length; p++) {
        //     wireframeVertices.push(vertexData[face[p]]);
        //     wireframeVertices.push(vertices[face[(p+1)%face.length]]);
        // }
    }

    var geometry = new THREE.Geometry();
    geometry.vertices4D = vertices4D;
	geometry.vertices = from4Dto3D( vertices4D, g_modelMatrix4D.m.elements );
	geometry.faces = facesTriangulated;
 
 	//geometry.computeFaceNormals();

	geometry.verticesNeedUpdate = true;

    var color = new THREE.Color(0.7, 0.2, 0.7);
	var material = new THREE.MeshPhongMaterial({
		color: color,
		shininess: g_specular,
		side: THREE.DoubleSided
	});

	var mesh = new THREE.Mesh( geometry, material );
	mesh.name = "4off";

	// mesh.wireframeVertices = wireframeVertices;

    addMeshTo( g_objects, mesh );
    //g_objects.add( mesh );
    render();
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}

//#############################################################
// Model Generation
//#############################################################

// Add model to group with additional models to visualize normals, verticies, and edges
// Note: To visualize edges, make sure that a wireframeVertices property is added to the mesh
// wireframeVertices should be an array of THREE.Vector3
function addMeshTo( group, mesh ) {
	var normals = makeNormalsModel( mesh );
    normals.visible = false;
    
    var points = makePointModel( mesh );
    points.visible = false;

    // there is no easy way to switch between flat and smooth shading in three.js
    // so we have to have two seperate models
    var flatMesh = mesh.clone();
    flatMesh.geometry = mesh.geometry.clone();
    flatMesh.geometry.vertices4D = mesh.geometry.vertices4D;
    flatMesh.geometry.computeFaceNormals();
    flatMesh.name = "flat-"+mesh.name;

    var smoothMesh = mesh.clone();
    smoothMesh.geometry = mesh.geometry.clone();
    smoothMesh.geometry.vertices4D = mesh.geometry.vertices4D;
    smoothMesh.geometry.computeVertexNormals();
    smoothMesh.name = "smooth-"+mesh.name;

    if ( g_smoothFlag ) flatMesh.visible = false;
    else smoothMesh.visible = false;

    group.add( flatMesh );
    group.add( smoothMesh );
    group.add( normals );
    group.add( points );

    if ( mesh.hasOwnProperty('wireframeVertices') ) {
    	var edges = makeEdgesModel( mesh );
    	group.add( edges );
    }
}

// return a model visualizing the normals of mesh
function makeNormalsModel( mesh ) {
    var vnh;
    // if ( g_smoothFlag ) vnh = new THREE.VertexNormalsHelper( mesh, 0.2, 0xffff00 );
    // else 
    vnh = new THREE.FaceNormalsHelper( mesh, 0.2, 0xffff00, 1 );
    vnh.name = "normals-"+mesh.name;
    return vnh;
}

// return a model visualizing the points of mesh
function makePointModel( mesh ) {
    var dotMaterial = new THREE.PointsMaterial( { size: 0.1, color: 0x131313 } );
    var points = new THREE.Points( mesh.geometry, dotMaterial );
    points.name = "points-"+mesh.name;
    return points;
}

// return a model visualizing the edges of mesh using the wireframeVertices attribute
function makeEdgesModel( mesh ) {
	var material = new THREE.LineBasicMaterial( { color: 0x000000 });

	var geometry = new THREE.Geometry;
	geometry.vertices4D = mesh.wireframeVertices;
	geometry.vertices = from4Dto3D( geometry.vertices4D, g_modelMatrix4D.m.elements );
	geometry.verticesNeedUpdate = true;

	var line = new THREE.LineSegments( geometry, material );
    line.renderOrder = 10;
	line.name = "edges-"+mesh.name;
	line.visible = false;

    if (Array.isArray(mesh.material)) {
        mesh.material.forEach(function(material) {
            material.polygonOffset = true;
            material.polygonOffsetFactor = 1;
            material.polygonOffsetUnits = 1;
        });
    } else {
        mesh.material.polygonOffset = true;
        mesh.material.polygonOffsetFactor = 1;
        mesh.material.polygonOffsetUnits = 1;
    }

	return line;
}

// Axes

// return a THREE.LineSegments representing 3D axes
function makeAxes3D( l=1 ) {
    var geometry = new THREE.Geometry();
    geometry.vertices = [
    	new THREE.Vector3(0, 0, 0), 
    	new THREE.Vector3(l, 0, 0), 
    	new THREE.Vector3(0, 0, 0), 
    	new THREE.Vector3(0, l, 0), 
    	new THREE.Vector3(0, 0, 0), 
    	new THREE.Vector3(0, 0, l)
    ];
    geometry.colors = [
    	new THREE.Color( 0xff0000 ),
    	new THREE.Color( 0xff0000 ),
    	new THREE.Color( 0x00ff00 ),
    	new THREE.Color( 0x00ff00 ),
    	new THREE.Color( 0x0000ff ),
    	new THREE.Color( 0x0000ff )
    ];

    var material = new THREE.LineBasicMaterial( {
	    color: 0xffffff,
	    vertexColors: THREE.VertexColors
	} );

    var axes3d = new THREE.LineSegments( geometry, material );
    axes3d.name = "axes3d";

    return axes3d;
}

// return a THREE.LineSegments representing 4D axes
function makeAxes4D( l=1 ) {
	var geometry = new THREE.Geometry();
    geometry.vertices4D = [
    	new THREE.Vector4(0, 0, 0, 0), 
    	new THREE.Vector4(l, 0, 0, 0),
    	new THREE.Vector4(0, 0, 0, 0),
    	new THREE.Vector4(0, l, 0, 0),
    	new THREE.Vector4(0, 0, 0, 0),
    	new THREE.Vector4(0, 0, l, 0),
    	new THREE.Vector4(0, 0, 0, 0),
    	new THREE.Vector4(0, 0, 0, l),
    ];
    geometry.vertices = from4Dto3D( geometry.vertices4D, g_modelMatrix4D.m.elements );
    geometry.colors = [
    	new THREE.Color( 0xff0000 ),
    	new THREE.Color( 0xff0000 ),
    	new THREE.Color( 0x00ff00 ),
    	new THREE.Color( 0x00ff00 ),
    	new THREE.Color( 0x0000ff ),
    	new THREE.Color( 0x0000ff ),
    	new THREE.Color( 0xffff00 ),
    	new THREE.Color( 0xffff00 )
    ];

    var material = new THREE.LineBasicMaterial( {
	    color: 0xffffff,
	    vertexColors: THREE.VertexColors
	} );

    var axes4d = new THREE.LineSegments( geometry, material );
    axes4d.name = "axes4d";

    return axes4d;
}

// Fermat Surface

function addFermatSurfaceTo( group, n ) {
	var ximax = document.getElementById('ximax-slider').value / 100.0;
    var xiN = document.getElementById('xiN-slider').value * 2 + 1;
    var thetaN = document.getElementById('thetaN-slider').value;

	for (var k1=0; k1<n; k1++) {
        for (var k2=0; k2<n; k2++) { 
        	var patch = makeFermatSurfacePatch(n, k1, k2, ximax, xiN, thetaN);
        	addMeshTo( group, patch );
        }
    }
}

// return a patch of a Fermat Surface space
function makeFermatSurfacePatch(n, k1, k2, ximax=1, xiN=7, thetaN=7) {
    var vertices4D = [];
    var faces = [];
    var wireframeVertices = [];

    var thetaMax = Math.PI/2;
    var thetaN = parseFloat(thetaN);
    var thetaStep = thetaMax/(thetaN-1);
    var xiN = parseFloat(xiN);
    var xiStep = (ximax*2)/(xiN-1);
    for (var theta=0; theta<=thetaMax; theta+=thetaStep) {
        for (var xi=-ximax; xi<=ximax; xi+=xiStep) {
            vertices4D.push( calcFermatSurfacePoint(theta,xi,n,k1,k2) );
        }
    }

    for (var i=0; i<thetaN-1; i++) {
        for (var j=0; j<xiN-1; j++) {
            var index = i*xiN+j;
            var f0 = new THREE.Face3( index,             index+xiN, index+xiN+1 );            
            var f1 = new THREE.Face3( index+xiN+1, index+1,   index );
            faces.push( f0, f1 );
        }
    }

    var c = 0.1;
    var myColor = new THREE.Color( c+(k1/(n-1)), c+(k2/(n-1)), 0);
    if (k1==0 && k2==0) {
        myColor.b = 1;
    }

    var geometry = new THREE.Geometry();
    geometry.vertices4D = vertices4D;
	geometry.vertices = from4Dto3D( vertices4D, g_modelMatrix4D.m.elements );
	geometry.faces = faces;
 
	geometry.verticesNeedUpdate = true;

	var material = new THREE.MeshPhongMaterial({
		color: myColor,
		shininess: g_specular,
		side: THREE.DoubleSide
	});

	var mesh = new THREE.Mesh( geometry, material );
	mesh.name = "FermatSurface"+k1+k2;

	mesh.wireframeVertices = wireframeVertices;

    return mesh;
}

// return a THREE.Vector4 representing a point in given Fermat Surface
function calcFermatSurfacePoint(theta, xi, n, k1, k2) {
    var scale = 1;

    r = Math.pow(Math.cos(theta), 2) * Math.pow(Math.cosh(xi), 2) + Math.pow(Math.sin(theta), 2) * Math.pow(Math.sinh(xi),2);
    phi = Math.atan2(Math.sin(theta) * Math.sinh(xi), Math.cos(theta) * Math.cosh(xi));
    z1Re = Math.pow(r, 1/n) * Math.cos((2*(phi + k1 * Math.PI)) / n);

    r = Math.pow(Math.cos(theta), 2) * Math.pow(Math.cosh(xi), 2) + Math.pow(Math.sin(theta), 2) * Math.pow(Math.sinh(xi), 2);
    phi = Math.atan2(Math.sin(theta) * Math.sinh(xi), Math.cos(theta) * Math.cosh(xi));
    z1Im = Math.pow(r, 1/n) * Math.sin((2*(phi + k1*Math.PI))/n);

    r = Math.pow(Math.cosh(xi), 2) * Math.pow(Math.sin(theta), 2) + Math.pow(Math.cos(theta), 2) * Math.pow(Math.sinh(xi), 2);
    phi = Math.atan2(-(Math.cos(theta) * Math.sinh(xi)), Math.cosh(xi) * Math.sin(theta));
    z2Re = Math.pow(r,1/n) * Math.cos((2*(phi + k2*Math.PI))/n);

    r = Math.pow(Math.cosh(xi), 2) * Math.pow(Math.sin(theta), 2) + Math.pow(Math.cos(theta), 2) * Math.pow(Math.sinh(xi), 2);
    phi = Math.atan2(-(Math.cos(theta) * Math.sinh(xi)), Math.cosh(xi) * Math.sin(theta));
    z2Im = Math.pow(r,1/n) * Math.sin((2*(phi + k2*Math.PI))/n);

    return new THREE.Vector4(z1Re * scale, z1Im * scale, z2Re * scale, z2Im * scale);
}

// Cube

function addCubeTo( group ) {
	var cube = makeCube();
	addMeshTo( group, cube );
}

// return a mesh representing a cube
function makeCube() {
	var geometry = new THREE.Geometry();
    geometry.vertices = [
		new THREE.Vector3(0.5, 0.5, 0.5),    // 0
        new THREE.Vector3(-0.5, -0.5, 0.5),  // 1
        new THREE.Vector3(0.5, -0.5, 0.5),   // 2
        new THREE.Vector3(-0.5, 0.5, 0.5),   // 3
        new THREE.Vector3(0.5, 0.5, -0.5),   // 4
        new THREE.Vector3(-0.5, 0.5, -0.5),  // 5
        new THREE.Vector3(0.5, -0.5, -0.5),  // 6
        new THREE.Vector3(-0.5, -0.5, -0.5)  // 7
    ];
    geometry.faces = [
    	new THREE.Face3( 0, 1, 2 ),
    	new THREE.Face3( 1, 0, 3 ),
    	
    	new THREE.Face3( 3, 4, 5 ),
    	new THREE.Face3( 0, 4, 3 ),
    	
    	new THREE.Face3( 5, 4, 7 ),
    	new THREE.Face3( 7, 4, 6 ),

    	new THREE.Face3( 6, 2, 7 ),
    	new THREE.Face3( 7, 2, 1 ),

    	new THREE.Face3( 4, 0, 2 ),
    	new THREE.Face3( 4, 2, 6 ),

    	new THREE.Face3( 1, 3, 5 ),
    	new THREE.Face3( 1, 5, 7 )
    ];

    var material = new THREE.MeshPhongMaterial( {
	    color: 0xffffff
	    //vertexColors: THREE.VertexColors
	} );

    var cube = new THREE.Mesh( geometry, material );
    cube.name = "cube";

    return cube;
}

// Torus

function addTorus4DTo( group, n, isTwoSided ) {
    var torusFront = makeTorus4D( n, true );

    if (isTwoSided) {
	   	var torusBack = makeTorus4D( n, false );
	   	addMeshTo( group, torusBack );
   	}
   	addMeshTo( group, torusFront );
}

// return a mesh representing a 4D torus
// isFront == true -> green front faces, isFront == false -> cyan back faces
function makeTorus4D( n, isFront ) {
    var R=0.5
    var step=(2*Math.PI)/n;
    var vertices4D = Array();
    var faces = Array();

    var p=0;
    for (var u=0; u<(2*Math.PI); u+=step) {
        for (var v=0; v<2*Math.PI; v+=step) {
            vertices4D.push(new THREE.Vector4(R*Math.cos(u),R*Math.sin(u),R*Math.cos(v),R*Math.sin(v)));
        }
    }

    var wireframeVertices = [];

    // front faces    
    var i=0;
    for (; i<vertices4D.length-n; i+=1) {
		var face0 = new THREE.Face3( i, i+n, i+1 );
    	if ((i+1)%n==0) var face1 = new THREE.Face3( i, i+1, i+1-n );
		else var face1 = new THREE.Face3( i+1, i+n, i+n+1 );
    	faces.push(face0, face1);

    	wireframeVertices.push( 
    		vertices4D[ face0.a ], vertices4D[ face0.b ],
    		vertices4D[ face0.a ], vertices4D[ face0.c ]
    		);
    }
    // connect the ending vertices to the beginning
    var l = vertices4D.length;
    for (; i<vertices4D.length; i+=1) {
		var face0 = new THREE.Face3( i, (i+n)%l, (i+1)%l );
    	if ((i+1)%n==0) var face1 = new THREE.Face3( i, (i+1)%l, (i+1-n)%l );
		else var face1 = new THREE.Face3( (i+1)%l, (i+n)%l, (i+n+1)%l );
    	faces.push(face0, face1);

	    wireframeVertices.push( 
			vertices4D[ face0.a ], vertices4D[ face0.b ],
			vertices4D[ face0.a ], vertices4D[ face0.c ]
			);
    }

    //
    // make the actual geometry 
    //
    var geometry = new THREE.Geometry();
    geometry.vertices4D = vertices4D;
	geometry.vertices = from4Dto3D(vertices4D, g_modelMatrix4D.m.elements);
	geometry.faces = faces;

	geometry.verticesNeedUpdate = true;

	var materialFront = new THREE.MeshPhongMaterial({
		color: 0x00cc00,
		shininess: g_specular,
        side: THREE.FrontSide
	});
    var materialBack = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        shininess: g_specular,
        side: THREE.BackSide
    });

    var material = materialFront;
    if ( !isFront ) material = materialBack;

	var mesh = new THREE.Mesh( geometry, material );
	mesh.name = "torus";

	mesh.wireframeVertices = wireframeVertices;

    return mesh;
}

