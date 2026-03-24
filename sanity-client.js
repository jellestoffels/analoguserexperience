// Sanity.io vanilla JS client — project: yxgcufla | dataset: production
// Uses the Sanity HTTP API directly so no bundler is needed.

(function () {
  const PROJECT_ID = 'yxgcufla';
  const DATASET = 'production';
  const API_VERSION = '2024-01-01';

  window.sanityClient = {
    /**
     * Run a GROQ query against the Sanity API.
     * @param {string} query - GROQ query string
     * @param {Object} params - Optional named parameters
     * @returns {Promise<any>}
     */
    async fetch(query, params = {}) {
      let paramStr = '';
      for (const [key, val] of Object.entries(params)) {
        paramStr += `&$${key}=${encodeURIComponent(JSON.stringify(val))}`;
      }
      const url =
        `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
        `?query=${encodeURIComponent(query)}${paramStr}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sanity API ${res.status}`);
      const { result } = await res.json();
      return result;
    },

    /**
     * Build a Sanity CDN image URL from an asset _ref string.
     * @param {string} ref  e.g. "image-abc123-800x600-jpg"
     * @param {number} [width=1200]
     * @returns {string}
     */
    imageUrl(ref, width = 1200) {
      if (!ref) return '';
      const m = ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(\w+)$/);
      if (!m) return '';
      const [, id, dims, ext] = m;
      return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dims}.${ext}?w=${width}&auto=format`;
    },

    /**
     * Return embed info for a video URL.
     * @param {string} url
     * @returns {{ type: 'iframe'|'video', src: string }|null}
     */
    videoEmbed(url) {
      if (!url) return null;
      const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
      const vi = url.match(/vimeo\.com\/(\d+)/);
      if (vi) return { type: 'iframe', src: `https://player.vimeo.com/video/${vi[1]}` };
      return { type: 'video', src: url };
    },
  };
})();