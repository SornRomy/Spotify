// Initialize the Variables
let songIndex = 0; // Represents the index in the original 'songs' array (used for non-shuffled playback flow)
let audioElement = new Audio();
let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let currentTimeSpan = document.getElementById('currentTime');
let totalTimeSpan = document.getElementById('totalTime');
let searchInput = document.getElementById('searchInput');

// Variables for shuffle
let isShuffling = false;
let shuffledSongs = []; // Stores indices of original songs in shuffled order
let currentShuffledIndex = 0; // Index within the 'shuffledSongs' array

// --- YOUR SONG DATA ---
// IMPORTANT: Make sure to add the 'artist' field for each song!
let songs = [
    {songName: "ឱក្រមុំមុំបងអើយ", filePath: "songs/1.mp3", coverPath: "covers/piset.jpg", artist: "Piset"},
    {songName: "មួយទៅមួយ", filePath: "songs/2.mp3", coverPath: "covers/piset.jpg", artist: "Piset"},
    {songName: "Again and Again", filePath: "songs/3.mp3", coverPath: "covers/huuhai.jpg", artist: "Huuhai"},
    {songName: "J+O [Remix]", filePath: "songs/4.mp3", coverPath: "covers/vannda.jpg", artist: "Vannda"},
    {songName: "AH TOUR", filePath: "songs/5.mp3", coverPath: "covers/gmangz.jpg", artist: "Gmangz"},
    {songName: "Low-Low", filePath: "songs/6.mp3", coverPath: "covers/flo.jpg", artist: "FLO"},
    {songName: "Boom, Shake, Drop", filePath: "songs/7.mp3", coverPath: "covers/flo.jpg", artist: "FLO"},
    {songName: "Die With A Smile", filePath: "songs/8.mp3", coverPath: "covers/Bruno-000000-80-0-0.jpg", artist: "Bruno Mars"},
    {songName: "The Gangster Luv Story", filePath: "songs/9.mp3", coverPath: "covers/4t5.jpg", artist: "4T5"},
    {songName: "Chanavinlyna", filePath: "songs/10.mp3", coverPath: "covers/sachdom.jpg", artist: "Sachdom"},
    {songName: "Steav Jor", filePath: "songs/11.mp3", coverPath: "covers/gmangz.jpg", artist: "Gmangz"},
    {songName: "គ្រាន់តែរាំ", filePath: "songs/12.mp3", coverPath: "covers/BSide.jpg", artist: "BSide"},
    {songName: "She lies", filePath: "songs/13.mp3", coverPath: "covers/4t5.jpg", artist: "4T5"},
    {songName: "SONTARO", filePath: "songs/14.mp3", coverPath: "covers/vannda.jpg", artist: "Vannda"},
    {songName: "Soul Snatcher", filePath: "songs/15.mp3", coverPath: "covers/4t5.jpg", artist: "4T5"},
    {songName: "AH THMA", filePath: "songs/16.mp3", coverPath: "covers/vannda.jpg", artist: "Vannda"},
    // If you have duplicates, consider making them unique or removing one.
    {songName: "យប់ស្ងាត់", filePath: "songs/17.mp3", coverPath: "covers/piset.jpg", artist: "Piset"},
];

// --- Utility Functions ---

// Formats time in seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00"; // Handle negative or NaN
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Shuffles an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Gets the original index of the currently playing song from the 'audioElement.src'
// Returns -1 if no song is playing or cannot be identified.
function getCurrentlyPlayingOriginalIndex() {
    if (!audioElement.src) return -1;
    // Extract just the filename to compare (in case paths differ slightly)
    const currentFilePathName = decodeURIComponent(audioElement.src.split('/').pop()); // decode for URL encoding
    return songs.findIndex(song => decodeURIComponent(song.filePath.split('/').pop()) === currentFilePathName);
}

// Resets all individual song play icons to 'play' and removes 'active' highlight
const makeAllPlays = () => {
    // Operate on all *currently visible* song items
    document.querySelectorAll('.songItem').forEach((item) => {
        item.classList.remove('active');
        const playIcon = item.querySelector('.songItemPlay');
        if (playIcon) {
            playIcon.classList.remove('fa-pause-circle');
            playIcon.classList.add('fa-play-circle');
        }
    });
};

