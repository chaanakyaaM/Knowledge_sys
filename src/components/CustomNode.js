import  { useState } from 'react';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css'; 

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

  const handleUrlMouseEnter = () => {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.includes('.'))) {
      setShowPreview(true);
      setPreviewLoaded(false);
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

  return (
    <div style={nodeStyles}>
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          style={deleteButtonStyles}
          title="Delete Node"
        >
          &times;
        </button>
      )}

      {/* URL Preview */}
      {url && showPreview && (
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

      {/* Image Display: 2x2 Grid Layout */}
      {images && images.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: images.length === 1 ? '1fr' : 'repeat(2, 80px)',
              gap: '4px',
              marginBottom: '4px',
            }}
          >
            {images.slice(0, 4).map((imgSrc, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: images.length === 1 ? '120px' : '80px',
                  overflow: 'hidden',
                  borderRadius: '4px',
                  border: darkMode ? '1px solid #666' : '1px solid #eee',
                  gridColumn: images.length === 1 ? 'span 2' : 'span 1',
                }}
              >
                <img
                  src={imgSrc}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
            
            {/* Show additional images count if more than 4 */}
            {images.length > 4 && (
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
                +{images.length - 4}
              </div>
            )}
          </div>
          
          {/* Show total count if more than 4 images */}
          {images.length > 4 && (
            <div
              style={{
                fontSize: '10px',
                color: darkMode ? '#bbb' : '#666',
                textAlign: 'center',
              }}
            >
              {images.length} images total
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
            {url}
          </a>
        </div>
      )}

      {note && <div style={textMutedStyles}>{note}</div>} 

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