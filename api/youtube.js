<<<<<<< HEAD
const CHANNEL_HANDLE =
  "@Sulakshyamatimataji";


/* ---------------------------------------------
   CACHE
--------------------------------------------- */

let cache = {
  data: null,
  expires: 0
};

const CACHE_TIME =
  60 * 1000;


/* ---------------------------------------------
   YOUTUBE API REQUEST
--------------------------------------------- */

async function youtubeRequest(
  endpoint,
  params
) {

  const apiKey =
    process.env.YOUTUBE_API_KEY;


  if (!apiKey) {

    throw new Error(
      "YOUTUBE_API_KEY is not configured."
    );

  }


  const searchParams =
    new URLSearchParams({
      ...params,
      key: apiKey
    });


  const url =
    `https://www.googleapis.com/youtube/v3/${endpoint}?${searchParams}`;


  const response =
    await fetch(url);


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "YouTube API error:",
      data
    );


    throw new Error(
      data?.error?.message ||
      "YouTube API request failed."
    );

  }


  return data;
}


/* ---------------------------------------------
   GET CHANNEL ID
--------------------------------------------- */

async function getChannelId() {

  const data =
    await youtubeRequest(
      "channels",
      {
        part: "id",
        forHandle: CHANNEL_HANDLE
      }
    );


  const channel =
    data.items?.[0];


  if (!channel) {

    throw new Error(
      "YouTube channel not found."
    );

  }


  return channel.id;
}


/* ---------------------------------------------
   CHECK LIVE STREAM
--------------------------------------------- */

async function getLiveStream(
  channelId
) {

  const data =
    await youtubeRequest(
      "search",
      {
        part: "snippet",
        channelId,
        eventType: "live",
        type: "video",
        order: "date",
        maxResults: "1"
      }
    );


  const item =
    data.items?.[0];


  if (!item) {

    return null;

  }


  const videoId =
    item.id?.videoId;


  if (!videoId) {

    return null;

  }


  const videoData =
    await youtubeRequest(
      "videos",
      {
        part:
          "snippet,liveStreamingDetails",

        id: videoId
      }
    );


  const video =
    videoData.items?.[0];


  if (!video) {

    return null;

  }


  const snippet =
    video.snippet || {};


  const thumbnails =
    snippet.thumbnails || {};


  const thumbnail =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


  return {

    id: videoId,

    title:
      snippet.title ||
      "Live Class",

    description:
      snippet.description ||
      "",

    thumbnail,

    videoUrl:
      `https://www.youtube.com/watch?v=${videoId}`

  };

}


/* ---------------------------------------------
   GET ALL PLAYLISTS
--------------------------------------------- */

async function getPlaylists(
  channelId
) {

  const playlists = [];

  let pageToken = "";


  do {

    const params = {

      part:
        "snippet,contentDetails",

      channelId,

      maxResults:
        "50"

    };


    if (pageToken) {

      params.pageToken =
        pageToken;

    }


    const data =
      await youtubeRequest(
        "playlists",
        params
      );


    for (
      const item
      of data.items || []
    ) {

      const snippet =
        item.snippet || {};


      const thumbnails =
        snippet.thumbnails || {};


      const thumbnail =
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        "/logo.png";


      playlists.push({

        id:
          item.id,

        title:
          snippet.title ||
          "Untitled Playlist",

        description:
          snippet.description ||
          "",

        thumbnail,

        videoCount:
          item.contentDetails?.itemCount ??
          "",

        url:
          `https://www.youtube.com/playlist?list=${item.id}`

      });

    }


    pageToken =
      data.nextPageToken || "";


    /*
     * Safety limit.
     */

    if (playlists.length >= 150) {

      break;

    }


  } while (pageToken);


  return playlists;
}


/* ---------------------------------------------
   API HANDLER
--------------------------------------------- */

export default async function handler(
  request,
  response
) {

  if (request.method !== "GET") {

    return response
      .status(405)
      .json({

        success: false,

        error:
          "Method not allowed."

      });

  }


  /*
   * Browser can call this endpoint.
   */

  response.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );


  /*
   * Server/edge cache.
   */

  response.setHeader(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=120"
  );


  try {

    /*
     * Use cached result when available.
     */

    if (
      cache.data &&
      Date.now() < cache.expires
    ) {

      return response
        .status(200)
        .json(cache.data);

    }


    /*
     * Find channel.
     */

    const channelId =
      await getChannelId();


    /*
     * Check live broadcast.
     */

    const live =
      await getLiveStream(
        channelId
      );


    /*
     * Get playlists.
     */

    const playlists =
      await getPlaylists(
        channelId
      );


    const result = {

      success: true,

      channel: {

        handle:
          CHANNEL_HANDLE,

        url:
          "https://www.youtube.com/@Sulakshyamatimataji"

      },

      live,

      playlists,

      updatedAt:
        new Date().toISOString()

    };


    /*
     * Save cache.
     */

    cache = {

      data: result,

      expires:
        Date.now() + CACHE_TIME

    };


    return response
      .status(200)
      .json(result);


  } catch (error) {

    console.error(
      "YouTube server error:",
      error
    );


    return response
      .status(500)
      .json({

        success: false,

        error:
          "Unable to load YouTube data."

      });

  }

