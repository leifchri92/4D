//-----------------------------------------------------
// Global Variables
//-----------------------------------------------------

var gl;
var g_canvas;
var g_program;

var g_uModelMatrix;
var g_uViewMatrix;
var g_uProjectionMatrix;
var g_uCameraPosition;
var g_uLightPosition;
var g_uIsLit;

var g_RotationMatrix = mat4();
var g_ViewMatrix = mat4();
var g_ProjectionMatrix = mat4();

var g_CameraPosition = vec3(0,0,3.5);
var g_LightPosition = vec3(-1,-1,1);

// Projection Parameters
var g_fov = 60.0;
var g_aspect = 1.0;
var g_near = 0.3;
var g_far = 30.0;

var g_mouseDownFlag = false;
var g_mouseButton = 0;
var g_xMousePrev;
var g_yMousePrev;
var g_dX;
var g_dY;
var g_altFlag = false;

var g_optionIsDown = false;

var g_q = vec4(1,0,0,0);
var g_R3 = computeQuaternionMatrix(g_q);

var g_axes = makeAxes(g_R3,g_q);
var g_cube = makeCube();
var g_axesModel = g_axes;
var g_histogramModel = makeHistorgram(g_q);
var g_trailModel = new Model([], [], []);
var g_worldAxesModel = makeWorldAxes();

var g_quaternionIndex; // store the beginning of the quaternion in the g_axesModel
var g_trailLength = 200;

var g_angleScale = 80; // scalar used to speed/slow rotation
var g_doQuatTestA = true;

var g_doRenderAxes = true;
var g_doRenderTrail = true;
var g_doRenderWorldAxes = false;

var g_trailSlider;
var g_rotationSlider;

function isMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

//-----------------------------------------------------------
// Model Object
//-----------------------------------------------------------
function Model(vertices, normals, colors) {
    this.vertices = vertices;
    this.normals = normals;
    this.colors = colors;
}

Model.prototype.generateBuffers = function() {
    this.vBuffer = gl.createBuffer();
    this.nBuffer = gl.createBuffer();
    this.cBuffer = gl.createBuffer();
}

Model.prototype.fillBuffers = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.DYNAMIC_DRAW);
}

