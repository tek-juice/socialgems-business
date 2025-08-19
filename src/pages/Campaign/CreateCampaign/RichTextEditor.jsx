import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiBold, FiItalic, FiList, FiType } from "react-icons/fi";
import { toast } from "sonner";

const RichTextEditor = ({ value, onChange, placeholder, minWords = 200, showTemplate = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);

  useEffect(() => {
    // Count words from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value || '';
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  useEffect(() => {
    // Set initial content
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      onChange(newValue);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  }, []);

  const formatText = useCallback((type) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection.toString()) {
      toast.error("Please select text to format");
      return;
    }

    editorRef.current.focus();

    switch (type) {
      case "bold":
        document.execCommand('bold', false, null);
        break;
      case "italic":
        document.execCommand('italic', false, null);
        break;
      case "bullet":
        // Get selected text and wrap in list item
        const selectedText = selection.toString();
        document.execCommand('insertHTML', false, `<li>${selectedText}</li>`);
        break;
      default:
        break;
    }

    handleInput();
  }, [handleInput]);

  const insertTemplate = useCallback(() => {
    const template = `<h>🎯 Campaign Mission</h>

<p>Transform your brand story into authentic, engaging content that resonates with your audience and drives real results.</p>

<h>📋 What We're Looking For</h>

<li><strong>Genuine, authentic content</strong> showcasing our brand naturally</li>
<li><strong>High-quality visuals</strong> that align with our aesthetic and values</li>
<li><strong>Compelling captions</strong> that spark conversation and engagement</li>
<li><strong>Strategic hashtag usage</strong> to maximize reach and discoverability</li>

<h>✨ Content Requirements</h>

<li>Include provided brand mentions and hashtags</li>
<li>Feature clear, action-driven call-to-actions</li>
<li>Post during peak engagement hours for your audience</li>
<li>Tag our official social media accounts</li>
<li>Maintain brand voice while adding your personal touch</li>

<h>💡 Creative Freedom</h>

<p>We believe your unique perspective is what makes this collaboration special. Feel free to interpret our brand through your lens while staying true to our core message and values.</p>

<h>🎁 Collaboration Benefits</h>

<p>[Specify products, services, compensation, or exclusive perks]</p>

<h>📅 Campaign Timeline</h>

<li><strong>Content creation deadline:</strong> [Date]</li>
<li><strong>Publishing schedule:</strong> [Date range]</li>
<li><strong>Campaign duration:</strong> [Start date] to [End date]</li>

<h>💬 Questions & Support</h>

<p>We're here to support your creative process! Reach out anytime for clarification, additional resources, or brainstorming sessions.</p>

<p><strong>Ready to create something amazing together? Let's make magic happen! ✨🚀</strong></p>`;

    if (editorRef.current) {
      editorRef.current.innerHTML = template;
      onChange(template);
    }
    
    toast.success(
      "Professional template inserted! Customize it to match your brand voice."
    );
  }, [onChange]);

  const addHeading = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.toString()) {
        document.execCommand('insertHTML', false, `<h>${selection.toString()}</h>`);
      } else {
        document.execCommand('insertHTML', false, '<h>Heading</h>');
      }
      handleInput();
    }
  }, [handleInput]);

  const addParagraph = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.toString()) {
        document.execCommand('insertHTML', false, `<p>${selection.toString()}</p>`);
      } else {
        document.execCommand('insertHTML', false, '<p>New paragraph</p>');
      }
      handleInput();
    }
  }, [handleInput]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => formatText("bold")}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (select text first)"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText("italic")}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (select text first)"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText("bullet")}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="List item (select text first)"
          >
            <FiList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addHeading}
            className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-bold"
            title="Add heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={addParagraph}
            className="p-2 hover:bg-gray-200 rounded transition-colors text-xs"
            title="Add paragraph"
          >
            P
          </button>
        </div>

        {showTemplate && (
          <button
            type="button"
            onClick={insertTemplate}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-scale-400 text-black rounded text-xs font-medium hover:bg-primary-scale-500 transition-colors"
          >
            <FiType className="w-3 h-3" />
            Insert Template
          </button>
        )}
      </div>

      <div
        className={`relative border-2 rounded-lg transition-colors ${
          isFocused ? "border-primary-scale-400" : "border-gray-300"
        }`}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 rounded-lg focus:outline-none text-xs leading-relaxed rich-text-editor"
          style={{ 
            minHeight: "240px",
            maxHeight: "600px",
            overflowY: "auto"
          }}
          data-placeholder={placeholder}
        />

        <div className="absolute bottom-3 right-3 text-xs">
          <span
            className={`${
              wordCount < minWords ? "text-red-500" : "text-green-500"
            } font-medium`}
          >
            {wordCount} words
          </span>
          {minWords > 0 && wordCount < minWords && (
            <span className="text-red-500 ml-1">
              (minimum {minWords} required)
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        💡 Pro tip: Select text to format it, use H for headings, P for paragraphs{showTemplate && ', or insert our professional template'}
      </div>

      <style jsx>{`
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        .rich-text-editor h {
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0 4px 0;
          color: #1F2937;
        }
        
        .rich-text-editor p {
          margin: 4px 0;
          line-height: 1.5;
        }
        
        .rich-text-editor li {
          margin: 2px 0 2px 16px;
          list-style: none;
          position: relative;
        }
        
        .rich-text-editor li:before {
          content: "•";
          color: #374151;
          font-weight: bold;
          position: absolute;
          left: -16px;
        }
        
        .rich-text-editor strong {
          font-weight: 600;
        }
        
        .rich-text-editor em {
          font-style: italic;
        }
        
        .rich-text-editor br + br {
          display: block;
          margin-top: 4px;
          content: "";
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;