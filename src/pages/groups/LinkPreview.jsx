import { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Try to fetch proper link preview data
        const response = await fetch(`https://api.linkpreview.net/?key=${process.env.LINK_PREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.image) {
          setPreview({
            title: data.title || new URL(url).hostname,
            description: data.description || url,
            image: data.image,
            url: url
          });
        } else {
          // Fallback to simple domain display if no image
          setPreview({
            title: new URL(url).hostname,
            description: url,
            image: null,
            url: url
          });
        }
      } catch (error) {
        // If API fails, fallback to simple domain display
        console.error('Failed to fetch rich link preview:', error);
        const domain = new URL(url).hostname;
        setPreview({
          title: domain,
          description: url,
          image: null,
          url: url
        });
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

  if (!preview) return null;

  // With image preview
  if (preview.image) {
    return (
      <div 
        className="mt-2 rounded-xl border border-secondary/20 overflow-hidden cursor-pointer hover:shadow-md transition-all"
        onClick={() => window.open(url, '_blank')}
      >
        <div className="relative h-40 bg-secondary/10">
          <img 
            src={preview.image} 
            alt={preview.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.className = 'hidden';
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-secondary line-clamp-2 mb-1">{preview.title}</h3>
          <p className="text-xs text-secondary/60 line-clamp-2 mb-2">{preview.description}</p>
          <div className="flex items-center gap-1">
            <FiExternalLink className="w-3 h-3 text-secondary/40" />
            <span className="text-xs text-secondary/40 truncate">{new URL(url).hostname}</span>
          </div>
        </div>
      </div>
    );
  }

  // Without image (simple link)
  return (
    <div 
      className="mt-2 p-3 bg-secondary/5 rounded-xl border border-secondary/20 cursor-pointer hover:bg-secondary/10 transition-colors"
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-center gap-2 mb-1">
        <FiExternalLink className="w-4 h-4 text-secondary/60" />
        <p className="text-xs font-medium text-secondary truncate">{preview.title}</p>
      </div>
      <p className="text-xs text-secondary/70 truncate">{preview.description}</p>
    </div>
  );
};

export default LinkPreview;