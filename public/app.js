const YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/@Sulakshyamatimataji";

const liveContainer =
  document.getElementById("liveContainer");

const liveStatus =
  document.getElementById("liveStatus");

const playlistGrid =
  document.getElementById("playlistGrid");

const playlistCount =
  document.getElementById("playlistCount");

const playlistError =
  document.getElementById("playlistError");

document.getElementById("year").textContent =
  new Date().getFullYear();


/* ---------------------------------------------
   HELPERS
--------------------------------------------- */

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function setLiveStatus(text, active = false) {

  liveStatus.classList.toggle(
    "active",
    active
  );

  liveStatus.innerHTML = `
    <span></span>
    ${escapeHTML(text)}
  `;
}


/* ---------------------------------------------
   OFFLINE CARD
--------------------------------------------- */

function showOfflineCard() {

  liveContainer.innerHTML = `

    <div class="offline-card">

      <div class="offline-symbol">
        ✦
      </div>

      <h3>
        No live class right now
      </h3>

      <p>
        When Sulakshya Mati Mataji starts a
        YouTube live stream, the live thumbnail,
        title and teaching information will
        automatically appear here.
      </p>

      <a
        href="${YOUTUBE_CHANNEL_URL}"
        target="_blank"
        rel="noopener noreferrer"
        class="watch-button"
      >
        Open YouTube Channel ↗
      </a>

    </div>

  `;
}


/* ---------------------------------------------
   LIVE CARD
--------------------------------------------- */

function showLive(video) {

  const title =
    video.title ||
    "Live Class";

  const description =
    video.description ||
    "Live teaching from Sulakshya Mati Mataji.";

  const thumbnail =
    video.thumbnail ||
    "";

  const videoUrl =
    video.videoUrl ||
    YOUTUBE_CHANNEL_URL;


  liveContainer.innerHTML = `

    <div class="live-card">

      <a
        href="${videoUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="live-thumbnail"
      >

        <img
          src="${thumbnail}"
          alt="${escapeHTML(title)}"
        />

      </a>


      <div class="live-content">

        <div class="live-badge">
          <span>●</span>
          LIVE NOW
        </div>


        <h3 class="live-title">
          ${escapeHTML(title)}
        </h3>


        <p class="live-description">
          ${escapeHTML(
            description.length > 280
              ? description.substring(0, 280) + "..."
              : description
          )}
        </p>


        <a
          href="${videoUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="watch-button"
        >
          Watch Live ↗
        </a>

      </div>

    </div>

  `;
}


/* ---------------------------------------------
   PLAYLISTS
--------------------------------------------- */

function showPlaylists(playlists) {

  if (!playlists || playlists.length === 0) {

    playlistGrid.innerHTML = `
      <div class="message-box">
        No public playlists were found on the channel.
      </div>
    `;

    playlistCount.textContent = "";

    return;
  }


  playlistCount.textContent =
    `${playlists.length} playlists`;


  playlistGrid.innerHTML =
    playlists
      .map((playlist) => {

        const title =
          playlist.title ||
          "Untitled Playlist";

        const thumbnail =
          playlist.thumbnail ||
          "/logo.png";

        const count =
          playlist.videoCount ?? "";

        const url =
          playlist.url;


        return `

          <a
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
            class="playlist-card"
          >

            <div class="playlist-thumbnail">

              <img
                src="${thumbnail}"
                alt="${escapeHTML(title)}"
                loading="lazy"
              />

              <span class="playlist-play">
                ▶
              </span>

            </div>


            <div class="playlist-info">

              <h3>
                ${escapeHTML(title)}
              </h3>

              <p>
                ${
                  count !== ""
                    ? `${count} videos · `
                    : ""
                }
                Open playlist on YouTube ↗
              </p>

            </div>

          </a>

        `;

      })
      .join("");

}


/* ---------------------------------------------
   LOAD DATA FROM OUR SERVER
--------------------------------------------- */

async function loadYouTubeData() {

  try {

    /*
     * IMPORTANT:
     *
     * This calls OUR backend.
     * The YouTube API key is NEVER
     * placed in this browser-side file.
     */

    const response =
      await fetch(
        "/api/youtube",
        {
          method: "GET",

          headers: {
            "Accept": "application/json"
          },

          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Server returned ${response.status}`
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.error ||
        "YouTube API failed."
      );

    }


    /* LIVE */

    if (data.live) {

      setLiveStatus(
        "Live now",
        true
      );

      showLive(
        data.live
      );

    } else {

      setLiveStatus(
        "No live class"
      );

      showOfflineCard();

    }


    /* PLAYLISTS */

    showPlaylists(
      data.playlists || []
    );


    playlistError.classList.add(
      "hidden"
    );


  } catch (error) {

    console.error(
      "YouTube loading error:",
      error
    );


    setLiveStatus(
      "Unable to refresh YouTube"
    );


    liveContainer.innerHTML = `

      <div class="offline-card">

        <div class="offline-symbol">
          !
        </div>

        <h3>
          YouTube data temporarily unavailable
        </h3>

        <p>
          Please visit the YouTube channel directly
          to see the latest classes and live streams.
        </p>

        <a
          href="${YOUTUBE_CHANNEL_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="watch-button"
        >
          Open YouTube ↗
        </a>

      </div>

    `;


    playlistGrid.innerHTML = "";


    playlistError.classList.remove(
      "hidden"
    );


    playlistError.textContent =
      "We could not load the playlists right now.";

  }

}


/* ---------------------------------------------
   INITIAL LOAD
--------------------------------------------- */

loadYouTubeData();


/* ---------------------------------------------
   AUTO REFRESH
--------------------------------------------- */

setInterval(
  loadYouTubeData,
  2 * 60 * 1000
);