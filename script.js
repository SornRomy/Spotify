console.log("Welcome to");

// Initialize the Variables
let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let songItems = Array.from(document.getElementsByClassName('songItem'));

let songs = [
    {songName: "ឱក្រមុំមុំបងអើយ", filePath: "songs/1.mp3", coverPath: "covers/piset.jpg"},
    {songName: "មួយទៅមួយ", filePath: "songs/2.mp3", coverPath: "covers/piset.jpg"},
    {songName: "Again and Again", filePath: "songs/3.mp3", coverPath: "covers/huuhai.jpg"},
    {songName: "J+O [Remix]", filePath: "songs/4.mp3", coverPath: "covers/vannda.jpg"},
    {songName: "AH TOUR", filePath: "songs/5.mp3", coverPath: "covers/gmangz.jpg"},
    {songName: "Low-Low", filePath: "songs/6.mp3", coverPath: "covers/flo.jpg"},
    {songName: "Boom, Shake, Drop", filePath: "songs/7.mp3", coverPath: "covers/flo.jpg"},
    {songName: "Die With A Smile", filePath: "songs/8.mp3", coverPath: "covers/Bruno-000000-80-0-0.jpg"},
    {songName: "The Gangster Luv Story", filePath: "songs/9.mp3", coverPath: "covers/4t5.jpg"}, 
    {songName: "Chanavinlyna", filePath: "songs/10.mp3", coverPath: "covers/sachdom.jpg"},
    
]

songItems.forEach((element, i)=>{ 
    element.getElementsByTagName("img")[0].src = songs[i].coverPath; 
    element.getElementsByClassName("songName")[0].innerText = songs[i].songName; 
})
 

// Handle play/pause click
masterPlay.addEventListener('click', ()=>{
    if(audioElement.paused || audioElement.currentTime<=0){
        audioElement.play();
        masterPlay.classList.remove('fa-play-circle');
        masterPlay.classList.add('fa-pause-circle');
        
        gif.style.opacity = 1;
        highlightPlayingSong(); // Highlight the new song
    }
    else{
        audioElement.pause();
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
        highlightPlayingSong(); // Highlight the new song
    }
})
// Listen to Events
audioElement.addEventListener('timeupdate', ()=>{ 
    // Update Seekbar
    progress = parseInt((audioElement.currentTime/audioElement.duration)* 100); 
    myProgressBar.value = progress;
})

myProgressBar.addEventListener('change', ()=>{
    audioElement.currentTime = myProgressBar.value * audioElement.duration/100;
})

const makeAllPlays = ()=>{
    Array.from(document.getElementsByClassName('songItemPlay')).forEach((element)=>{
        element.classList.remove('fa-pause-circle');
        element.classList.add('fa-play-circle');
    })
}

Array.from(document.getElementsByClassName('songItemPlay')).forEach((element)=>{
    element.addEventListener('click', (e)=>{ 
        makeAllPlays();
        songIndex = parseInt(e.target.id);
        e.target.classList.remove('fa-play-circle');
        e.target.classList.add('fa-pause-circle');
        audioElement.src = `songs/${songIndex+1}.mp3`;
        masterSongName.innerText = songs[songIndex].songName;
        audioElement.currentTime = 0;
        audioElement.play();
        
        gif.style.opacity = 1;
        masterPlay.classList.remove('fa-play-circle');
        masterPlay.classList.add('fa-pause-circle');
        makeAllPlays();
        document.getElementById(songIndex).classList.add('fa-pause-circle');
        document.getElementById(songIndex).classList.remove('fa-play-circle');
    })
})

document.getElementById('next').addEventListener('click', ()=>{
    if(songIndex>=9){
        songIndex = 0
    }
    else{
        songIndex += 1;
    }
    audioElement.src = `songs/${songIndex+1}.mp3`;
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    makeAllPlays();
    document.getElementById(songIndex).classList.add('fa-pause-circle');
    document.getElementById(songIndex).classList.remove('fa-play-circle');
    highlightPlayingSong(); // Highlight the new song

})

document.getElementById('previous').addEventListener('click', ()=>{
    if(songIndex<=0){
        songIndex = 0
    }
    else{
        songIndex -= 1;
    }
    audioElement.src = `songs/${songIndex+1}.mp3`;
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    makeAllPlays();
    document.getElementById(songIndex).classList.remove('fa-play-circle');
    document.getElementById(songIndex).classList.add('fa-pause-circle');
    
    highlightPlayingSong(); // Highlight the new song
})

//

// function aotuplay

audioElement.addEventListener('ended', () => {
    if (songIndex >= songs.length - 1) {
        songIndex = 0; // Loop back to the first song
    } else {
        songIndex += 1; // Move to the next song
    }
    audioElement.src = `songs/${songIndex + 1}.mp3`;
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    gif.style.opacity = 1;
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
    makeAllPlays(); // Reset all play icons
    document.getElementById(songIndex).classList.remove('fa-play-circle');
    document.getElementById(songIndex).classList.add('fa-pause-circle');
    highlightPlayingSong(); // Highlight the new song
});

// function aotuplay



// Rotate 



// Rotate 



// function active song

const highlightPlayingSong = () => {
    // Remove 'active' class from all songs
    songItems.forEach((item) => {
        item.classList.remove('active');
    });
    // Add 'active' class to the current song
    songItems[songIndex].classList.add('active');
};

// function active song



// function click on song in class songItem
Array.from(document.getElementsByClassName('songItem')).forEach((element, index) => {
    element.addEventListener('click', () => {
        if (songIndex === index) {
            // If the same song is clicked
            if (audioElement.paused) {
                audioElement.play();
                gif.style.opacity = 1;
                masterPlay.classList.remove('fa-play-circle');
                masterPlay.classList.add('fa-pause-circle');
                element.getElementsByClassName('songItemPlay')[0].classList.remove('fa-play-circle');
                element.getElementsByClassName('songItemPlay')[0].classList.add('fa-pause-circle');
            } else {
                audioElement.pause();
                gif.style.opacity = 0;
                masterPlay.classList.remove('fa-pause-circle');
                masterPlay.classList.add('fa-play-circle');
                element.getElementsByClassName('songItemPlay')[0].classList.remove('fa-pause-circle');
                element.getElementsByClassName('songItemPlay')[0].classList.add('fa-play-circle');
            }
        } else {
            makeAllPlays();
            songIndex = index;
            audioElement.src = `songs/${songIndex + 1}.mp3`;
            masterSongName.innerText = songs[songIndex].songName;
            audioElement.currentTime = 0;
            audioElement.play();
            gif.style.opacity = 1;
            masterPlay.classList.remove('fa-play-circle');
            masterPlay.classList.add('fa-pause-circle');
            element.getElementsByClassName('songItemPlay')[0].classList.remove('fa-play-circle');
            element.getElementsByClassName('songItemPlay')[0].classList.add('fa-pause-circle');
        }
        highlightPlayingSong(); // Highlight the current song
    });
});


// function click on song in class songItem


// hide the icon fa-play-circle


document.getElementById("0").style.display = "none";
document.getElementById("1").style.display = "none";
document.getElementById("2").style.display = "none";
document.getElementById("3").style.display = "none";
document.getElementById("4").style.display = "none";
document.getElementById("5").style.display = "none";
document.getElementById("6").style.display = "none";
document.getElementById("7").style.display = "none";
document.getElementById("8").style.display = "none";
document.getElementById("9").style.display = "none";



// hide the icon fa-play-circle



