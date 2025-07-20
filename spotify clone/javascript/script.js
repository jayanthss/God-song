let currentscr = new Audio();
let songs;
let currfolder;
let songul;
let volumes;
let songs_length;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsong(folder) {
  currfolder = folder;
  let data = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let song = await data.text();
  let div = document.createElement("div");
  div.innerHTML = song;
  let as = div.getElementsByTagName("a");
  // console.log(as);

  let newl = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      newl.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // console.log(newl);

  songul = document
    .querySelector(".showing_songs")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";

  // let songname = songs
  for (const songname of newl) {
    // console.log("inside", songname);

    songul.innerHTML =
      songul.innerHTML +
      `<li>
                <div class="musicinfo">
                  <div class="musicname">
                    <img src="sidemusic/music.svg" width="35px" alt="" />
                    <div class="songname">
                      <div>${songname.replaceAll("%20", " ")}</div>
                      
                      
                    </div>
                  </div>
                  <div class="end">
                    <img class = "side_play" id="invert" src="music bar/play icon.svg" width="26px" alt="" />
                  </div>
                </div>
              </li>`;
  }

  let song_arr = Array.from(
    document.querySelector(".showing_songs").getElementsByTagName("li")
  );
  song_arr.forEach((e) => {
    // e.addEventListener("click", () => {
    //   document.querySelector(".left").style.left = -100 + "%";
    // });
    e.addEventListener("click", () => {
      playsong(e.querySelector(".songname").firstElementChild.innerHTML.trim());
    });
  });

  return newl;
}

// play the song
const playsong = (track, pause = false) => {
  currentscr.pause(); // always pause first
  currentscr.src = `/${currfolder}/` + track;

  document.querySelector(".namesss").innerHTML = decodeURI(
    track.split(".mp3")[0]
  );

  if (!pause) {
    // Wait for the audio to be ready before playing
    const playWhenReady = () => {
      currentscr
        .play()
        .then(() => {
          playss.src = "img/pause.svg";
        })
        .catch((err) => {
          console.log("Play error:", err);
        });

      currentscr.removeEventListener("canplaythrough", playWhenReady);
    };

    currentscr.addEventListener("canplaythrough", playWhenReady);
  }
};

// displaying Album

async function displayalbum() {
  let data = await fetch("http://127.0.0.1:3000/songs/");
  let song = await data.text();
  let div = document.createElement("div");
  div.innerHTML = song;
  let a_tag = div.getElementsByTagName("a");

  let album_ = [];

  for (let index = 0; index < a_tag.length; index++) {
    const element = a_tag[index];
    let card_container = document.querySelector(".cards");

    if (element.href.includes("/songs")) {
      let folder = element.href.split("/songs/")[1];

      let dat_set = folder.split("/")[0];

      let data = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let fol_info = await data.json();
      card_container.innerHTML =
        card_container.innerHTML +
        `<div data-folder="${dat_set}" class="card1 cardhover">
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <div>${fol_info.title}</div>
              <p>${fol_info.description}</p>
              <img class="play" src="icons/play_musicbar.png" alt="" />
            </div>
`;
    }
    // Playlist Songs

    Array.from(document.getElementsByClassName("card1")).forEach((e) => {
      e.addEventListener("click", async (items) => {
        songul.innerHTML = "";
        songs = await getsong(`songs/${items.currentTarget.dataset.folder}`);
        playsong(songs[0]);
      });
    });
  }
}

async function main() {
  songs = await getsong("songs/mass");
  // console.log(songs);
  playsong(songs[0], true);
  await displayalbum();

  // audio.play();

  //play and pause Button
  playss.addEventListener("click", () => {
    if (currentscr.paused) {
      currentscr.play();
      playss.src = "img/pause.svg";
    } else {
      currentscr.pause();
      playss.src = "music bar/player.svg";
    }
  });

  //song duration
  currentscr.addEventListener("timeupdate", () => {
    document.querySelector(".start").innerHTML = formatTime(
      currentscr.currentTime
    );
    document.querySelector(".endsss").innerHTML = formatTime(
      currentscr.duration
    );

    songs_length = formatTime(currentscr.duration);

    document.querySelector(".circless").style.left =
      (currentscr.currentTime / currentscr.duration) * 100 + "%";
  });

  //seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let par = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    // console.log(par);
    document.querySelector(".circless").style.left = par + "%";
    currentscr.currentTime = (currentscr.duration * par) / 100;
  });

  // for phone arrow bar
  document.querySelector(".sideshow").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -100 + "%";
  });

  // Next Button
  document.querySelector("#next").addEventListener("click", () => {
    let index = songs.indexOf(currentscr.src.split(`/${currfolder}/`)[1]);

    if (index === songs.length - 1) {
      // console.log("Reached To LAst");
      playsong(songs[0]);
    } else {
      playsong(songs[index + 1]);
    }
    // console.log(index);
  });

  // previous Button
  document.querySelector("#previous").addEventListener("click", () => {
    let index = songs.indexOf(currentscr.src.split(`/${currfolder}/`)[1]);

    if (index === 0) {
      // console.log("Reached To First");
      playsong(songs[songs.length - 1]);
    } else {
      playsong(songs[index - 1]);
    }
    // console.log(index);
  });
  // volume bar

  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      volumes = e.target.value / 100;
      console.log(volumes);
      currentscr.volume = volumes;
    });

  //for muting the volume

  let mute_ = document.querySelector(".volume").firstElementChild;
  mute_.addEventListener("click", () => {
    if (currentscr.muted) {
      currentscr.muted = false;
      mute_.src = "img/volume.svg";

      let ja = document
        .querySelector(".volume")
        .getElementsByTagName("input")[0];
      ja.value = volumes * 100;
      currentscr.volume = volumes;
      console.log("muted", volumes);
    } else {
      currentscr.muted = true;
      mute_.src = "img/mute.svg";
      let ja = document
        .querySelector(".volume")
        .getElementsByTagName("input")[0];
      ja.value = 0;
    }
  });

  currentscr.addEventListener("ended", (e) => {
    console.log(songs);
    let nex = [];
    for (let index = 0; index < songs.length; index++) {
      const element = songs[index];
      let my = element.replaceAll("%20", " ").split(".mp3")[0];
      nex.push(my);
    }

    let pres_song = document.querySelector(".namesss").innerHTML;
    let in_of = nex.indexOf(pres_song);
    nex.forEach((e) => {
      if (nex[in_of] == pres_song && in_of != songs.length - 1) {
        playsong(songs[in_of + 1]);
      } else {
        currentscr.pause;
        playss.src = "music bar/player.svg";
      }
    });
  });
}

main();
