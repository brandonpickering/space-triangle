
function Main() {
    this.graphics = new Graphics();

    this.topScore = null;
    this.lastScore = null;
    this.game = null;
    this.deathTime = 0;

    this.paused = false;
    this.pauseHeld = false;

    this.muteHover = false;
    this.muteWasPressed = false;
}

Main.prototype.update = function(dt) {
    dt = Math.min(dt, 1/30);

    if (!this.muteWasPressed && ((Input.isButtonDown(0) && this.muteHover) || Input.isKeyDown(77)))
        Music.muted = !Music.muted;
    this.muteWasPressed = Input.isButtonDown(0) || Input.isKeyDown(77);

    Music.update();

    if (!this.game) {
        if (Input.isKeyDown(13)) {
            this.game = new Game();
            this.graphics.game = this.game;
            this.pauseHeld = true;
        }
        return;
    }

    if (Input.isKeyDown(13) || Input.isKeyDown(27)) {
        if (!this.pauseHeld) this.paused = !this.paused;
        Music.setPaused(this.paused);
        this.pauseHeld = true;
    } else {
        this.pauseHeld = false;
    }
    if (this.paused) return;

    if (this.game.gameOver) {
        this.deathTime -= 0.5 * dt;
        if (this.deathTime <= 0) {
            this.game = new Game;
            this.graphics.game = this.game;
        }
        return;
    }

    this.game.update(dt);

    if (this.topScore != null && this.game.time > this.topScore)
        this.topScore = this.game.time;
    if (this.game.gameOver) {
        this.lastScore = this.game.time;
        if (this.topScore == null) this.topScore = this.game.time;
        this.deathTime = 1;
    }
}

Main.prototype.render = function(width, height) {
    gl.viewport(0, 0, width, height);
    ScreenRender.clearText();

    if (this.game == null) {
        ScreenRender.drawMainMenu();

    } else {
        this.graphics.render(this.deathTime);

        if (this.lastScore != null && this.game.time < 4 && !this.game.gameOver)
            ScreenRender.drawScore(this.lastScore, 'last');
        else
            ScreenRender.drawScore(this.game.time, 'curr');

        if (this.topScore != null)
            ScreenRender.drawScore(this.topScore, 'top');
    }

    if (this.paused)
        ScreenRender.drawPauseMenu();

    ScreenRender.drawMuteButton(this.muteHover);
}



window.onload = function start() {
    var canvas = document.getElementById('canvas');
    var options = {
        premultipliedAlpha: false,
        alpha: false,
        antialias: true
    };
    gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
    if (!gl) {
        document.body.innerHTML = "<p>Your browser does not support WebGL</p>"
        return;
    }


    Music.init();
    ScreenRender.init(canvas.width, canvas.height);

    var main = new Main();

    var loop = function(dt) {
        main.muteHover = 
            Input.mousePos.x >= canvas.width - 50 &&
            Input.mousePos.x <= canvas.width &&
            Input.mousePos.y >= 0 &&
            Input.mousePos.y <= 50;
        document.body.style.cursor = main.muteHover ? 'pointer' : 'default';

        main.update(dt);
        main.render(canvas.width, canvas.height);
    }


    if (typeof window.requestAnimationFrame === 'function') {
        var lastTime = null;
        var step = function(timestamp) {
            lastTime = lastTime || timestamp;
            var dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            loop(dt);
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);

    } else {
        var dt = 1/60;
        window.setInterval(function() {
            loop(dt)
        }, 1000 * dt);
    }
}
