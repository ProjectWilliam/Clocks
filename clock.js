// Name:William Guerrero
// Due: 12/06/2015
// clock.js


var canvas;
var gl;
var program;

var cBuffer, secBuffer;
var modelView, projection;
var mvMatrix, pMatrix;

//Variables for textures
var tex_flag = 0;
var tex_flag_loc;
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var texture = [ ];
var image = [ ];

//Variables for Alarm functions
var alarm_hour;
var alarm_min;

/*these are restated multiple times in code,
 *this is needed to constantly update the
 *values. Will not work without it*/
var currenttime = new Date();
var hours = currenttime.getHours();
var minutes = currenttime.getMinutes();


//Variables for movement
var zoom = 300;
var transX;
var transY;
var transZ;
var z_pos = -100;
var x_pos = 0.0;
var y_pos = 0.0;

//Variables for clock modes
var stop = true;
var realtime = true;

//Variables for points and colors
var points = [];
var colors = [];
var vertices = [
    vec3( -.50,  -.50,  .25 ),
    vec3( -.50,  .50,  .25 ),
    vec3(  .50,  .50,  .25 ),
    vec3(  .50, -.50,  .25),
    vec3( -.50, -.50, -.25 ),
    vec3( -.50,  .50, -.25 ),
    vec3(  .50,  .50, -.25 ),
    vec3(  .50, -.50, -.25 )
];
var black = [0.0, 0.0, 0.0, 1.0];
var red = [1.0, 0.0, 0.0, 1.0];

