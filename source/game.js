
function Game() {
    this.gameOver = false;
    this.hitPoints = 1;
    this.invincTime = 0;
    this.lastHitPoint = 0;

    this.playerAngle = 3 * Math.PI / 2;
    this.playerAngleVel = 0;

    this.time = 0;
    this.obstacles = [];
    this.curvature = new Curvature(this);
}

Game.farZ = -30;

Game.prototype.getPlayerPos = function() {
    return Vec2.fromAngle(this.playerAngle);
}

Game.prototype.getNextHitPoint = function() {
    return this.lastHitPoint == 0 ? 40 : this.lastHitPoint + 30;
}

Game.prototype.update = function(dt) {
    this.time += dt;

    if (this.time > this.getNextHitPoint()) {
        this.lastHitPoint = this.getNextHitPoint();
        this.hitPoints += 1;
    }

    var moveDir = 0;
    if (Input.isKeyDown(39)) moveDir += 1;
    if (Input.isKeyDown(37)) moveDir -= 1;
    this.playerAngleVel += moveDir * 15 * dt;

    this.playerAngle += this.playerAngleVel * dt;
    this.playerAngleVel *= 1 - 7 * dt;

    var num_obstacles = Math.min(Math.floor(5 + this.time/12), 10);
    if (this.time > 160)
        this.num_obstacles += Math.floor((this.time - 160)/30);

    while (this.obstacles.length < num_obstacles) {
        var obs = this.obstacles;
        var last_z = obs.length > 0 ? obs[obs.length - 1][1] : Game.farZ;
        var z = Math.min(last_z + Game.farZ / num_obstacles, Game.farZ);
        this.obstacles.push([Math.random() * 2*Math.PI, z]);
    }

    var speed = 12 + 0.5 * Math.sqrt(this.time);

    for (var i = 0; i < this.obstacles.length; i++) {
        var obs = this.obstacles[i];
        obs[1] += speed * dt;

        if (this.invincTime <= 0 && obs[1] >= -1.1 && Math.abs(angleDist(this.playerAngle, obs[0])) < 0.3) {
            this.hitPoints -= 1;
            obs[1] = this.hitPoints > 0 ? 0 : -1.1;
            if (this.hitPoints > 1) this.invincTime = 1;
        }

        if (obs[1] > -1)
            this.obstacles.splice(i--, 1);
    }

    this.curvature.update(speed, dt);

    if (this.invincTime > 0) this.invincTime -= dt;
    if (this.hitPoints <= 0) this.gameOver = true;
}
