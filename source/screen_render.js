
var ScreenRender = {

    init: function(width, height) {
        this.program = loadInlineProgram('screen_vert', 'color_frag');

        gl.useProgram(this.program);
        var screen_size_loc = gl.getUniformLocation(this.program, 'uScreenSize');
        gl.uniform2f(screen_size_loc, width, height);

        var data = [0,0,  width,0,  0,height,  width,height];
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);


        var pos = new Vec2(width - 20, 20);

        var muteData = [
            5,0,  -5,-10,  -5,10,
            0,-3,  5,-3,  0,3,  5,-3,  0,3,  5,3
        ];
        for (var i = 0; i < muteData.length; i += 2) {
            muteData[i] += pos.x;
            muteData[i+1] += pos.y;
        }
        this.muteBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.muteBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(muteData), gl.STATIC_DRAW);

        var muteLinesData = [-13,4,  -7,-4,  -13,-4,  -7,4];
        for (var i = 0; i < muteLinesData.length; i += 2) {
            muteLinesData[i] += pos.x;
            muteLinesData[i+1] += pos.y;
        }
        this.muteLinesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.muteLinesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(muteLinesData), gl.STATIC_DRAW);
    },

    clearText: function() {
        var overlay = document.getElementById('overlay');
        overlay.innerHTML = '';
    },

    drawMainMenu: function() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var overlay = document.getElementById('overlay');

        var title = document.createElement('div');
        title.style.top = '200px';
        title.style.width = '100%';
        title.style.fontSize = '40px';
        title.innerHTML = '<p style="text-align: center">SPACE TRIANGLE</p>';
        overlay.appendChild(title);

        var prompt = document.createElement('div');
        prompt.style.top = '300px';
        prompt.style.width = '100%';
        prompt.style.fontSize = '28px';
        prompt.innerHTML = '<p style="text-align: center">PRESS ENTER</p>';
        overlay.appendChild(prompt);

        var cred = document.createElement('div');
        cred.style.bottom = '5px';
        cred.style.left = '5px';
        cred.style.fontSize = '20px';
        cred.style.color = '#7f7f7f';
        cred.innerHTML = 'music: marksparling.com';
        overlay.appendChild(cred);
    },

    drawScore: function(score, mode) {
        var text = document.createElement('div');
        text.style.fontSize = '28px';
        if (mode == 'top') text.style.right = '10px'; else text.style.left = '10px';
        if (mode == 'last') text.style.color = '#ffffff'; else text.style.color = '#7f7f7f';
        text.style.top = '10px';
        text.innerHTML = '' + Math.floor(score);

        var overlay = document.getElementById('overlay');
        overlay.appendChild(text);
    },

    drawPauseMenu: function() {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        var pos_loc = gl.getAttribLocation(this.program, 'inPosition');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);

        var color_loc = gl.getUniformLocation(this.program, 'uColor');
        gl.uniform4f(color_loc, 0, 0, 0, 0.4);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


        var text = document.createElement('div');
        text.style.top = '200px';
        text.style.width = '100%';
        text.style.fontSize = '28px';
        text.innerHTML = '<p style="text-align: center">PAUSED</p>';

        var overlay = document.getElementById('overlay');
        overlay.appendChild(text);
    },

    drawMuteButton: function(hover) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.muteBuffer);
        var pos_loc = gl.getAttribLocation(this.program, 'inPosition');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);

        var color_loc = gl.getUniformLocation(this.program, 'uColor');
        var color = hover ? 1 : 0.5;
        gl.uniform4f(color_loc, color, color, color, 1);

        gl.drawArrays(gl.TRIANGLES, 0, 9);


        if (Music.muted) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.muteLinesBuffer);
            gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINES, 0, 4);
        }
    }

};
