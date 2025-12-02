// Map tabId -> { video: { url, size }, audio: { url, size } }
const largestPerTab = new Map();

/**
 * Cut everything from "&range=" (or "?range=") to the end of the URL.
 */
function stripRangeAndAfter(originalUrl) {
  const idxAmp = originalUrl.indexOf("&range=");
  const idxQ = originalUrl.indexOf("?range=");

  let idx = -1;
  if (idxQ !== -1) idx = idxQ;
  else if (idxAmp !== -1) idx = idxAmp;

  if (idx === -1) {
    return originalUrl;
  }

  return originalUrl.slice(0, idx);
}

/**
 * Extract size:
 * 1) Prefer `clen` query param (Google total size in bytes)
 * 2) Fallback to `Content-Length` header
 */
function getSizeFromDetails(details) {
  let size = 0;

  // Try `clen` from query
  try {
    const u = new URL(details.url);
    const clen = u.searchParams.get("clen");
    if (clen) {
      const parsedClen = parseInt(clen, 10);
      if (!isNaN(parsedClen) && parsedClen > 0) {
        size = parsedClen;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to Content-Length
  if (size === 0 && Array.isArray(details.responseHeaders)) {
    for (const h of details.responseHeaders) {
      if (h.name && h.name.toLowerCase() === "content-length") {
        const parsed = parseInt(h.value, 10);
        if (!isNaN(parsed) && parsed > 0) {
          size = parsed;
        }
        break;
      }
    }
  }

  return size;
}

/**
 * Decide if this URL is "audio".
 */
function isAudioUrl(url) {
  const lower = url.toLowerCase();
  if (lower.includes("mime=audio")) return true;
  if (lower.includes("audio/mp4")) return true;
  if (lower.includes("itag=140")) return true; // Drive/YouTube audio itag
  return false;
}

/**
 * Capture video+audio per tab.
 */
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const { url, tabId } = details;
    if (tabId < 0) return; // not a normal tab

    const size = getSizeFromDetails(details);
    const audio = isAudioUrl(url);

    let entry = largestPerTab.get(tabId);
    if (!entry) {
      entry = { video: null, audio: null };
      largestPerTab.set(tabId, entry);
    }

    if (audio) {
      if (!entry.audio || size > entry.audio.size) {
        entry.audio = { url, size };
        console.log(
          "[Downloader][AUDIO] Updated for tab",
          tabId,
          "size",
          size,
          "url",
          url
        );
      }
    } else {
      if (!entry.video || size > entry.video.size) {
        entry.video = { url, size };
        console.log(
          "[Downloader][VIDEO] Updated for tab",
          tabId,
          "size",
          size,
          "url",
          url
        );
      }
    }
  },
  {
    urls: ["*://*/*videoplayback*"]
  },
  ["responseHeaders"]
);

/**
 * On icon click:
 *  - Download video and audio files directly with maximum quality
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || typeof tab.id !== "number") return;

  const entry = largestPerTab.get(tab.id);
  if (!entry || (!entry.video && !entry.audio)) {
    console.warn(
      "[Downloader] No videoplayback video/audio captured for tab",
      tab.id
    );
    return;
  }

  const videoUrl = entry.video ? stripRangeAndAfter(entry.video.url) : null;
  const audioUrl = entry.audio ? stripRangeAndAfter(entry.audio.url) : null;

  // Download video if available
  if (videoUrl) {
    try {
      await chrome.downloads.download({
        url: videoUrl,
        filename: "video.mp4",
        saveAs: true
      });
      console.log("[Downloader] Video download started:", videoUrl);
    } catch (err) {
      console.error("[Downloader] Failed to download video:", err);
    }
  }

  // Download audio if available
  if (audioUrl) {
    try {
      await chrome.downloads.download({
        url: audioUrl,
        filename: "audio.mp4",
        saveAs: true
      });
      console.log("[Downloader] Audio download started:", audioUrl);
    } catch (err) {
      console.error("[Downloader] Failed to download audio:", err);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  largestPerTab.delete(tabId);
});