// Highlights the currently playing song in the list and updates its play icon
const highlightPlayingSong = () => {
    makeAllPlays(); // Clear all previous highlights and icons from visible items

    const currentlyPlayingOriginalIndex = getCurrentlyPlayingOriginalIndex();

    if (currentlyPlayingOriginalIndex !== -1) {
        // Find the specific song item that matches the playing song's original index among the *currently displayed* items
        const activeSongItem = document.querySelector(`.songItem[data-original-index="${currentlyPlayingOriginalIndex}"]`);

        if (activeSongItem) {
            activeSongItem.classList.add('active'); // Highlight the row
            const activePlayIcon = activeSongItem.querySelector('.songItemPlay');
            if (activePlayIcon && !audioElement.paused) { // Icon should be fa-pause-circle if playing
                activePlayIcon.classList.remove('fa-play-circle');
                activePlayIcon.classList.add('fa-pause-circle');
            }
        }
    }
};

// --- Media Session API Integration (NEW) ---
function updateMediaSessionMetadata() {
    // Check if Media Session API is supported and if there are songs to play
    if ('mediaSession' in navigator && songs.length > 0) {
        const currentOriginalIndex = getCurrentlyPlayingOriginalIndex();
        if (currentOriginalIndex !== -1) {
            const currentSong = songs[currentOriginalIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.songName,
                artist: currentSong.artist || 'Unknown Artist', // Use the new artist field, with fallback
                album: 'My Awesome Player', // You can set a generic album name for your player
                artwork: [
                    // Provide multiple sizes for better compatibility across devices
                    { src: currentSong.coverPath, sizes: '96x96', type: 'image/jpeg' },
                    { src: currentSong.coverPath, sizes: '128x128', type: 'image/jpeg' },
                    { src: currentSong.coverPath, sizes: '192x192', type: 'image/jpeg' },
                    { src: currentSong.coverPath, sizes: '256x256', type: 'image/jpeg' },
                    { src: currentSong.coverPath, sizes: '384x384', type: 'image/jpeg' },
                    { src: currentSong.coverPath, sizes: '512x512', type: 'image/jpeg' },
                ]
            });
            console.log("Media Session Metadata Updated:", navigator.mediaSession.metadata);
        } else {
            // Clear metadata if no song is playing
            navigator.mediaSession.metadata = null;
            console.log("Media Session Metadata Cleared (No song playing).");
        }
    }
}

// Setup Media Session action handlers (play, pause, next, previous)
function setupMediaSessionHandlers() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            console.log("Media Session: Play action received.");
            // Simulate click on master play button if currently paused or stopped
            if (audioElement.paused || audioElement.currentTime <= 0) {
                 masterPlay.click(); // This will trigger our existing play/pause logic
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            console.log("Media Session: Pause action received.");
            // Simulate click on master play button if currently playing
            if (!audioElement.paused) {
                masterPlay.click(); // This will trigger our existing play/pause logic
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log("Media Session: Previous Track action received.");
            document.getElementById('previous').click(); // Simulate click on previous button
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log("Media Session: Next Track action received.");
            document.getElementById('next').click(); // Simulate click on next button
        });

        // Optional: Seek actions (scrubbing on lock screen)
        // Implement if you want finer control over seeking from OS controls
        // navigator.mediaSession.setActionHandler('seekbackward', (event) => {
        //     console.log("Media Session: Seek Backward action received.");
        //     audioElement.currentTime = Math.max(0, audioElement.currentTime - (event.seekOffset || 10)); // Seek back 10 seconds default
        //     navigator.mediaSession.setPositionState({
        //         duration: audioElement.duration,
        //         playbackRate: audioElement.playbackRate,
        //         position: audioElement.currentTime
        //     });
        // });
        // navigator.mediaSession.setActionHandler('seekforward', (event) => {
        //     console.log("Media Session: Seek Forward action received.");
        //     audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + (event.seekOffset || 10)); // Seek forward 10 seconds default
        //     navigator.mediaSession.setPositionState({
        //         duration: audioElement.duration,
        //         playbackRate: audioElement.playbackRate,
        //         position: audioElement.currentTime
        //     });
        // });
        // navigator.mediaSession.setActionHandler('seekto', (event) => {
        //     if (event.seekTime !== undefined) {
        //         console.log(`Media Session: Seek To action received. Seeking to ${event.seekTime}s.`);
        //         audioElement.currentTime = event.seekTime;
        //         navigator.mediaSession.setPositionState({
        //             duration: audioElement.duration,
        //             playbackRate: audioElement.playbackRate,
        //             position: audioElement.currentTime
        //         });
        //     }
        // });
        console.log("Media Session handlers setup complete.");
    } else {
        console.warn("Media Session API is not supported in this browser.");
    }
}


