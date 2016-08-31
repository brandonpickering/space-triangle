
function Curvature(game) {
    this.game = game;

    this.currTotalRot = 0;
    this.nextTotalRot = 0;

    this.curvature = new Vec3(0, 0, 0);
    this.oldCurvature = new Vec3(0, 0, 0);
    this.transition = 0;

    this.pathTurns = [];
    for (var i = 0; i < 32; i++)
        this.pathTurns.push(new Vec3(0, 0, 0));
    this.pathPointDist = (-1 - Game.farZ)/31.0;
    this.pathMoveDist = 0;
}

Curvature.prototype.getTotalRot = function() {
    var t = this.pathMoveDist / this.pathPointDist;
    return (1 - t) * this.currTotalRot + t * this.nextTotalRot;
}

Curvature.prototype.getSmoothedPathTurns = function() {
    var result = [];
    var t = this.pathMoveDist / this.pathPointDist;
    for (var i = 0; i < this.pathTurns.length - 1; i++) {
        var turn0 = this.pathTurns[i];
        var turn1 = this.pathTurns[i+1];
        result.push(turn0.scale(1 - t).add(turn1.scale(t)));
    }
    return result;
}

Curvature.prototype.getPathPoints = function() {
    var points = [[new Vec3(0, 0, -1), 0]];
    var dir = new Vec3(0, 0, -1);
    var up = new Vec3(0, 1, 0);

    var turns = this.getSmoothedPathTurns();
    for (var i = 0; i < turns.length; i++) {
        var shift = turns[i].swizzleXY().capMag(1);
        var roll = turns[i].z;

        var right = dir.cross(up);
        dir = dir.add(right.scale(shift.x / 31));
        dir = dir.add(up.scale(shift.y / 31));
        dir = dir.getDir();
        
        var last_point = points[points.length - 1][0];
        var last_angle = points[points.length - 1][1];
        var point = last_point.add(dir.scale(-(Game.farZ + 1) / 31));
        var angle = last_angle + roll / 31 * 2 * Math.PI;
        points.push([point, angle]);
    }

    return points;
}

Curvature.prototype.set = function(xturn, yturn, roll) {
    this.oldCurvature = this.curvature;
    this.curvature = new Vec3(xturn, yturn, roll);
}

Curvature.prototype.update = function(speed, dt) {
    this.transition += dt/3;
    if (this.transition >= 1) {
        this.transition = 0;

        if (this.game.time > 7) {
            var s = Math.random();
            if (s < 0.1)
                this.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            else if (s < 0.4)
                this.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() - 0.5);
            else if (s < 0.6)
                this.set(0, 0, Math.random() * 2 - 1);
            else
                this.set(0, 0, 0);
        }
    }

    this.pathMoveDist += speed * dt;
    while (this.pathMoveDist >= this.pathPointDist) {
        this.pathMoveDist -= this.pathPointDist;

        this.currTotalRot = this.nextTotalRot;
        this.nextTotalRot += this.pathTurns[0].z / 31.0;
        this.pathTurns.shift();

        var p = function(t) { return 3*t*t - 2*t*t*t; }
        var t = p(this.transition);
        this.pathTurns.push(this.oldCurvature.scale(1-t).add(this.curvature.scale(t)));
    }
}