function canvasResize() {
    g_canvas.width = document.getElementById("canvas-container").offsetWidth-20;
    g_canvas.height = document.getElementById("canvas-container").offsetWidth-20;

    g_aspect = g_canvas.width/g_canvas.height;
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

function resetButton() {
    // reset scene
    g_q = vec4(1,0,0,0);
    g_R3 = computeQuaternionMatrix(g_q);

    updateAxes(g_R3, g_q);            

    g_RotationMatrix = mat4();

    render();
}

function trailButton() {
    g_doRenderTrail = !g_doRenderTrail;

    // clear trail
    g_trailModel.vertices = [];
    g_trailModel.normals = [];
    g_trailModel.colors = [];

    if (!g_doRenderTrail) {
        document.getElementById("trail").style.backgroundColor = "rgba(215, 215, 215, 0.4)";
        document.getElementById("trail").style.color = "black";
        document.getElementById("trail").innerHTML = "Trail OFF";
    }
    else {
        document.getElementById("trail").style.backgroundColor = "rgba(44, 135, 240, 1.0)";
        document.getElementById("trail").style.color = "white";
        document.getElementById("trail").innerHTML = "Trail ON";
    }

    render();
}

function zAxisButton() {
    g_altFlag = !g_altFlag;

    if (!g_altFlag) {
        document.getElementById("z-axis").style.backgroundColor = "rgba(215, 215, 215, 0.4)";
        document.getElementById("z-axis").style.color = "black";
        document.getElementById("z-axis").innerHTML = "Z-Axis OFF";
    }
    else {
        document.getElementById("z-axis").style.backgroundColor = "rgba(44, 135, 240, 1.0)";
        document.getElementById("z-axis").style.color = "white";
        document.getElementById("z-axis").innerHTML = "Z-Axis ON";
    }

    console.log(g_altFlag)
}

function plusSpeedButton() {
    g_angleScale += 2;
    //g_debuglabel.innerHTML = g_angleScale;
}

function minusSpeedButton() {
    g_angleScale -= 2;
    //g_debuglabel.innerHTML = g_angleScale;
}

function trailSlider() {
    g_trailLength = g_trailSlider.value;
}

function rotationSlider() {
    g_angleScale = g_rotationSlider.value;
}

//-----------------------------------------------------------
// Main Program
//-----------------------------------------------------------
window.onload = function main() {
    document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;


    if (isMobile()) {
        g_trailSlider = document.getElementById("trail-slider-mobile");
        g_rotationSlider = document.getElementById("rotation-slider-mobile");

        document.getElementById("mobile-controls").style.display = "block";
        document.getElementById("canvas-container").classList.add("col-xs-12");
        document.getElementById("reset").onclick = resetButton;
        document.getElementById("trail").onclick = trailButton;
        document.getElementById("z-axis").onclick = zAxisButton;
        //document.getElementById("plus-speed").onclick = plusSpeedButton;
        //document.getElementById("minus-speed").onclick = minusSpeedButton;
    } else {
        g_trailSlider = document.getElementById("trail-slider");
        g_rotationSlider = document.getElementById("rotation-slider");

        document.getElementById("desktop-controls").style.display = "block";
        document.getElementById("canvas-container").classList.add("col-xs-8")
    }

    g_trailSlider.value = g_trailLength;
    g_rotationSlider.value = g_angleScale;
    g_trailSlider.onchange = trailSlider;
    g_rotationSlider.onchange = rotationSlider;

    g_debuglabel = document.getElementById("debug-label");

    g_canvas = document.getElementById("gl-canvas");

    g_aspect = g_canvas.width/g_canvas.height;

    g_canvas.onmousedown = handleMouseDown;
    g_canvas.onmouseup = handleMouseUp;
    g_canvas.onmousemove = handleMouseMotion;
    g_canvas.ontouchstart = handleTouchStart;
    g_canvas.ontouchend = handleTouchEnd;
    g_canvas.ontouchmove = handleTouchMotion;
    // canvas.onwheel = handleMouseWheel;
    g_canvas.oncontextmenu = function(ev) { return false };

    document.onkeydown = handleKeyDown;

    gl = WebGLUtils.setupWebGL(g_canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, g_canvas.width, g_canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    canvasResize();

    //  Load shaders and initialize attribute buffers

    g_program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(g_program);

    gl.enable(gl.DEPTH_TEST);

    g_axesModel.generateBuffers();
    g_histogramModel.generateBuffers();
    g_trailModel.generateBuffers();
    g_worldAxesModel.generateBuffers();

    // Get pointer to attribute variables in shaders 
    g_program.aPosition = gl.getAttribLocation(g_program, "aPosition");
    g_program.aNormal = gl.getAttribLocation(g_program, "aNormal");
    g_program.aColor = gl.getAttribLocation(g_program, "aColor");
   
    // Get pointer to uniform variables in shaders
    g_uModelMatrix = gl.getUniformLocation(g_program, "uModelMatrix");
    g_uViewMatrix = gl.getUniformLocation(g_program, "uViewMatrix");
    g_uProjectionMatrix = gl.getUniformLocation(g_program, "uProjectionMatrix");
    g_uCameraPosition = gl.getUniformLocation(g_program, "uCameraPosition");
    g_uLightPosition = gl.getUniformLocation(g_program, "uLightPosition");
    g_uIsLit = gl.getUniformLocation(g_program, "uIsLit");


    g_ViewMatrix = translate(-1*g_CameraPosition[0],-1*g_CameraPosition[1],-1*g_CameraPosition[2]);
    g_ProjectionMatrix = perspective( g_fov, g_aspect, g_near, g_far );


    render();
};

//-------------------------------------------------------------
// Drawing
//-------------------------------------------------------------

function render() {
    gl.viewport(0, 0, g_canvas.width, g_canvas.height);

    g_ViewMatrix = translate(-1*g_CameraPosition[0],-1*g_CameraPosition[1],-1*g_CameraPosition[2]);
    g_ProjectionMatrix = perspective( g_fov, g_aspect, g_near, g_far );


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3f(g_uCameraPosition, g_CameraPosition[0], g_CameraPosition[1], g_CameraPosition[2]);
    gl.uniform3f(g_uLightPosition, g_LightPosition[0], g_LightPosition[1], g_LightPosition[2]);

    //
    // render the axes
    //
	gl.uniformMatrix4fv(g_uModelMatrix, false, flatten(g_RotationMatrix));
    gl.uniformMatrix4fv(g_uViewMatrix, false, flatten(g_ViewMatrix));
    gl.uniformMatrix4fv(g_uProjectionMatrix, false, flatten(g_ProjectionMatrix));

    gl.uniform1i(g_uIsLit, 1);

    g_axesModel.fillBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_axesModel.vBuffer);
    gl.vertexAttribPointer(g_program.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_axesModel.nBuffer);
    gl.vertexAttribPointer(g_program.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_axesModel.cBuffer);
    gl.vertexAttribPointer(g_program.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aColor);

    if (g_doRenderAxes)
        gl.drawArrays(gl.TRIANGLES, 0, g_axesModel.vertices.length);
    else 
        gl.drawArrays(gl.TRIANGLES, g_quaternionIndex, g_axesModel.vertices.length-g_quaternionIndex);

    //
    // render the trail
    //
    gl.uniform1i(g_uIsLit, 0);

    g_trailModel.fillBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_trailModel.vBuffer);
    gl.vertexAttribPointer(g_program.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_trailModel.nBuffer);
    gl.vertexAttribPointer(g_program.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_trailModel.cBuffer);
    gl.vertexAttribPointer(g_program.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aColor);

    if (g_trailModel.vertices.length > 0 && g_doRenderTrail)
        gl.drawArrays(gl.POINTS, 0, g_trailModel.vertices.length);

    //
    // render the world axes
    //

    gl.uniform1i(g_uIsLit, 0);

    g_worldAxesModel.fillBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_worldAxesModel.vBuffer);
    gl.vertexAttribPointer(g_program.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_worldAxesModel.nBuffer);
    gl.vertexAttribPointer(g_program.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_worldAxesModel.cBuffer);
    gl.vertexAttribPointer(g_program.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aColor);

    if (g_doRenderWorldAxes)
        gl.drawArrays(gl.LINES, 0, g_worldAxesModel.vertices.length);

    //
    // Render the historgram
    //
    gl.uniformMatrix4fv(g_uModelMatrix, false, flatten(mat4()));
    gl.uniformMatrix4fv(g_uViewMatrix, false, flatten(mat4()));
    gl.uniformMatrix4fv(g_uProjectionMatrix, false, flatten(mat4()));

    gl.uniform1i(g_uIsLit, 0);

    g_histogramModel.fillBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_histogramModel.vBuffer);
    gl.vertexAttribPointer(g_program.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_histogramModel.nBuffer);
    gl.vertexAttribPointer(g_program.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_histogramModel.cBuffer);
    gl.vertexAttribPointer(g_program.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(g_program.aColor);

    gl.drawArrays(gl.TRIANGLES, 0, g_histogramModel.vertices.length);

}

