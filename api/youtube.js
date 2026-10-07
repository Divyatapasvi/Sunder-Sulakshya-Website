const CHANNEL_HANDLE = "@Sulakshyamatimataji";

const CACHE_TIME = 60 * 1000;

let cache = {
    data: null,
    expires: 0
};

/**
 * Make a request to YouTube Data API v3
 */
async function youtubeRequest(endpoint, params = {}) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "YOUTUBE_API_KEY is not configured in Vercel."
        );
    }

    const searchParams = new URLSearchParams({
        ...params,
        key: apiKey
    });

    const url =
        `https://www.googleapis.com/youtube/v3/${endpoint}?` +
        searchParams.toString();

    const response = await fetch(url);

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            `YouTube API returned an invalid response (${response.status}).`
        );
    }

    if (!response.ok) {
        const apiMessage =
            data?.error?.message ||
            "YouTube API request failed.";

        const reason =
            data?.error?.errors?.[0]?.reason;

        throw new Error(
            reason
                ? `${apiMessage} (${reason})`
                : apiMessage
        );
    }

    return data;
}


/**
 * Get YouTube Channel ID from channel handle
 */
async function getChannelId() {
    const data = await youtubeRequest(
        "channels",
        {
            part: "id",
            forHandle: CHANNEL_HANDLE
        }
    );

    if (!data.items || data.items.length === 0) {
        throw new Error(
            `YouTube channel ${CHANNEL_HANDLE} was not found.`
        );
    }

    return data.items[0].id;
}


/**
 * Get currently LIVE stream
 */
async function getLiveStream(channelId) {
    const searchData = await youtubeRequest(
        "search",
        {
            part: "snippet",
            channelId: channelId,
            eventType: "live",
            type: "video",
            order: "date",
            maxResults: "1"
        }
    );

    if (
        !searchData.items ||
        searchData.items.length === 0
    ) {
        return null;
    }

    const videoId =
        searchData.items[0]?.id?.videoId;

    if (!videoId) {
        return null;
    }

    const videoData = await youtubeRequest(
        "videos",
        {
            part: "snippet,liveStreamingDetails",
            id: videoId
        }
    );

    if (
        !videoData.items ||
        videoData.items.length === 0
    ) {
        return null;
    }

    const video = videoData.items[0];

    return {
        videoId: video.id,

        title:
            video.snippet?.title ||
            "Live Class",

        description:
            video.snippet?.description ||
            "",

        thumbnail:
            video.snippet?.thumbnails?.high?.url ||
            video.snippet?.thumbnails?.medium?.url ||
            video.snippet?.thumbnails?.default?.url ||
            "",

        videoUrl:
            `https://www.youtube.com/watch?v=${video.id}`,

        publishedAt:
            video.snippet?.publishedAt ||
            null,

        actualStartTime:
            video.liveStreamingDetails?.actualStartTime ||
            null,

        concurrentViewers:
            video.liveStreamingDetails?.concurrentViewers ||
            null
    };
}


/**
 * Get all playlists from the channel
 */
async function getPlaylists(channelId) {
    const playlists = [];

    let pageToken = "";

    do {
        const params = {
            part: "snippet,contentDetails",
            channelId: channelId,
            maxResults: "50"
        };

        if (pageToken) {
            params.pageToken = pageToken;
        }

        const data = await youtubeRequest(
            "playlists",
            params
        );

        if (data.items) {
            for (const playlist of data.items) {
                playlists.push({
                    id: playlist.id,

                    title:
                        playlist.snippet?.title ||
                        "Untitled Playlist",

                    description:
                        playlist.snippet?.description ||
                        "",

                    thumbnail:
                        playlist.snippet?.thumbnails?.high?.url ||
                        playlist.snippet?.thumbnails?.medium?.url ||
                        playlist.snippet?.thumbnails?.default?.url ||
                        "",

                    videoCount:
                        playlist.contentDetails?.itemCount ||
                        0,

                    url:
                        `https://www.youtube.com/playlist?list=${playlist.id}`,

                    publishedAt:
                        playlist.snippet?.publishedAt ||
                        null
                });
            }
        }

        pageToken = data.nextPageToken || "";

    } while (pageToken && playlists.length < 150);

    return playlists;
}


/**
 * Main Vercel Serverless API
 */
export default async function handler(request, response) {

    // Only GET requests are allowed
    if (request.method !== "GET") {
        response.setHeader(
            "Allow",
            "GET"
        );

        return response.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    // CORS
    response.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET"
    );

    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Cache response
    response.setHeader(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=120"
    );


    try {

        /*
         * Return cached data if still valid
         */
        if (
            cache.data &&
            Date.now() < cache.expires
        ) {
            return response.status(200).json(
                cache.data
            );
        }


        /*
         * Get channel ID
         */
        const channelId =
            await getChannelId();


        /*
         * Fetch LIVE stream and playlists
         */
        const [
            live,
            playlists
        ] = await Promise.all([
            getLiveStream(channelId),
            getPlaylists(channelId)
        ]);


        /*
         * Final response
         */
        const result = {
            success: true,

            channel: {
                handle: CHANNEL_HANDLE,

                url:
                    `https://www.youtube.com/${CHANNEL_HANDLE}`
            },

            live: live,

            playlists: playlists,

            updatedAt:
                new Date().toISOString()
        };


        /*
         * Save cache
         */
        cache.data = result;

        cache.expires =
            Date.now() + CACHE_TIME;


        return response
            .status(200)
            .json(result);

    } catch (error) {

        console.error(
            "YouTube API Error:",
            error
        );


        return response
            .status(500)
            .json({
                success: false,

                error:
                    error?.message ||
                    "Unable to load YouTube data."
            });
    }
}