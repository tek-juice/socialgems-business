import { useState, useEffect } from "react";
import { FiExternalLink } from "react-icons/fi";

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const apiKey = import.meta.env.VITE_LINK_PREVIEW_API_KEY;

        if (!apiKey) {
          const domain = new URL(url).hostname;
          setPreview({
            title: domain,
            description: url,
            image: null,
            url: url,
          });
          setLoading(false);
          return;
        }

        let parsedUrl;
        try {
          parsedUrl = new URL(url);
        } catch (e) {
          throw new Error("Invalid URL provided");
        }

        const response = await fetch(
          `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(
            url
          )}`
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.image) {
          setPreview({
            title: data.title || parsedUrl.hostname,
            description: data.description || url,
            image: data.image,
            url: url,
          });
        } else {
          setPreview({
            title: parsedUrl.hostname,
            description: url,
            image: null,
            url: url,
          });
        }
      } catch (error) {
        console.error("Failed to fetch rich link preview:", error);

        try {
          const domain = new URL(url).hostname;
          setPreview({
            title: domain,
            description: url,
            image: null,
            url: url,
          });
        } catch (e) {
          setPreview({
            title: "Link Preview",
            description: url,
            image: null,
            url: url,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 p-3 bg-secondary/5 rounded-xl border border-secondary/20 animate-pulse">
        <div className="h-4 bg-secondary/20 rounded mb-2"></div>
        <div className="h-3 bg-secondary/10 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200 text-red-600 text-sm">
        <p>Couldn't load preview</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-1 inline-block"
        >
          Open link directly
        </a>
      </div>
    );
  }

  if (!preview) return null;

  if (preview.image) {
    return (
      <div
        className="mt-2 rounded-xl border border-secondary/20 overflow-hidden cursor-pointer hover:shadow-md transition-all"
        onClick={() => window.open(url, "_blank")}
      >
        <div className="relative h-40 bg-secondary/10">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentElement.className = "hidden";
            }}
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-secondary line-clamp-2 mb-1">
            {preview.title}
          </h3>
          <p className="text-xs text-secondary/60 line-clamp-2 mb-2">
            {preview.description}
          </p>
          <div className="flex items-center gap-1">
            <FiExternalLink className="w-3 h-3 text-secondary/40" />
            <span className="text-xs text-secondary/40 truncate">
              {new URL(url).hostname}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-2 p-3 bg-secondary/5 rounded-xl border border-secondary/20 cursor-pointer hover:bg-secondary/10 transition-colors"
      onClick={() => window.open(url, "_blank")}
    >
      <div className="flex items-center gap-2 mb-1">
        <FiExternalLink className="w-4 h-4 text-secondary/60" />
        <p className="text-xs font-medium text-secondary truncate">
          {preview.title}
        </p>
      </div>
      <p className="text-xs text-secondary/70 truncate">
        {preview.description}
      </p>
    </div>
  );
};

export default LinkPreview;