// Plays the currently selected song (based on songIndex or shuffledSongs)
function playSelectedSong() {
    if (songs.length === 0) {
        console.warn("No songs available to play.");
        return;
    }

    let currentSongData;
    let actualOriginalIndex;

    if (isShuffling && shuffledSongs.length > 0) {
        actualOriginalIndex = shuffledSongs[currentShuffledIndex];
        currentSongData = songs[actualOriginalIndex];
    } else {
        actualOriginalIndex = songIndex;
        currentSongData = songs[songIndex];
    }

    // Set audio source and master song name
    audioElement.src = currentSongData.filePath;
    masterSongName.innerText = currentSongData.songName;
    audioElement.currentTime = 0; // Always start new song from beginning

    // Update UI elements for playing state
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
    gif.style.opacity = 1;

    // Attempt to play the audio
    audioElement.play().then(() => {
        console.log("Audio playback started successfully.");
        // Update Media Session state and metadata only after successful playback
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
            updateMediaSessionMetadata();
            // Initial position state update
            navigator.mediaSession.setPositionState({
                duration: audioElement.duration,
                playbackRate: audioElement.playbackRate,
                position: audioElement.currentTime
            });
        }
    }).catch(error => {
        console.error("Autoplay prevented or playback error:", error);
        // Revert UI to paused state on playback error/prevention
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        // Update Media Session state to paused on error
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });

    highlightPlayingSong(); // Update UI to reflect playing song
}

// --- DOM Manipulation & Initialization ---