//-------------------------------------------------------------
// Computation
//-------------------------------------------------------------

function rollBall (pDeltaX, pDeltaY) {
    // returns new rotation matrix for object
    //console.log("function rollBall BEGIN")
    var rotationAngle = 0;  
    var rotationAxis = vec3(0.0, 0.0, 1.0);
    var angleScale = (g_angleScale/10) * (5000/g_canvas.offsetWidth); // magic number to change speed
    // console.log(angleScale)
    var rotateR = Math.sqrt(pDeltaX*pDeltaX + pDeltaY*pDeltaY);
    
    // pObjRotMat is an input matrix, it's the object rotation matrix
    // pObjCoord are the XYZ offset of coordinates of the object

    // only rotate when there is some angle:
    if (rotateR > 0.0001) {
        rotationAngle = (rotateR * angleScale );
        rotationAxis[0] = -pDeltaY/rotateR;
        rotationAxis[1] =  pDeltaX/rotateR;
        rotationAxis[2] = 0.0;
        
        return rotate(rotationAngle, rotationAxis);
        
    } else {
        // return identity if no rotation:
        return mat4();
    }
    //console.log("function b481_GL_rollBall END")
}

function computeQuaternionFixed(q, axis, theta) {
    var p = vec4(Math.cos(theta/2), 
            Math.sin(theta/2)*axis[0], 
            Math.sin(theta/2)*axis[1], 
            Math.sin(theta/2)*axis[2])
        p = normalize(p, true);

        var qPrime;
        if (g_doQuatTestA) {
        qPrime = [
            p[0]*q[0] - p[1]*q[1] - p[2]*q[2] - p[3]*q[3],
            p[1]*q[0] + p[0]*q[1] - p[3]*q[2] + p[2]*q[3],
            p[2]*q[0] + p[3]*q[1] + p[0]*q[2] - p[1]*q[3],
            p[3]*q[0] - p[2]*q[1] + p[1]*q[2] + p[0]*q[3]
        ];
        } else {
            qPrime = [
                p[0]*q[0] - p[1]*q[1] - p[2]*q[2] - p[3]*q[3],
                p[0]*q[1] + p[1]*q[0] + p[2]*q[3] - p[3]*q[2],
                p[0]*q[2] + p[2]*q[0] + p[3]*q[1] - p[1]*q[3],
                p[0]*q[3] + p[0]*q[0] + p[1]*q[2] - p[2]*q[1]
            ];
        }
        qPrime = normalize(qPrime,false);

        return qPrime;
}

