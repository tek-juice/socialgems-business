import { FiInfo } from 'react-icons/fi';
import { useState } from 'react';

export default function CampaignDescription({ description }) {
  const [expanded, setExpanded] = useState(false);

  // Function to extract first 200 words from HTML content
  const getPreview = (html, wordLimit) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/);
    const isTruncated = words.length > wordLimit;
    const preview = words.slice(0, wordLimit).join(' ');
    return {
      text: preview + (isTruncated ? '...' : ''),
      isTruncated
    };
  };

  const preview = getPreview(description, 80);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div>
          <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
            Campaign Description
          </h3>
        </div>
      </div>

      {!expanded ? (
        <div className="break-words overflow-wrap-break-word word-break-break-all leading-relaxed max-w-none prose prose-sm text-xs">
          {preview.text}{' '}
          {preview.isTruncated && (
            <button
              onClick={() => setExpanded(true)}
              className="text-secondary text-xs font-bold whitespace-nowrap"
            >
              Read More
            </button>
          )}
        </div>
      ) : (
        <div>
          <div
            className="break-words overflow-wrap-break-word word-break-break-all leading-relaxed max-w-none prose prose-sm text-xs"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 text-secondary text-xs font-bold"
          >
            Read Less
          </button>
        </div>
      )}
    </div>
  );
}