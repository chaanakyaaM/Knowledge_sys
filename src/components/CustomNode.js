import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

// Simple markdown parser for basic formatting
const parseMarkdown = (text) => {
  if (!text) return text;
  
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code: `code`
    .replace(/`(.*?)`/g, '<code style="background-color: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>')
    // Headers: # ## ###
    .replace(/^### (.*$)/gm, '<h3 style="margin: 8px 0 4px 0; font-size: 14px; font-weight: bold;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin: 10px 0 5px 0; font-size: 16px; font-weight: bold;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin: 12px 0 6px 0; font-size: 18px; font-weight: bold;">$1</h1>')
    // Line breaks
    .replace(/\n/g, '<br>');
}; 

const CustomNode = ({ data }) => {
  const { title, url, note, images, files, isHighlighted, darkMode, onDelete } = data;
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const nodeStyles = {
    padding: '12px',
    borderRadius: '8px',
    border: isHighlighted
      ? '3px solid #ff6b6b'
      : darkMode
      ? '2px solid #555'
      : '2px solid #ddd',
    backgroundColor: isHighlighted
      ? (darkMode ? '#4a2c2c' : '#fff5f5')
      : darkMode
      ? '#333'
      : 'white',
    color: isHighlighted
      ? (darkMode ? '#ffcccc' : '#333')
      : (darkMode ? '#eee' : '#333'),
    minWidth: '200px',
    maxWidth: '300px',
    boxShadow: isHighlighted
      ? '0 4px 12px rgba(255, 107, 107, 0.3)'
      : '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
  };

  const linkStyles = {
    color: darkMode ? '#88ccff' : '#0066cc',
    textDecoration: 'none',
    fontSize: '12px',
    wordBreak: 'break-all',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const linkHoverStyles = {
    ...linkStyles,
    color: darkMode ? '#aaddff' : '#0044aa',
    textDecoration: 'underline',
  };

  const textMutedStyles = {
    fontSize: '11px',
    color: darkMode ? '#bbb' : '#666',
    marginTop: '6px',
    lineHeight: '1.3',
    whiteSpace: 'pre-wrap', 
  };

  const timestampStyles = {
    fontSize: '10px',
    color: darkMode ? '#999' : '#888',
    marginTop: '8px',
    paddingTop: '6px',
    borderTop: darkMode ? '1px solid #444' : '1px solid #eee',
    textAlign: 'center',
    fontStyle: 'italic',
  };

  const deleteButtonStyles = {
    position: 'absolute',
    top: '0px',
    right: '0px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '20%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 11,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'background-color 0.2s ease',
  };

  const previewStyles = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '10px',
    width: '320px',
    height: '240px',
    backgroundColor: darkMode ? '#222' : 'white',
    border: darkMode ? '2px solid #555' : '2px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    overflow: 'hidden',
    opacity: showPreview ? 1 : 0,
    visibility: showPreview ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
  };

  const previewHeaderStyles = {
    padding: '8px 12px',
    backgroundColor: darkMode ? '#333' : '#f5f5f5',
    borderBottom: darkMode ? '1px solid #555' : '1px solid #ddd',
    fontSize: '12px',
    color: darkMode ? '#bbb' : '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const iframeStyles = {
    border: 'none',
    backgroundColor: darkMode ? '#111' : 'white',
    transform: 'scale(0.7)',
    transformOrigin: '0 0',
    width: '142.86%', 
    height: 'calc((100% - 40px) / 0.7)', 
  };

  const loadingStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100% - 40px)',
    color: darkMode ? '#bbb' : '#666',
    fontSize: '14px',
  };

  // YouTube helper functions
  const isYouTubeUrl = (inputUrl) => {
    if (!inputUrl) return false;
    const youtubePatterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/i,
      /youtu\.be\/([^"&?\/\s]{11})/i
    ];
    return youtubePatterns.some(pattern => pattern.test(inputUrl));
  };

  const getYouTubeVideoId = (inputUrl) => {
    if (!inputUrl) return null;
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/i,
      /youtu\.be\/([^"&?\/\s]{11})/i
    ];
    
    for (const pattern of patterns) {
      const match = inputUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleUrlMouseEnter = () => {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.includes('.'))) {
      if (!isYouTubeUrl(url)) { // Don't show iframe preview for YouTube videos
        setShowPreview(true);
        setPreviewLoaded(false);
      }
    }
  };

  const handleUrlMouseLeave = () => {
    setShowPreview(false);
  };

  const handleIframeLoad = () => {
    setPreviewLoaded(true);
  };

  const handleIframeError = () => {
    setPreviewLoaded(true);
  };

  const formatUrl = (inputUrl) => {
    if (!inputUrl) return '';
    if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
      return inputUrl;
    }
    return `https://${inputUrl}`;
  };

  const getDomainFromUrl = (inputUrl) => {
    try {
      const formattedUrl = formatUrl(inputUrl);
      const urlObj = new URL(formattedUrl);
      return urlObj.hostname;
    } catch {
      return inputUrl;
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to open node content in a new window
  const openNodeInNewWindow = (e) => {
    e.stopPropagation();
    
    const windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no';
    const newWindow = window.open('', '_blank', windowFeatures);
    
    if (newWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title || 'Node Content'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: ${darkMode ? '#1a1a1a' : '#ffffff'};
              color: ${darkMode ? '#e0e0e0' : '#333333'};
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid ${darkMode ? '#333' : '#eee'};
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 10px 0;
              color: ${darkMode ? '#ffffff' : '#222'};
            }
            .url {
              color: ${darkMode ? '#88ccff' : '#0066cc'};
              text-decoration: none;
              word-break: break-all;
              font-size: 14px;
            }
            .url:hover {
              text-decoration: underline;
            }
            .note {
              background-color: ${darkMode ? '#2a2a2a' : '#f8f9fa'};
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              white-space: normal;
              border-left: 4px solid ${darkMode ? '#555' : '#007bff'};
              line-height: 1.6;
            }
            .note h1, .note h2, .note h3 {
              margin-top: 16px;
              margin-bottom: 8px;
              color: ${darkMode ? '#ffffff' : '#222'};
            }
            .note h1 { font-size: 20px; }
            .note h2 { font-size: 18px; }
            .note h3 { font-size: 16px; }
            .note code {
              background-color: ${darkMode ? '#1a1a1a' : '#f1f3f4'} !important;
              color: ${darkMode ? '#e0e0e0' : '#333'};
              border: 1px solid ${darkMode ? '#444' : '#ddd'};
            }
            .note a {
              color: ${darkMode ? '#88ccff' : '#0066cc'} !important;
            }
            .note a:hover {
              color: ${darkMode ? '#aaddff' : '#0044aa'} !important;
            }
            .images-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .image-container {
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid ${darkMode ? '#444' : '#ddd'};
            }
            .image-container img {
              width: 100%;
              height: 200px;
              object-fit: cover;
              display: block;
            }
            .youtube-thumbnail {
              position: relative;
              cursor: pointer;
            }
            .youtube-play-button {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0, 0, 0, 0.8);
              border-radius: 50%;
              width: 60px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            }
            .files-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid ${darkMode ? '#333' : '#eee'};
            }
            .files-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: ${darkMode ? '#ccc' : '#444'};
            }
            .file-item {
              display: block;
              padding: 8px 12px;
              margin: 5px 0;
              background-color: ${darkMode ? '#2a2a2a' : '#f1f3f4'};
              border-radius: 6px;
              text-decoration: none;
              color: ${darkMode ? '#88ccff' : '#0066cc'};
              transition: background-color 0.2s;
            }
            .file-item:hover {
              background-color: ${darkMode ? '#333' : '#e8f0fe'};
            }
            .timestamp {
              text-align: center;
              font-size: 12px;
              color: ${darkMode ? '#999' : '#888'};
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid ${darkMode ? '#333' : '#eee'};
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${title ? `<h1 class="title">${title}</h1>` : ''}
              ${url ? `<a href="${formatUrl(url)}" target="_blank" class="url">${url}</a>` : ''}
            </div>
            
            ${images && images.length > 0 ? `
              <div class="images-grid">
                ${images.map((imgSrc, index) => `
                  <div class="image-container">
                    <img src="${imgSrc}" alt="Image ${index + 1}" onerror="this.parentElement.style.display='none'">
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${url && isYouTubeUrl(url) ? `
              <div class="images-grid">
                <div class="image-container youtube-thumbnail" onclick="window.open('${formatUrl(url)}', '_blank')">
                  <img src="${getYouTubeThumbnail(getYouTubeVideoId(url))}" alt="YouTube Thumbnail">
                  <div class="youtube-play-button">▶</div>
                </div>
              </div>
            ` : ''}
            
            ${files && files.length > 0 ? `
              <div class="files-section">
                <div class="files-title">Attachments:</div>
                ${files.map((file, index) => `
                  <a href="${file.dataURL}" download="${file.name}" class="file-item">
                    📄 ${file.name} (${Math.round(file.size / 1024)} KB)
                  </a>
                `).join('')}
              </div>
            ` : ''}

            ${note ? `<div class="note">${note}</div>` : ''}
            
            <div class="timestamp">
              Created ${getCurrentDate()}
            </div>
          </div>
        </body>
        </html>
      `;
      
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  // Get all images including YouTube thumbnail
  const getAllImages = () => {
    const allImages = [...(images || [])];
    
    // Add YouTube thumbnail if URL is a YouTube video
    if (url && isYouTubeUrl(url)) {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        allImages.unshift(getYouTubeThumbnail(videoId)); // Add at beginning
      }
    }
    
    return allImages;
  };

  const allImages = getAllImages();
  const youtubeVideoId = url ? getYouTubeVideoId(url) : null;

  return (
    <div style={nodeStyles} onClick={openNodeInNewWindow}>
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={deleteButtonStyles}
          title="Delete Node"
        >
          &times;
        </button>
      )}

      {/* URL Preview */}
      {url && showPreview && !isYouTubeUrl(url) && (
        <div style={previewStyles}>
          <div style={previewHeaderStyles}>
            <span>Preview: {getDomainFromUrl(url)}</span>
            <span style={{ fontSize: '10px' }}>Hover to preview</span>
          </div>
          {!previewLoaded && (
            <div style={loadingStyles}>
              Loading preview...
            </div>
          )}
          <iframe
            src={formatUrl(url)}
            style={{
              ...iframeStyles,
              display: previewLoaded ? 'block' : 'none',
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="URL Preview"
            sandbox="allow-scripts allow-same-origin"
          />
          {previewLoaded && (
            <div style={{
              ...loadingStyles,
              display: 'none',
            }}>
              Unable to load preview
            </div>
          )}
        </div>
      )}

      {/* Source Handle (right side) */}
      <Handle type="source" position={Position.Right} id="a" style={{ background: '#555' }} />
      {/* Target Handle (left side) */}
      <Handle type="target" position={Position.Left} id="b" style={{ background: '#555' }} />

      {/* Image Display: 2x2 Grid Layout with YouTube Thumbnail */}
      {allImages && allImages.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: allImages.length === 1 ? '1fr' : 'repeat(2, 80px)',
              gap: '4px',
              marginBottom: '4px',
            }}
          >
            {allImages.slice(0, 4).map((imgSrc, index) => {
              const isYouTubeThumbnail = index === 0 && youtubeVideoId && imgSrc.includes('youtube.com');
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: allImages.length === 1 ? '120px' : '80px',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    border: darkMode ? '1px solid #666' : '1px solid #eee',
                    gridColumn: allImages.length === 1 ? 'span 2' : 'span 1',
                    cursor: isYouTubeThumbnail ? 'pointer' : 'default',
                  }}
                  onClick={(e) => {
                    if (isYouTubeThumbnail) {
                      e.stopPropagation();
                      window.open(formatUrl(url), '_blank');
                    }
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={isYouTubeThumbnail ? 'YouTube Video' : `Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* YouTube Play Button Overlay */}
                  {isYouTubeThumbnail && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        pointerEvents: 'none',
                      }}
                    >
                      ▶
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Show additional images count if more than 4 */}
            {allImages.length > 4 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  border: darkMode ? '1px solid #666' : '1px solid #eee',
                }}
              >
                +{allImages.length - 4}
              </div>
            )}
          </div>
          
          {/* Show total count if more than 4 images */}
          {allImages.length > 4 && (
            <div
              style={{
                fontSize: '10px',
                color: darkMode ? '#bbb' : '#666',
                textAlign: 'center',
              }}
            >
              {allImages.length} images total
            </div>
          )}
        </div>
      )}

      {title && (
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
          {title}
        </div>
      )}

      {url && (
        <div style={{ marginBottom: '6px' }}>
          <a
            href={formatUrl(url)}
            target="_blank"
            rel="noreferrer"
            style={showPreview ? linkHoverStyles : linkStyles}
            onMouseEnter={handleUrlMouseEnter}
            onMouseLeave={handleUrlMouseLeave}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {url} {isYouTubeUrl(url) && '📹'}
          </a>
        </div>
      )}

      {note && (
        <div 
          style={textMutedStyles}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(note) }}
        />
      )} 

      {files && files.length > 0 && (
        <div style={{ marginTop: '8px', borderTop: darkMode ? '1px solid #555' : '1px solid #eee', paddingTop: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: darkMode ? '#ccc' : '#444' }}>
            Attachments:
          </div>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {files.map((file, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                <a
                  href={file.dataURL}
                  download={file.name}
                  style={linkStyles}
                  onClick={(e) => e.stopPropagation()}
                >
                  📄 {file.name} ({Math.round(file.size / 1024)} KB)
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp at the bottom */}
      <div style={timestampStyles}>
        Created {getCurrentDate()}
      </div>
    </div>
  );
};

export default CustomNode;