function computeQuaternion(q, pDeltaX, pDeltaY) {
    var theta = 0;  
    var nhat = vec3(0.0, 0.0, 1.0);
    var angleScale = (g_angleScale/10) * (75/g_canvas.offsetWidth); // magic number to change speed
    // console.log(angleScale)
    var dr = Math.sqrt(pDeltaX*pDeltaX + pDeltaY*pDeltaY);
    
    // pObjRotMat is an input matrix, it's the object rotation matrix
    // pObjCoord are the XYZ offset of coordinates of the object

    // only rotate when there is some angle:
    if (dr > 0.0001) {
        theta = ( dr * angleScale );
        // console.log(theta)
        nhat[0] = -pDeltaY/dr;
        nhat[1] =  pDeltaX/dr;
        nhat[2] = 0.0;
        nhat = normalize(nhat);

        var qPrime = computeQuaternionFixed(q, nhat, theta);
        return qPrime;

    } else {
        // return original q if no rotation:
        return q;
    }
    //console.log("function b481_GL_rollBall END")
}

function computeQuaternionMatrix(q) {
    var R3 = mat3(
        // x
        q[0]*q[0] + q[1]*q[1] - q[2]*q[2] - q[3]*q[3], 
        2*q[1]*q[2] + 2*q[0]*q[3],  
        -2*q[0]*q[2] + 2*q[1]*q[3],
        // y
        2*q[1]*q[2] - 2*q[0]*q[3],  
        q[0]*q[0] - q[1]*q[1] + q[2]*q[2] - q[3]*q[3], 
        2*q[0]*q[1] + 2*q[2]*q[3],
        // z
        2*q[0]*q[2] + 2*q[1]*q[3],  
        -2*q[0]*q[1] + 2*q[2]*q[3], 
        q[0]*q[0] - q[1]*q[1] - q[2]*q[2] + q[3]*q[3]
    );

    return R3;
}

//-------------------------------------------------------------
// Event Handlers
//-------------------------------------------------------------

// x and y normalized to [-1,1]
function handleInputDown(x, y) {
  
  g_mouseDownFlag = true;
  g_xMousePrev = x;
  g_yMousePrev = y;
  g_xMouseCurrent = x;
  g_yMouseCurrent = y;
  g_dX = 0;
  g_dY = 0;

  render();
}

