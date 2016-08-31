
var Music = {

    init: function() {
        this.song = null;
        this.muted = false;
        this.paused = false;

        this.index = -1;
        this.playSong('day_61');
    },

    getPlaylist: function(index) {
        if (index == -1)
            return 'day_61';

        if (index % 3 == 0)
            return 'day_15';
        else if (index % 3 == 1)
            return 'day_35';
        else
            return 'day_8';
    },

    stopPlaying: function() {
        if (this.song != null) {
            this.song.pause();
            this.song.currentTime = 0;
            this.song = null;
        }
    },

    playSong: function(name) {
        if (this.song != null) this.stopPlaying();
        this.song = document.getElementById('music_' + name);
        this.song.volume = 0.3;
        this.song.play();
    },

    setPaused: function(paused) {
        this.paused = paused;
        if (this.paused) {
            if (this.song != null) this.song.pause();
        } else if (!this.muted && this.song != null) {
            this.song.play();
        }
    },

    update: function() {
        if (this.muted) {
            this.stopPlaying();
        
        } else if (this.paused) {
        
        } else if (this.song == null) {
            this.playSong(this.getPlaylist(this.index));
        
        } else if (this.song.ended) {
            this.playSong(this.getPlaylist(++this.index));
        }
    }
};