//Variables for rotations
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 2;
var theta = [ 0, 0, 90];
var theta2 = [ 0, 0, 90];
var theta3 = [ 0, 0, 90];
var theta4 = [ 0, 0, 90];
var thetaLoc;
var k = 0;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    drawScene(); //Draws the scene
    
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //initialize the textures
    initializeTexture(image, "ClockFace.png", 0);
    initializeTexture(image, "Wood.jpeg", 1);
            
    thetaLoc = gl.getUniformLocation(program, "theta");
    tex_flag_loc = gl.getUniformLocation(program, "textureFlag")
    
    //do not need music until alarm goes off
    disableAutoplay();
    
    render();
    
    //event listeners for buttons
    
    //stops rotation
    document.getElementById( "stopButton").onclick = function(event) {
        stop = !stop;       
    };
    //Zoom In on Button Press
    document.getElementById("zoomIn").onclick = function(event) {
        z_pos = z_pos + 10;
    };
    //Zoom Out on Button Press
    document.getElementById("zoomOut").onclick = function(event) {
        z_pos = z_pos - 10;
    };
    
    //Set the Alarm
    document.getElementById("set_alarm" ).onclick = function(event) {
        //Gets Hour Value
        var selector_hour = document.getElementById('Hour_Controls');
        var value_hour = selector_hour[selector_hour.selectedIndex].value;
        alarm_hour = Number(value_hour);
        //Get Minute Value
        var selector_min = document.getElementById('Min_Controls');
        var value_min = selector_min[selector_min.selectedIndex].value;
        alarm_min = Number(value_min);
    };
    //Silences music, resets clock face
    document.getElementById("turn_off" ).onclick = function(event) {
        disableAutoplay();
        alarm_hour = 0;
        theta4[axis] = 90;
    };
    //Switch between real clock and free movement
    document.getElementById("clock_mode").onclick = function(event) {
        seconds = currenttime.getSeconds();
        hours = currenttime.getHours();
        minutes = currenttime.getMinutes();
        if (hours > 12) {
            hours = hours - 12;
        }
        switch(hours) {
            case 1:
                theta2[axis] = 60;
                break;
            case 2:
                theta2[axis] = 30;
                break;
            case 3:
                theta2[axis] = 0;
                break;
            case 4:
                theta2[axis] = 330;
                break;
            case 5:
                theta2[axis] = 300;
                break;
            case 6:
                theta2[axis] = 270;
                break;
            case 7:
                theta2[axis] = 240;
                break;
            case 8:
                theta2[axis] = 210;
                break;
            case 9:
                theta2[axis] = 180;
                break;
            case 10:
                theta2[axis] = 150;
                break;
            case 11:
                theta2[axis] = 120;
                break;
            case 12:
                theta2[axis] = 90;
                break;
        }
        switch (minutes){
            case 0:
                theta[axis] = 90;
                break;
            case 1:
                theta[axis] = 84;
                break;
            case 2:
                theta[axis] = 78;
                break;
            case 3:
                theta[axis] = 72;
                break;
            case 4:
                theta[axis] = 66;
                break;
            case 5:
                theta[axis] = 60;
                break;
            case 6:
                theta[axis] = 54;
                break;
            case 7:
                theta[axis] = 48;
                break;
            case 8:
                theta[axis] = 42;
                break;
            case 9:
                theta[axis] = 36;
                break;
            case 10:
                theta[axis] = 30;
                break;
            case 11:
                theta[axis] = 24;
                break;
            case 12:
                theta[axis] = 18;
                break;
            case 13:
                theta[axis] = 12;
                break;
            case 14:
                theta[axis] = 6;
                break;
            case 15:
                theta[axis] = 0;
                break;
            case 16:
                theta[axis] = 354;
                break;
            case 17:
                theta[axis] = 348;
                break;
            case 18:
                theta[axis] = 342;
                break;
            case 19:
                theta[axis] = 336;
                break;
            case 20:
                theta[axis] = 330;
                break;
            case 21:
                theta[axis] = 324;
                break;
            case 22:
                theta[axis] = 318;
                break;
            case 23:
                theta[axis] = 312;
                break;
            case 24:
                theta[axis] = 306;
                break;
            case 25:
                theta[axis] = 300;
                break;
            case 26:
                theta[axis] = 294;
                break;
            case 27:
                theta[axis] = 288;
                break;
            case 28:
                theta[axis] = 282;
                break;
            case 29:
                theta[axis] = 276;
                break;
            case 30:
                theta[axis] = 270;
                break;
            case 31:
                theta[axis] = 264;
                break;
            case 32:
                theta[axis] = 258;
                break;
            case 33:
                theta[axis] = 252;
                break;
            case 34:
                theta[axis] = 246;
                break;
            case 35:
                theta[axis] = 240;
                break;
            case 36:
                theta[axis] = 234;
                break;
            case 37:
                theta[axis] = 228;
                break;
            case 38:
                theta[axis] = 222;
                break;
            case 39:
                theta[axis] = 216;
                break;
            case 40:
                theta[axis] = 210;
                break;
            case 41:
                theta[axis] = 204;
                break;
            case 42:
                theta[axis] = 198;
                break;
            case 43:
                theta[axis] = 192;
                break;
            case 44:
                theta[axis] = 186;
                break;
            case 45:
                theta[axis] = 180;
                break;
            case 46:
                theta[axis] = 174;
                break;
            case 47:
                theta[axis] = 168;
                break;
            case 48:
                theta[axis] = 162;
                break;
            case 49:
                theta[axis] = 156;
                break;
            case 50:
                theta[axis] = 150;
                break;
            case 51:
                theta[axis] = 144;
                break;
            case 52:
                theta[axis] = 138;
                break;
            case 53:
                theta[axis] = 132;
                break;
            case 54:
                theta[axis] = 126;
                break;
            case 55:
                theta[axis] = 120;
                break;
            case 56:
                theta[axis] = 114;
                break;
            case 57:
                theta[axis] = 108;
                break;
            case 58:
                theta[axis] = 102;
                break;
            case 59:
                theta[axis] = 96;
                break;
        }
        theta3[axis] = 90;
        realtime = !realtime;
        stop = !stop;
    };
}

//enable and disable Autoplay starts and stops the
//music that is in the HTML file
function enableAutoplay() { 
    document.getElementById("alarm").autoplay = true;
    document.getElementById("alarm").load();
}
function disableAutoplay() { 
    document.getElementById("alarm").autoplay = false;
    document.getElementById("alarm").load();
}

//draws a cube
function drawScene(){
    
    quad( vertices[1], vertices[0], vertices[3], vertices[2], black );
    quad( vertices[2], vertices[3], vertices[7], vertices[6], black );
    quad( vertices[4], vertices[5], vertices[6], vertices[7], black );
    quad( vertices[5], vertices[4], vertices[0], vertices[1], black );
    quad( vertices[1], vertices[2], vertices[6], vertices[5], black );
    quad( vertices[0], vertices[4], vertices[7], vertices[3], black );
}
function quad(a, b, c, d, color){
    var indices = [ a, b, c, a, c, d ];
    var indices2 = [0, 1, 2, 0, 2, 3];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( indices[i] );
        colors.push(color);
        texCoordsArray.push(texCoord[indices2[i]]);   
    }
}