function handleInputMotion(x, y) {
    if (g_mouseDownFlag == true) {
        g_xMouseCurrent = x;
        g_yMouseCurrent = y;
        g_dX = g_xMouseCurrent - g_xMousePrev;
        g_dY = g_yMouseCurrent - g_yMousePrev;

        g_xMousePrev = g_xMouseCurrent;
        g_yMousePrev = g_yMouseCurrent;

        var deltaX = g_dX;
        var deltaY = g_dY;

        if (g_mouseButton == 0) {
            if (g_altFlag) {
                g_q = computeQuaternionFixed(g_q, vec3(0,0,1), (-deltaX*(g_angleScale/80) * (425/g_canvas.offsetWidth))); 
            } else {
                g_q = computeQuaternion(g_q, deltaX, deltaY);
            }
            g_R3 = computeQuaternionMatrix(g_q);

            updateAxes(g_R3, g_q);            

            updateTrail(g_q);
        } 
        else if (g_mouseButton == 2) {
            var lRotMat = rollBall(deltaX, deltaY);
            g_RotationMatrix = mult(lRotMat, g_RotationMatrix);
        }
    }
    render();
}

function handleInputUp(x, y) {
    g_mouseDownFlag = false;
    g_mouseButton = 0;
    g_xMousePrev = -1;
    g_yMousePrev = -1;
    g_xMouseCurrent = -1;
    g_yMouseCurrent = -1;
    g_dX = 0;
    g_dY = 0;

    render(); 
}

//-------------------------------------------------------------
// Touch events in the canvas

function handleTouchStart(ev) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
    y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2);

    handleInputDown(x, y); 
    //g_debuglabel.innerHTML = "Touch Start: " + x;
}

function handleTouchMotion(ev) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
    y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2);

    if (ev.touches.length == 2) {
        g_mouseButton = 2;
    }

    handleInputMotion(x, y, false); 
    //g_debuglabel.innerHTML = "Touch move: " + x;
}

function handleTouchEnd(ev) {
    ev.preventDefault();
    var x = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
    y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2);

    handleInputUp(x, y); 
    //g_debuglabel.innerHTML = "Touch end: " + x;
}

//-------------------------------------------------------------
// Mouse events in the canvas

function handleMouseDown(ev) {

  g_mouseButton = ev.button;

  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
  y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2);


  handleInputDown(x, y); 
}

function handleMouseUp(ev) {
  //console.log("function handleMouseUp BEGIN")

  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  
  x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
  y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2);

  g_altFlag = false;

  handleInputUp(x,y);
}

function handleMouseMotion(ev) {
    if (g_mouseDownFlag == true) {
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - g_canvas.height/2)/(g_canvas.height/2);
        y = (g_canvas.width/2 - (y - rect.top))/(g_canvas.width/2); 

        if (ev.altKey) {
            g_altFlag = true;
        }

        handleInputMotion(x, y);   
    }
}

function handleKeyDown(ev) {
    if (ev.key == "r") {
        // reset scene
        g_q = vec4(1,0,0,0);
        g_R3 = computeQuaternionMatrix(g_q);

        updateAxes(g_R3, g_q);            

        g_RotationMatrix = mat4();

    } else if (ev.key == "c") {
        // clear trail
        g_trailModel.vertices = [];
        g_trailModel.normals = [];
        g_trailModel.colors = [];

    } else if (ev.key == "+") {
        g_trailLength++;

    } else if (ev.key == "-") {
        g_trailLength--;

    } else if (ev.key == "t") {
        g_doRenderTrail = !g_doRenderTrail;

    } else if (ev.key == "A") {
        g_doRenderAxes = !g_doRenderAxes;

    } else if (ev.key == "a") {
        g_doRenderWorldAxes = !g_doRenderWorldAxes;

    } else if (ev.key == "i") {
        document.getElementById("quaternion").innerHTML = "Current Quaternion (w,x,y,z) : " 
        + g_q[0].toFixed(6) 
        + " " + g_q[1].toFixed(6) 
        + " " + g_q[2].toFixed(6) 
        + " " + g_q[3].toFixed(6);
    } else if (ev.key == "f") {
        if (document.fullscreenEnabled) {
            requestFullscreen(g_canvas);

            g_canvas.width = window.width;
            g_canvas.height = window.height;
            console.log(g_canvas.width, g_canvas.height)

            g_aspect = g_canvas.width/g_canvas.height;
            render();

        }    
    } else if (ev.key == "[") {
        g_angleScale -= 2;

    } else if (ev.key == "]") {
        g_angleScale += 2;

    } else if (ev.key == "~") {
        g_doQuatTestA = !g_doQuatTestA;
    } 

    render();
}

