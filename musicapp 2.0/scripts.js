document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const dots = document.querySelectorAll('.dot');
    const audioPlayer = document.getElementById('audioPlayer');
    const playIcon = document.querySelector('.play');
    const pauseIcon = document.querySelector('.pause');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const currentTimeSpan = document.querySelector('.current-time');
    const totalTimeSpan = document.querySelector('.total-time');
    const backButton = document.querySelector('.back-button');
    const shuffleButton = document.querySelector('.shuffle');
    const repeatButton = document.querySelector('.repeat');
    const previousButton = document.querySelector('.previous');
    const nextButton = document.querySelector('.next');
    const volumeSlider = document.getElementById('volumeSlider');
    
    let isPlaying = false;
    let currentTrackIndex = 0;
    let playlist = [];
    let isShuffle = false;
    let isRepeat = false;
    let isDragging = false;

    function showScreen(screenIndex) {
        screens.forEach((screen, index) => {
            screen.classList.toggle('active', index === screenIndex);
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === screenIndex);
        });
    }

    if (!sessionStorage.getItem('homeScreenSkipped')) {
        showScreen(0);
    } else {
        showScreen(1);
    }

    document.querySelector('.skip-button').addEventListener('click', () => {
        sessionStorage.setItem('homeScreenSkipped', 'true');
        showScreen(1);
    });

    document.querySelectorAll('.track').forEach((track, index) => {
        track.addEventListener('click', () => {
            const title = track.dataset.title;
            const artist = track.dataset.artist;
            const src = track.dataset.src;
            const albumArt = track.dataset.albumArt;
            playlist = [...document.querySelectorAll('.track')].map(t => ({
                title: t.dataset.title,
                artist: t.dataset.artist,
                src: t.dataset.src,
                albumArt: t.dataset.albumArt
            }));
            currentTrackIndex = index;
            playTrack(title, artist, src, albumArt);
        });
    });

    function playTrack(title, artist, src, albumArt) {
        try {
            audioPlayer.src = src;
            document.querySelector('.song-title').textContent = title;
            document.querySelector('.song-artist').textContent = artist;
            document.querySelector('.album-art').src = albumArt;
            showScreen(2);
            audioPlayer.play();
            isPlaying = true;
            updatePlayPauseIcons();
            audioPlayer.addEventListener('timeupdate', updateProgress);
            audioPlayer.addEventListener('ended', () => {
                isPlaying = false;
                updatePlayPauseIcons();
                if (isRepeat) {
                    audioPlayer.play();
                } else if (isShuffle) {
                    nextTrack();
                }
            });
        } catch (error) {
            console.error('Error playing track:', error);
        }
    }

    function updatePlayPauseIcons() {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    function updateProgress() {
        if (!audioPlayer.duration) return;
        const currentTime = audioPlayer.currentTime;
        const totalTime = audioPlayer.duration;
        progress.style.width = `${(currentTime / totalTime) * 100}%`;
        currentTimeSpan.textContent = formatTime(currentTime);
        totalTimeSpan.textContent = formatTime(totalTime);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    document.querySelector('.play').addEventListener('click', () => {
        if (!isPlaying) {
            audioPlayer.play();
            isPlaying = true;
        }
        updatePlayPauseIcons();
    });

    document.querySelector('.pause').addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        }
        updatePlayPauseIcons();
    });

    backButton.addEventListener('click', () => {
        console.log('Back button clicked');
        audioPlayer.pause(); 
        showScreen(1);
    });

    shuffleButton.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleButton.style.opacity = isShuffle ? 1 : 0.5;
    });

    repeatButton.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatButton.style.opacity = isRepeat ? 1 : 0.5;
    });

    previousButton.addEventListener('click', () => {
        if (isShuffle) {
            currentTrackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        }
        const track = playlist[currentTrackIndex];
        playTrack(track.title, track.artist, track.src, track.albumArt);
    });

    nextButton.addEventListener('click', () => {
        if (isShuffle) {
            currentTrackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        const track = playlist[currentTrackIndex];
        playTrack(track.title, track.artist, track.src, track.albumArt);
    });

    function onMouseMove(event) {
        if (!isDragging) return;
        const rect = progressBar.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        audioPlayer.currentTime = percent * audioPlayer.duration;
        updateProgress();
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    progressBar.addEventListener('mousedown', (event) => {
        isDragging = true;
        onMouseMove(event); 
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value;
    });

    audioPlayer.volume = volumeSlider.value;

    
    updatePlayPauseIcons();
});

