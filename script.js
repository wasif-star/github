console.log(`Script.js initializing`);

let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {

    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as);

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // songs.push(element.href);
            songs.push(element.href.split(`/${folder}/`)[1]);
            // songs.push(element.href.split("/songs/")[1]);
        }
    }
    // console.log(songs);
    // return songs

    // Show all the songs in the playlist.
    let songUl = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>         
                                <img class="invert" src="assests/music.svg" alt="Music">
                                <div class="info">
                                    <div class="last"> ${song} </div>
                                    <div>Wasif Jutt</div>
                                </div>
                                <div class="playNow">
                                    <div>Play Now</div>
                                    <img src="assests/play.svg" alt="Play">
                                </div></li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currentFolder}/` + track
    // currentSong.src = `/${folder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "assests/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors);
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        // console.log(e.href);
        if (e.href.includes("/songs/")) {
            // console.log(e.href.split("/").slice(-1)[0]);
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder.
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `
             <div data-folder="${folder}"  class="card rounded">
                        <div class="play">
                            <img src="assests/play.svg" alt="Play">
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpg" alt="Error">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked.
    // currentTarget very Imp.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        });
    });
}

(async () => {

    // Get the list of all the songs.
    // await getSongs("songs/ncs");
    await getSongs("songs/cs");
    playMusic(songs[0], true)

    // Display all the albums on the page.
    displayAlbums();

    // currentSong.src = songs[0];

    // Attach an event listener to play.
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assests/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "assests/play.svg";
        }
    });

    // Listen for timeupdate event.
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}:${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar.
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add an event listener for hamburger.
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close the hamburger.
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Add an event listener to previous.
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next.
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume.
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        // console.log(`Setting volume to ${e.target.value}`);
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to mute the track.
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        // console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

})();


// let a = "http://127.0.0.1:5500/songs/Song-4.mp3";
// a.split("");

// Play the first song.
// var audio = new Audio(songs[0]);
// audio.play();

// audio.addEventListener("loadeddata", () => {
//     console.log(audio.duration, audio.currentSrc, audio.currentTime);
//     // The duration variable now holds the duration (in seconds) of the audio clip
// })