//-------------------------------------------------------------
// Models
//-------------------------------------------------------------

function makeAxes(R3,q) {
    // x-axis
    var vertices =             makeCylinder(vec3(0,0,0), R3[0], 0.05, 30);
    var n = vertices.length;
    // y-axis
    vertices = vertices.concat(makeCylinder(vec3(0,0,0), R3[1], 0.05, 30));
    // z-axis
    vertices = vertices.concat(makeCylinder(vec3(0,0,0), R3[2], 0.05, 30));
    // quaternion
    g_quaternionIndex = n*3;
    vertices = vertices.concat(makeCylinder(vec3(0,0,0), vec3(q[1],q[2],q[3]), 0.075, 40));

    var normals = calcNormals(vertices)

    var colors = [];
    for (var i=0; i<n; i++) {
        colors.push(vec3(1,0,0));
    }
    for (var i=0; i<n; i++) {
        colors.push(vec3(0,1,0));
    }
    for (var i=0; i<n; i++) {
        colors.push(vec3(0,0,1));
    }
    var quaternionColor;
    if (q[0]>0) 
        quaternionColor = vec3(1,1,0);
    else
        quaternionColor = vec3(0,1,1);
    for (var i=0; i<(vertices.length-n*3); i++) {
        colors.push(quaternionColor);
    }

    return new Model(vertices, normals, colors);

}

function updateAxes(R3, q) {
    var tempModel = makeAxes(R3,q);
    g_axesModel.vertices = tempModel.vertices;
    g_axesModel.normals = tempModel.normals;
    g_axesModel.colors = tempModel.colors;

    tempModel = makeHistorgram(q);
    g_histogramModel.vertices = tempModel.vertices;
    g_histogramModel.normals = tempModel.normals;
    g_histogramModel.colors = tempModel.colors;
}

function updateTrail(q) {
    g_trailModel.vertices.push((vec3(q[1],q[2],q[3])));
    g_trailModel.normals.push((vec3()));
    var color;
    if (q[0]>0)
        color = vec3(1,1,0);
    else
        color = vec3(0,1,1);
    g_trailModel.colors.push((color));

    while (g_trailModel.vertices.length > g_trailLength) {
        g_trailModel.vertices.shift();
        g_trailModel.normals.shift();
        g_trailModel.colors.shift();
    }
}

function makeHistorgram(q) {
    var vertices = [
        vec3(-0.8,0,0),
        vec3(-0.7,0,0),
        vec3(-0.7,q[0]*0.75,0),
        vec3(-0.7,q[0]*0.75,0),
        vec3(-0.8,q[0]*0.75,0),
        vec3(-0.8,0,0)
    ];
    var normals = vertices;
    var color;
    if (q[0]>0)
        color = vec3(1,1,0);
    else
        color = vec3(0,1,1);
    var colors = [];
    for (var i=0; i<vertices.length; i++)
        colors.push(color);

    return new Model(vertices, normals, colors);
}

function makeWorldAxes() {
    var vertices = [
        vec3(0,0,0),
        vec3(1.5,0,0),
        vec3(0,0,0),
        vec3(0,1.5,0),
        vec3(0,0,0),
        vec3(0,0,1.5)
    ];
    var normals = vertices; // fill with junk since shader requires normals
    var colors = [
        vec3(1,0,0),
        vec3(1,0,0),
        vec3(0,1,0),
        vec3(0,1,0),
        vec3(0,0,1),
        vec3(0,0,1)
    ];

    return new Model(vertices, normals, colors);
}

