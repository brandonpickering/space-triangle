
function transpose4(mat) {
    for (var i = 0; i < 4; i++) {
        for (var j = i+1; j < 4; j++) {
            var temp = mat[4*i + j];
            mat[4*i + j] = mat[4*j + i];
            mat[4*j + i] = temp;
        }
    }
}


function angleDist(angle1, angle2) {
    var d = angle2 - angle1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
}


function Vec2(x, y) {
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
}

Vec2.fromAngle = function(a) {
    return new Vec2(Math.cos(a), Math.sin(a));
}

Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
}

Vec2.prototype.getMag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
}

Vec2.prototype.getDir = function() {
    var mag = this.getMag();
    return mag == 0 ? this.clone() : this.scale(1/mag);
}

Vec2.prototype.capMag = function(cap) {
    return this.getMag() > cap ? this.getDir().scale(cap) : this.clone();
}

Vec2.prototype.scale = function(s) {
    return new Vec2(s * this.x, s * this.y);
}


function Vec3(x, y, z) {
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
    this.z = typeof z !== 'undefined' ? z : 0;
}

Vec3.prototype.clone = function() {
    return new Vec3(this.x, this.y, this.z);
}

Vec3.prototype.swizzleXY = function() {
    return new Vec2(this.x, this.y);
}

Vec3.prototype.getMag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

Vec3.prototype.getDir = function() {
    var mag = this.getMag();
    return mag == 0 ? this.clone() : this.scale(1/mag);
}

Vec3.prototype.scale = function(s) {
    return new Vec3(s * this.x, s * this.y, s * this.z);
}

Vec3.prototype.add = function(v) {
    return new Vec3(v.x + this.x, v.y + this.y, v.z + this.z);
}

Vec3.prototype.cross = function(v) {
    var result = new Vec3();
    result.x = this.y * v.z - this.z * v.y;
    result.y = this.z * v.x - this.x * v.z;
    result.z = this.x * v.y - this.y * v.x;
    return result;
}


var Input = {
    mousePos: new Vec2(0, 0),
    keysDown: [],
    buttonsDown: [],

    isKeyDown: function(k) {
        for (var i = 0; i < Input.keysDown.length; i++)
            if (Input.keysDown[i] == k)
                return true;
        return false;
    },

    isButtonDown: function(b) {
        for (var i = 0; i < Input.buttonsDown.length; i++)
            if (Input.buttonsDown[i] == b)
                return true;
        return false;
    }
};

document.onmousemove = function(e) {
    e = e || window.event;
    var rect = document.getElementById('canvas').getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    Input.mousePos = new Vec2(x, rect.height - y);
}

document.onkeydown = function(e) {
    e = e || window.event;
    var key = 'which' in e ? e.which : e.keyCode;
    for (var i = 0; i < Input.keysDown.length; i++)
        if (Input.keysDown[i] == key)
            return;
    Input.keysDown.push(key);
}

document.onkeyup = function(e) {
    e = e || window.event;
    var key = 'which' in e ? e.which : e.keyCode;
    for (var i = 0; i < Input.keysDown.length; i++)
        if (Input.keysDown[i] == key)
            Input.keysDown.splice(i--, 1);
}

document.onmousedown = function(e) {
    e = e || window.event;
    for (var i = 0; i < Input.buttonsDown.length; i++)
        if (Input.buttonsDown[i] == e.button)
            return;
    Input.buttonsDown.push(e.button);
}

document.onmouseup = function(e) {
    e = e || window.event;
    for (var i = 0; i < Input.buttonsDown.length; i++)
        if (Input.buttonsDown[i] == e.button)
            Input.buttonsDown.splice(i--, 1);
}


var gl;

function loadInlineProgram(vid, fid) {
    return loadProgram(document.getElementById(vid).innerHTML, document.getElementById(fid).innerHTML);
}

function loadProgram(vsource, fsource) {
    var vshader = loadShader(gl.VERTEX_SHADER, vsource);
    if (vshader == null) return null;
    var fshader = loadShader(gl.FRAGMENT_SHADER, fsource);
    if (fshader == null) { gl.deleteShader(vshader); return null; }

    var program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    var log = gl.getProgramInfoLog(program);
    if (log.length > 0) console.log(log);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function loadShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var log = gl.getShaderInfoLog(shader);
    if (log.length > 0) console.log(log);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