// Create song items dynamically and add to the DOM based on a filtered list
function createSongItems(filteredSongs = songs) {
    const container = document.querySelector('.songItemContainer');
    container.innerHTML = ''; // Clear existing content

    if (filteredSongs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No songs found matching your search.</p>';
        return;
    }

    filteredSongs.forEach((song) => {
        const originalIndex = songs.indexOf(song); // Get the original index from the master 'songs' array
        const songItem = document.createElement('div');
        songItem.className = 'songItem';
        songItem.dataset.originalIndex = originalIndex; // Store original index as data attribute
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="${song.songName}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMuc2FjZGlyby5jb20vdXJsIiBzdHlsZT0icG9zaXRpb246IGFic29sdXRlOyB0b3A6IDUwJTsgbGVmdDogNTAlOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTsiPgo8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSIzMCIgZmlsbD0iIzY2N2VlYSIvPgo8c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJwb3NpdGlvbjogYWJzb2x1dGU7IHZ0b3A6IDUwJTsgbGVmdDogNTAlOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTsiPgo8cGF0aCBkPSJNMTIgM1Y3TDguNSAzTDExLjUgNkw4LjUgNi41TDEyIDNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgN1YyMUMxMC44OSAyMSAxMCAyMC4xMSAxMCAxOUMxMCAxNy44OSAxMC44OSAxNyAxMiAxN0MxMy4xMSAxNyAxNCAxNy44OSAxNCAxOUMxNCAyMC4xMSAxMy4xMSAyMSAxMiAyMVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K'" />
            <span class="songName">${song.songName}</span>
            <span class="songlistplay">
                <span class="timestamp">
                    <span class="duration-display">

                        <!--<span class="current-time" id="current-${originalIndex}">00:00</span> /--->

                        <span class="total-time" id="total-${originalIndex}">00:00</span>
                    </span>

                    <!--<i id="${originalIndex}" class="far songItemPlay fa-play-circle"></i>-->
                    
                </span>
            </span>
        `;
        container.appendChild(songItem);
    });

    // Re-attach listeners to the container (event delegation)
    attachSongItemListeners();
    // Re-load durations for the newly displayed items
    loadSongDurations();
}


// Load song durations for each item in the list
function loadSongDurations() {
    songs.forEach((song, index) => { // Loop through the ORIGINAL songs array
        const totalElement = document.getElementById(`total-${index}`); // Use original index for unique ID
        if (totalElement && totalElement.textContent === "00:00") { // Only load if not already set
            const tempAudio = new Audio(song.filePath);
            tempAudio.addEventListener('loadedmetadata', () => {
                totalElement.textContent = formatTime(tempAudio.duration);
            }, { once: true });
            tempAudio.addEventListener('error', () => {
                totalElement.textContent = "00:00";
                console.error(`Error loading metadata for ${song.filePath}`);
            }, { once: true });
        }
    });
}

// Function to attach event listeners to song items using event delegation
// This needs to be called after createSongItems
function attachSongItemListeners() {
    const songItemContainer = document.querySelector('.songItemContainer');

    // Remove existing event listener to prevent duplicates if createSongItems is called multiple times
    if (songItemContainer._clickListener) {
        songItemContainer.removeEventListener('click', songItemContainer._clickListener);
    }

    // Define the single listener function
    const newClickListener = (e) => {
        const clickedPlayIcon = e.target.closest('.songItemPlay');
        const clickedSongItem = e.target.closest('.songItem');

        if (clickedPlayIcon) {
            // Click on the play/pause icon within a song item
            const clickedOriginalIndex = parseInt(clickedPlayIcon.id);
            handleSongItemInteraction(clickedOriginalIndex);
        } else if (clickedSongItem) {
            // Click on the song item div itself (but not the icon)
            const clickedOriginalIndex = parseInt(clickedSongItem.dataset.originalIndex);
            handleSongItemInteraction(clickedOriginalIndex);
        }
    };

    songItemContainer.addEventListener('click', newClickListener);
    songItemContainer._clickListener = newClickListener; // Store reference to remove later
}

// Helper function to handle common logic for playing/pausing a song item
function handleSongItemInteraction(clickedOriginalIndex) {
    const currentlyPlayingOriginalIndex = getCurrentlyPlayingOriginalIndex();

    if (currentlyPlayingOriginalIndex === clickedOriginalIndex && !audioElement.paused) {
        // Same song is clicked AND it's currently playing - so toggle pause
        audioElement.pause();
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'; // Update Media Session state
        }
    } else {
        // Different song is clicked, or same song but it was paused/not started
        if (isShuffling) {
            toggleShuffle(false); // Turn shuffle off if a specific song is selected
        }
        songIndex = clickedOriginalIndex; // Update songIndex to the newly selected original index
        playSelectedSong(); // This will handle playing, setting master controls, and highlighting
    }
    highlightPlayingSong(); // Always update UI after interaction
}


// --- Initial Setup on Page Load ---
createSongItems(); // First create the song items in the DOM
setupMediaSessionHandlers(); // Setup media session action handlers once on load

// Set initial song (first song in the original list) if songs exist
if (songs.length > 0) {
    audioElement.src = songs[songIndex].filePath; // Set initial src for master controls
    masterSongName.innerText = songs[songIndex].songName; // Initial song name display
    highlightPlayingSong(); // Highlight the first song on load
}


// --- Main Player Control Event Listeners ---

// Master Play/Pause Button
masterPlay.addEventListener('click', () => {
    // If no song is loaded or selected, prevent play
    if (!audioElement.src || songs.length === 0) {
        console.warn("No song loaded to play.");
        return;
    }

    if (audioElement.paused || audioElement.currentTime <= 0) {
        audioElement.play().then(() => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing'; // Update Media Session state
                updateMediaSessionMetadata(); // Ensure metadata is fresh
            }
        }).catch(error => {
            console.error("Autoplay prevented or playback error:", error);
        });
        masterPlay.classList.remove('fa-play-circle');
        masterPlay.classList.add('fa-pause-circle');
        gif.style.opacity = 1;
    } else {
        audioElement.pause();
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'; // Update Media Session state
        }
    }
    highlightPlayingSong(); // Always update highlight on play/pause
});

// Update progress bar and time displays as song plays
audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration) {
        const progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
        myProgressBar.value = progress;

        currentTimeSpan.textContent = formatTime(audioElement.currentTime);
        // Update individual song time display for the actively playing song
        const currentOriginalIndex = getCurrentlyPlayingOriginalIndex();
        if (currentOriginalIndex !== -1) {
            const currentSongTimeElement = document.getElementById(`current-${currentOriginalIndex}`);
            if (currentSongTimeElement) {
                currentSongTimeElement.textContent = formatTime(audioElement.currentTime);
            }
        }

        // Update Media Session position state
        if ('mediaSession' in navigator && navigator.mediaSession.playbackState === 'playing') {
            navigator.mediaSession.setPositionState({
                duration: audioElement.duration,
                playbackRate: audioElement.playbackRate,
                position: audioElement.currentTime
            });
        }
    }
});

// Seek song when progress bar is clicked/dragged
myProgressBar.addEventListener('input', () => {
    if (audioElement.duration) {
        audioElement.currentTime = (myProgressBar.value * audioElement.duration) / 100;
        // Update Media Session position state immediately on seek
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setPositionState({
                duration: audioElement.duration,
                playbackRate: audioElement.playbackRate,
                position: audioElement.currentTime
            });
        }
    }
});

// Next song button
document.getElementById('next').addEventListener('click', () => {
    if (songs.length === 0) return; // Prevent action if no songs

    if (isShuffling) {
        if (shuffledSongs.length === 0) { // Should not happen if shuffle is active, but for safety
             toggleShuffle(false); // Turn off shuffle and revert to sequential
             songIndex = (songIndex + 1) % songs.length;
        } else {
            currentShuffledIndex = (currentShuffledIndex + 1) % shuffledSongs.length;
            songIndex = shuffledSongs[currentShuffledIndex]; // Update songIndex to the original index
        }
    } else {
        songIndex = (songIndex + 1) % songs.length; // Loop back to 0 if at end
    }
    playSelectedSong(); // This will handle playing, updating metadata, and playback state
});

// Previous song button
document.getElementById('previous').addEventListener('click', () => {
    if (songs.length === 0) return; // Prevent action if no songs

    if (isShuffling) {
        if (shuffledSongs.length === 0) { // Should not happen if shuffle is active, but for safety
             toggleShuffle(false); // Turn off shuffle and revert to sequential
             songIndex = (songIndex - 1 + songs.length) % songs.length;
        } else {
            currentShuffledIndex = (currentShuffledIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
            songIndex = shuffledSongs[currentShuffledIndex]; // Update songIndex to the original index
        }
    } else {
        songIndex = (songIndex - 1 + songs.length) % songs.length; // Loop to end if at start
    }
    playSelectedSong(); // This will handle playing, updating metadata, and playback state
});

// Auto-play next song when current one ends
audioElement.addEventListener('ended', () => {
    if (songs.length === 0) return; // Prevent action if no songs

    if (isShuffling) {
        if (shuffledSongs.length === 0) { // Should not happen if shuffle is active, but for safety
             toggleShuffle(false);
             songIndex = (songIndex + 1) % songs.length;
        } else {
            currentShuffledIndex = (currentShuffledIndex + 1) % shuffledSongs.length;
            songIndex = shuffledSongs[currentShuffledIndex];
        }
    } else {
        songIndex = (songIndex + 1) % songs.length;
    }
    playSelectedSong(); // This will handle playing, updating metadata, and playback state
});

// Shuffle button functionality
function toggleShuffle(forceState = null) {
    if (forceState !== null) {
        isShuffling = forceState;
    } else {
        isShuffling = !isShuffling; // Toggle if no forceState
    }

    const shuffleBtn = document.getElementById('shuffle');
    if (isShuffling) {
        shuffleBtn.style.color = '#764ba2'; // Highlight when active

        // Ensure the shuffled list includes the currently playing song at the start
        const currentlyPlayingOriginalIndex = getCurrentlyPlayingOriginalIndex();
        shuffledSongs = shuffleArray(Array.from({length: songs.length}, (_, i) => i));

        if (currentlyPlayingOriginalIndex !== -1) {
            const currentSongInShuffledIndex = shuffledSongs.indexOf(currentlyPlayingOriginalIndex);
            if (currentSongInShuffledIndex !== -1) {
                shuffledSongs.splice(currentSongInShuffledIndex, 1); // Remove it from its current position
                shuffledSongs.unshift(currentlyPlayingOriginalIndex); // Add it to the beginning
                currentShuffledIndex = 0;
            }
        } else {
            currentShuffledIndex = 0; // If no song playing, start shuffled list from beginning
        }

        console.log('Shuffle mode ON. Shuffled order (original indices):', shuffledSongs);

    } else {
        shuffleBtn.style.color = '#667eea'; // Revert color
        // When turning shuffle off, set songIndex to the original index of the song that was playing
        songIndex = getCurrentlyPlayingOriginalIndex(); // Use the reliable function
        if (songIndex === -1) songIndex = 0; // Fallback to 0 if no song was playing

        shuffledSongs = []; // Clear shuffled songs array
        currentShuffledIndex = 0; // Reset shuffled index
        console.log('Shuffle mode OFF.');
    }
    highlightPlayingSong(); // Update highlight based on new state
}

document.getElementById('shuffle').addEventListener('click', () => {
    toggleShuffle(); // Toggle shuffle state
    // If a song is playing, ensure it continues playing in the new mode
    // No need to call playSelectedSong here, as it's already playing,
    // only the internal state and highlight need updating.
});


// Search functionality - The most robust version!
searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song =>
        song.songName.toLowerCase().includes(searchTerm)
    );

    // Get the currently playing song's original index and its playing state *before* re-rendering
    const wasPlayingOriginalIndex = getCurrentlyPlayingOriginalIndex();
    const wasAudioPlaying = !audioElement.paused && wasPlayingOriginalIndex !== -1;

    // Recreate the list with filtered songs. This updates the DOM.
    createSongItems(filteredSongs);

    // Check if the previously playing song is still present in the *newly filtered* list
    const isCurrentSongStillVisible = filteredSongs.some(song => songs.indexOf(song) === wasPlayingOriginalIndex);

    // Update Master Controls and Name based on playback state and visibility
    if (wasAudioPlaying && !isCurrentSongStillVisible) {
        // Case 1: Song was playing, but it's now hidden by the search filter.
        audioElement.pause();
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        //masterSongName.innerText = "Select a song to start playing"; // Clear playing song display
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'; // Update Media Session state
        }
    } else if (wasAudioPlaying && isCurrentSongStillVisible) {
        // Case 2: Song was playing AND is still visible. Keep playing.
        masterPlay.classList.remove('fa-play-circle'); // Ensure it's showing 'pause'
        masterPlay.classList.add('fa-pause-circle');
        gif.style.opacity = 1;
        masterSongName.innerText = songs[wasPlayingOriginalIndex].songName;
        // Audio is still playing, so playbackState should remain 'playing'.
        updateMediaSessionMetadata(); // Re-ensure metadata is current in case of changes
    } else if (!wasAudioPlaying && filteredSongs.length > 0) {
        // Case 3: No song was playing, but there are now visible songs.
        masterPlay.classList.remove('fa-pause-circle'); // Ensure it's showing 'play'
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        //masterSongName.innerText = "Select a song to start playing";
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'; // No audio playing, so set to paused
            navigator.mediaSession.metadata = null; // Clear metadata from lock screen
        }
    } else {
        // Case 4: No song was playing and no songs are found.
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        //masterSongName.innerText = "No songs found";
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none'; // Or 'paused' depending on desired initial state
            navigator.mediaSession.metadata = null; // Clear metadata from lock screen
        }
    }

    // Always call highlightPlayingSong to ensure correct visual state after DOM update
    // This will correctly highlight if playing and visible, or clear highlights otherwise.
    highlightPlayingSong();
});


// Popup functionality
document.addEventListener("DOMContentLoaded", function () {
    const aboutButton = document.getElementById("aboutBtn");
    const popup = document.getElementById("popup");
    const closeBtn = document.querySelector(".close-btn");

    if (aboutButton && popup && closeBtn) { // Check if elements exist
        aboutButton.addEventListener("click", function () {
            popup.style.display = "block";
        });

        closeBtn.addEventListener("click", function () {
            popup.style.display = "none";
        });

        window.addEventListener("click", function (e) {
            if (e.target === popup) {
                popup.style.display = "none";
            }
        });
    } else {
        console.warn("About button, popup, or close button not found. Popup functionality may not work.");
    }
});

// Initial highlight on page load (after elements are created and data is loaded)
audioElement.addEventListener('loadedmetadata', () => {
    totalTimeSpan.textContent = formatTime(audioElement.duration);
    highlightPlayingSong();
    // Metadata is handled by playSelectedSong(), no need to duplicate here.
});