function makeCube() {
    var vertices = [
        //face1
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        //face2
        vec3(0.5, 0.5, -0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        //face3
        vec3(0.5, 0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(0.5, -0.5, -0.5),
        //face4
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, -0.5, -0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, -0.5, 0.5),
        //face5
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5),
        //face6    
        vec3(-0.5, 0.5, -0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5)
    ];
    var normals = calcNormals(vertices);
    var colors = [];
    var rgb = [
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(0, 0, 1),
        vec3(1, 0, 1),
        vec3(1, 1, 0),
        vec3(0, 1, 1)
    ];
    for (var i=0; i<6; i++) {
        for (var j=0; j<6; j++) {
            colors.push(rgb[i]);
        }
    }

    return new Model(vertices, normals, colors);
}

// Create and return a cylinder with endpoints p0 and p1, radius r, and with numberOfSubs subdivisions
function makeCylinder(p0, p1, r, numberOfSubs) {
    var end0 = []
    var end1 = []
    var length = distance(p1, p0)
    if (length == 0)
        return []
    var theta = 360.0/numberOfSubs

    var vector = normalize(subtract(p1, p0))
    var angle = degrees(Math.acos(dot( vec3(0,1,0), vector )))
    if (angle == 0) 
        var rotationAxis = vec3(0,1,0)
    else if (angle == 180) 
        var rotationAxis = vec3(1,0,0)
    else
        var rotationAxis = cross( vec3(0,1,0), vector )
    var rotationMatrix = rotate(angle, rotationAxis)

    var translationMatrix = translate(p0[0], p0[1], p0[2]);

    var cylinder = []
    for (var i=0; i <= numberOfSubs; i++) {
        var cos0 = r*Math.cos(radians(theta*i))
        var cos1 = r*Math.cos(radians(theta*(i+1)))
        var sin0 = r*Math.sin(radians(theta*i))
        var sin1 = r*Math.sin(radians(theta*(i+1)))

        // make triangles for sides
        cylinder.push( vec3(mult(mult(vec4(cos0, 0.0, sin0, 1)   ,rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos1, 0.0, sin1, 1)   ,rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos1, length, sin1, 1),rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos1, length, sin1, 1),rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos0, length, sin0, 1),rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos0, 0.0, sin0, 1)   ,rotationMatrix),translationMatrix)) );

        // make triangles for caps
        cylinder.push( vec3(0,0,0));
        cylinder.push( vec3(mult(mult(vec4(cos0, 0.0, sin0, 1)   ,rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos1, 0.0, sin1, 1)   ,rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(0, length, 0, 1)      ,rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos0, length, sin0, 1),rotationMatrix),translationMatrix)) );
        cylinder.push( vec3(mult(mult(vec4(cos1, length, sin1, 1),rotationMatrix),translationMatrix)) );
    }

    // cylinder = cylinder.concat(makeSphere(p0, r, 3));
    // cylinder = cylinder.concat(makeSphere(p1, r, 3));

    return cylinder
}

function divideTriangle(a, b, c, count, pointsArray) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1, pointsArray );
        divideTriangle( ab, b, bc, count - 1, pointsArray );
        divideTriangle( bc, c, ac, count - 1, pointsArray );
        divideTriangle( ab, bc, ac, count - 1, pointsArray );
    }
    else {
        pointsArray.push(vec3(a));
        pointsArray.push(vec3(b));
        pointsArray.push(vec3(c));    }
}

function tetrahedron(a, b, c, d, n, pointsArray) {
    divideTriangle(a, b, c, n, pointsArray);
    divideTriangle(d, c, b, n, pointsArray);
    divideTriangle(a, d, b, n, pointsArray);
    divideTriangle(a, c, d, n, pointsArray);
}

function makeSphere(center, r, n) {

    var sphere = [];

    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);

    tetrahedron(va,vb,vc,vd,n,sphere);

    for (var i=0; i<sphere.length; i++) {
        var v = sphere[i];
        sphere[i] = add(vec3(v[0]*r,v[1]*r,v[2]*r),center);
    }

    return sphere;
}