=======
const CHANNEL_HANDLE =
  "@Sulakshyamatimataji";


/* ---------------------------------------------
   CACHE
--------------------------------------------- */

let cache = {
  data: null,
  expires: 0
};

const CACHE_TIME =
  60 * 1000;


/* ---------------------------------------------
   YOUTUBE API REQUEST
--------------------------------------------- */

async function youtubeRequest(
  endpoint,
  params
) {

  const apiKey =
    process.env.YOUTUBE_API_KEY;


  if (!apiKey) {

    throw new Error(
      "YOUTUBE_API_KEY is not configured."
    );

  }


  const searchParams =
    new URLSearchParams({
      ...params,
      key: apiKey
    });


  const url =
    `https://www.googleapis.com/youtube/v3/${endpoint}?${searchParams}`;


  const response =
    await fetch(url);


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "YouTube API error:",
      data
    );


    throw new Error(
      data?.error?.message ||
      "YouTube API request failed."
    );

  }


  return data;
}


/* ---------------------------------------------
   GET CHANNEL ID
--------------------------------------------- */

async function getChannelId() {

  const data =
    await youtubeRequest(
      "channels",
      {
        part: "id",
        forHandle: CHANNEL_HANDLE
      }
    );


  const channel =
    data.items?.[0];


  if (!channel) {

    throw new Error(
      "YouTube channel not found."
    );

  }


  return channel.id;
}


/* ---------------------------------------------
   CHECK LIVE STREAM
--------------------------------------------- */

async function getLiveStream(
  channelId
) {

  const data =
    await youtubeRequest(
      "search",
      {
        part: "snippet",
        channelId,
        eventType: "live",
        type: "video",
        order: "date",
        maxResults: "1"
      }
    );


  const item =
    data.items?.[0];


  if (!item) {

    return null;

  }


  const videoId =
    item.id?.videoId;


  if (!videoId) {

    return null;

  }


  const videoData =
    await youtubeRequest(
      "videos",
      {
        part:
          "snippet,liveStreamingDetails",

        id: videoId
      }
    );


  const video =
    videoData.items?.[0];


  if (!video) {

    return null;

  }


  const snippet =
    video.snippet || {};


  const thumbnails =
    snippet.thumbnails || {};


  const thumbnail =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


  return {

    id: videoId,

    title:
      snippet.title ||
      "Live Class",

    description:
      snippet.description ||
      "",

    thumbnail,

    videoUrl:
      `https://www.youtube.com/watch?v=${videoId}`

  };

}


/* ---------------------------------------------
   GET ALL PLAYLISTS
--------------------------------------------- */

async function getPlaylists(
  channelId
) {

  const playlists = [];

  let pageToken = "";


  do {

    const params = {

      part:
        "snippet,contentDetails",

      channelId,

      maxResults:
        "50"

    };


    if (pageToken) {

      params.pageToken =
        pageToken;

    }


    const data =
      await youtubeRequest(
        "playlists",
        params
      );


    for (
      const item
      of data.items || []
    ) {

      const snippet =
        item.snippet || {};


      const thumbnails =
        snippet.thumbnails || {};


      const thumbnail =
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        "/logo.png";


      playlists.push({

        id:
          item.id,

        title:
          snippet.title ||
          "Untitled Playlist",

        description:
          snippet.description ||
          "",

        thumbnail,

        videoCount:
          item.contentDetails?.itemCount ??
          "",

        url:
          `https://www.youtube.com/playlist?list=${item.id}`

      });

    }


    pageToken =
      data.nextPageToken || "";


    /*
     * Safety limit.
     */

    if (playlists.length >= 150) {

      break;

    }


  } while (pageToken);


  return playlists;
}


/* ---------------------------------------------
   API HANDLER
--------------------------------------------- */

export default async function handler(
  request,
  response
) {

  if (request.method !== "GET") {

    return response
      .status(405)
      .json({

        success: false,

        error:
          "Method not allowed."

      });

  }


  /*
   * Browser can call this endpoint.
   */

  response.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );


  /*
   * Server/edge cache.
   */

  response.setHeader(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=120"
  );


  try {

    /*
     * Use cached result when available.
     */

    if (
      cache.data &&
      Date.now() < cache.expires
    ) {

      return response
        .status(200)
        .json(cache.data);

    }


    /*
     * Find channel.
     */

    const channelId =
      await getChannelId();


    /*
     * Check live broadcast.
     */

    const live =
      await getLiveStream(
        channelId
      );


    /*
     * Get playlists.
     */

    const playlists =
      await getPlaylists(
        channelId
      );


    const result = {

      success: true,

      channel: {

        handle:
          CHANNEL_HANDLE,

        url:
          "https://www.youtube.com/@Sulakshyamatimataji"

      },

      live,

      playlists,

      updatedAt:
        new Date().toISOString()

    };


    /*
     * Save cache.
     */

    cache = {

      data: result,

      expires:
        Date.now() + CACHE_TIME

    };


    return response
      .status(200)
      .json(result);


  } catch (error) {

    console.error(
      "YouTube server error:",
      error
    );


    return response
      .status(500)
      .json({

        success: false,

        error:
          "Unable to load YouTube data."

      });

  }

>>>>>>> a1eaeac9cb3f17eee8b0e2a716c35bfd488433ad
}