function render()
{
    //Constantly updates real time
    currenttime = new Date();
    hours = currenttime.getHours();
    minutes = currenttime.getMinutes();
    //Check if alarm values have been matched
    if ((hours == alarm_hour)&&(minutes == alarm_min)){
        document.getElementById("alarm").autoplay = true;
        theta4[axis] += 4;
    }
    //Perspective Projection
    pMatrix = perspective(45, 1.0, 1.0, 500.0);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    //Two theta speeds for actual time, and free movement
    if (!realtime) {
        theta3[axis] += -.1;
        theta[axis] += -0.0025;
        theta2[axis] += -0.00002;
    }else if (!stop) {
        theta3[axis] += -4.0;
        theta[axis] += -2.0;
        theta2[axis] += -1.0;
        theta4[axis] += 0.0;
    }
    
    //draws textured clock face and wood background
    background(theta4, 1);
    
    //draw Minute Hand
    var k = 0.0;
    for (var i = 0; i <=8; i++) {
        gear(k, y_pos, z_pos, theta, 2, 0);
        k = k + 2.5;
    }
    //draw Second Hand
    var k = .07;
    for (var i = 0; i <=15; i++) {
        gear(k, y_pos, z_pos, theta3, 1, 0);
        k = k + 1.3;
    }
    // draw Hour Hand
    var k = .1
    for (var i = 0; i <= 4; i++) {
        gear(k, y_pos, z_pos, theta2, 2, 0);
        k = k + 2.5;
    }   
    requestAnimFrame( render );

}

/*
 *Gear Function takes 6 parameters, the first three are the location,
 *the fourth is the value to increase theta by, the fifth is the
 *size to scale each gear, and is_tex is passed to the fragment
 *shader to show that no texture mapping is needed
 */
function gear(transX, transY, transZ, thetaVal, size, is_tex) {
    gl.uniform1i(tex_flag_loc, is_tex);
    gl.uniform3fv(thetaLoc, thetaVal);
    for(var i = 0; i <= 3; i++){
        mvMatrix = mat4( );
        mvMatrix = mult(mvMatrix, translate(transX, transY, transZ));
        mvMatrix = mult(mvMatrix, scalem(size, size, size));
        mvMatrix = mult(mvMatrix, rotate(k, 0.0, 0.0, 1.0)); 
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
        gl.drawArrays( gl.TRIANGLES, 0, 6 ); 
        k = k + 30;
    } 
}

/*
 *Background function takes two parameters, the first
 *gives the value to increase theta by, and is_tex is passed
 *to the fragment shader to show that texture mapping is needed 
 */
function background(thetaVal, is_tex) {
    
    //Draws the clock face
    gl.uniform3fv(thetaLoc, thetaVal);
    gl.bindTexture( gl.TEXTURE_2D, texture[0] );
    gl.uniform1i(tex_flag_loc, is_tex);
    
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, z_pos+10));
    mvMatrix = mult(mvMatrix, scalem(50.0, 50.0, 50.0));
    mvMatrix = mult(mvMatrix, rotate(180, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, 6);
    
    
    //Draws the wood background
    gl.uniform3fv(thetaLoc, thetaVal);
    gl.bindTexture( gl.TEXTURE_2D, texture[1] );
    gl.uniform1i(tex_flag_loc, is_tex);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -499));
    mvMatrix = mult(mvMatrix, scalem(500.0, 500.0, 500.0));
    mvMatrix = mult(mvMatrix, rotate(180, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    gl.drawArrays( gl.TRIANGLES, 6, 12);
}

//Functions to initalize and configure textures

function configureTexture( image, id ) {
    texture[id] = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture[id] );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function initializeTexture(myImage, fileName, id) {
    myImage[id] = new Image();
    myImage[id].onload = function() { 
        configureTexture( myImage[id], id );
    }
    myImage[id].src = fileName;
}



