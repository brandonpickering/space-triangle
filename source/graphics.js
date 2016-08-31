
function Graphics() {
    this.game = null;

    this.loadProgram();
    this.objBuffer = gl.createBuffer();
    this.createLineBuffers();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

Graphics.prototype.loadProgram = function() {
    this.program = loadInlineProgram('tunnel_vert', 'tunnel_frag');
    gl.useProgram(this.program);

    var n = 0.9;
    var l = -1.0*n, r = 1.0*n, b = -1.0*n, t = 1.0*n, f = -Game.farZ;
    var proj_matrix = new Float32Array([
        2*n/(r-l), 0, (r+l)/(r-l), 0,
        0, 2*n/(t-b), (t+b)/(t-b), 0,
        0, 0, -(f+n)/(f-n), -2*f*n/(f-n),
        0, 0, -1, 0
    ]);
    transpose4(proj_matrix);
    
    var proj_matrix_loc = gl.getUniformLocation(this.program, 'uProjMatrix');
    gl.uniformMatrix4fv(proj_matrix_loc, false, proj_matrix);

    var far_loc = gl.getUniformLocation(this.program, 'uFar');
    gl.uniform1f(far_loc, Game.farZ);
}

Graphics.prototype.createLineBuffers = function() {
    this.lineBuffers = [];

    var numLines = 15;
    for (var i = 0; i < numLines; i++) {
        var buffer = gl.createBuffer();
        this.lineBuffers.push(buffer);

        var a = i * 2*Math.PI / numLines;
        var p = Vec2.fromAngle(a);

        var vertices = [];
        var numSegs = 32;
        for (var j = 0; j < numSegs; j++) {
            var t = j/(numSegs-1);
            vertices.push(p.x, p.y, t);
        }
        this.numLineVertices = numSegs;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }
}

Graphics.prototype.getFlashT = function() {
    var t = this.game.getNextHitPoint() - this.game.time;
    var t0 = this.game.time - this.game.lastHitPoint;
    if (t0 < t && this.game.time > 3) t = t0;
    t = 1 - Math.min(0.25, t)/0.25;
    return t*t;
}

Graphics.prototype.drawShip = function(i, death_time) {
    death_time = typeof death_time !== 'undefined' ? death_time : 0;

    var color_loc = gl.getUniformLocation(this.program, 'uColor');
    if (this.game.hitPoints > 0) {
        var color = (i + 1)/this.game.hitPoints;
        color = this.getFlashT() * 1 + (1 - this.getFlashT()) * color;
        gl.uniform4f(color_loc, color, color, color, 1 - this.game.invincTime);
    } else {
        gl.uniform4f(color_loc, 1, 1, 1, death_time*death_time);
    }

    var pos0 = this.game.getPlayerPos();
    var pos = pos0.scale(Math.pow(0.95, i));
    var size = 0.1 * Math.pow(0.95, i);

    var vertices = [
        pos.x + pos.y * size, pos.y - pos.x * size, 0,
        pos.x - pos.y * size, pos.y + pos.x * size, 0,
        pos.x, pos.y, -size/(Game.farZ + 1)
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.objBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var pos_loc = gl.getAttribLocation(this.program, 'inPosition');
    gl.enableVertexAttribArray(pos_loc);
    gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

Graphics.prototype.drawPlayer = function(death_time) {
    if (this.game.hitPoints > 0) {
        for (var i = 0; i < this.game.hitPoints; i++)
            this.drawShip(i);
    } else {
        this.drawShip(0, death_time);
    }
}

Graphics.prototype.drawObstacles = function() {
    var color_loc = gl.getUniformLocation(this.program, 'uColor');
    var color = 1 - this.getFlashT();
    var alpha = 1;
    var flash = this.game.time - 170;
    if (flash > 0 && (flash = (flash % 30)/4) < 1)
        alpha *= Math.cos(5 * flash * 2*Math.PI) * 0.5 + 0.5;
    gl.uniform4f(color_loc, color, color, color, alpha);

    for (var i = 0; i < this.game.obstacles.length; i++) {
        var obs = this.game.obstacles[i];
        var pos = Vec2.fromAngle(obs[0]);
        var t = (obs[1] + 1)/(Game.farZ + 1);

        var size = 0.2;
        var dir = pos.getDir();
        var vertices = [
            pos.x + pos.y * size, pos.y - pos.x * size, t,
            pos.x - pos.y * size, pos.y + pos.x * size, t,
            pos.x + (pos.y - dir.x) * size, pos.y + (-pos.x - dir.y) * size, t,
            pos.x + (-pos.y - dir.x) * size, pos.y + (pos.x - dir.y) * size, t
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.objBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var pos_loc = gl.getAttribLocation(this.program, 'inPosition');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

Graphics.prototype.drawTunnel = function() {
    var start_a = 0.5;
    var color = [1, 1, 1, start_a];
    var color_t = this.game.time - 60;
    if (color_t >= 0) {
        color[0] = Math.cos(color_t * Math.PI/30) * 0.5 + 0.5;
        color[1] = Math.cos(color_t * Math.PI/10) * 0.5 + 0.5;
        color[2] = Math.cos(color_t * Math.PI/6) * 0.5 + 0.5;
        color[3] = 1 - (1 - start_a) * Math.exp(-color_t * 0.1);
    }

    var color_loc = gl.getUniformLocation(this.program, 'uColor');
    gl.uniform4f(color_loc, color[0], color[1], color[2], color[3]);

    for (var i = 0; i < this.lineBuffers.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffers[i]);
        var pos_loc = gl.getAttribLocation(this.program, 'inPosition');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_STRIP, 0, this.numLineVertices);
    }
}

Graphics.prototype.render = function(death_time) {
    if (!this.game) return;
    if (!this.program) return;

    var color = this.getFlashT();
    gl.clearColor(color, color, color, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);


    var angle = this.game.curvature.getTotalRot();
    var view_matrix = new Float32Array([
        Math.cos(angle), -Math.sin(angle), 0, 0,
        Math.sin(angle), Math.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    transpose4(view_matrix);
    var view_matrix_loc = gl.getUniformLocation(this.program, 'uViewMatrix');
    gl.uniformMatrix4fv(view_matrix_loc, false, view_matrix);


    var path_data = [];
    var path_points = this.game.curvature.getPathPoints();
    for (var i = 0; i < path_points.length; i++) {
        var pt = path_points[i][0];
        path_data.push(pt.x, pt.y, pt.z, path_points[i][1]);
    }
    var curve_path_loc = gl.getUniformLocation(this.program, 'uCurvePath');
    gl.uniform4fv(curve_path_loc, new Float32Array(path_data));


    this.drawTunnel();
    this.drawObstacles();
    this.drawPlayer(death_time);
}
