const NodeModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleImageUpload,
  handleFileAttach,
  removeImage,
  removeFile,
  handleSubmit,
  darkMode,
  modalBackground,
  modalColor,
  inputBorder,
  inputColor,
  inputBackground,
  buttonBackgroundPrimary,
  buttonColorPrimary,
  buttonBackgroundSecondary,
  buttonColorSecondary,
}) => {
  if (!isOpen) {
    return null;
  }

  // Enhanced submit handler that includes timestamp
  const handleSubmitWithTimestamp = () => {
    // Add createdAt timestamp to formData before submitting
    const nodeDataWithTimestamp = {
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    // Call the original handleSubmit with the enhanced data
    handleSubmit(nodeDataWithTimestamp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: modalBackground,
          color: modalColor,
          padding: '24px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
          Add New Node
        </h2>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Title
            </label>
            <input
              name="title"
              placeholder="Enter title"
              value={formData.title}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: inputBorder,
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: inputColor,
                backgroundColor: inputBackground
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              URL/Link
            </label>
            <input
              name="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: inputBorder,
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: inputColor,
                backgroundColor: inputBackground
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Note/Description
            </label>
            <textarea
              name="note"
              placeholder="Add any notes or description"
              value={formData.note}
              onChange={handleInputChange}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: inputBorder,
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
                color: inputColor,
                backgroundColor: inputBackground
              }}
            />
          </div>

          {/* Multiple Images Selection with 2x2 Grid Preview */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Images (Multiple)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ fontSize: '14px', color: inputColor }}
            />

            {formData.images.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: darkMode ? '#bbb' : '#666',
                    marginBottom: '8px',
                  }}
                >
                  Preview ({formData.images.length} images):
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, 120px)',
                    gap: '8px',
                    maxWidth: '100%',
                  }}
                >
                  {formData.images.slice(0, 4).map((imgSrc, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        position: 'relative',
                        width: '100%',
                        height: '120px',
                        overflow: 'hidden',
                        borderRadius: '4px',
                        border: inputBorder,
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
                      <button
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(255,0,0,0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Show additional images count if more than 4 */}
                  {formData.images.length > 4 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: darkMode ? '#444' : '#f0f0f0',
                        border: inputBorder,
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: darkMode ? '#ccc' : '#666',
                        fontWeight: 'bold',
                      }}
                    >
                      +{formData.images.length - 4} more
                    </div>
                  )}
                </div>
                
                {/* Show remaining images in a scrollable list if more than 4 */}
                {formData.images.length > 4 && (
                  <div style={{ marginTop: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '12px', color: darkMode ? '#bbb' : '#666', marginBottom: '4px' }}>
                      Additional images:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {formData.images.slice(4).map((imgSrc, index) => (
                        <div key={index + 4} style={{ position: 'relative', width: '60px', height: '60px' }}>
                          <img
                            src={imgSrc}
                            alt={`Preview ${index + 5}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: inputBorder,
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={() => removeImage(index + 4)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              backgroundColor: 'rgba(255,0,0,0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Attach Feature */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Attach Files (Multiple)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileAttach}
              style={{ fontSize: '14px', color: inputColor }}
            />

            {formData.files.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: darkMode ? '#bbb' : '#666',
                    marginBottom: '4px',
                  }}
                >
                  Attached Files:
                </div>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {formData.files.map((file, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', color: inputColor }}>
                      <span style={{ marginRight: '8px' }}>📄 {file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginLeft: 'auto',
                        }}
                      >
                        (Remove)
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: buttonBackgroundSecondary,
                border: inputBorder,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: buttonColorSecondary
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitWithTimestamp}
              style={{
                padding: '10px 20px',
                backgroundColor: buttonBackgroundPrimary,
                color: buttonColorPrimary,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Add Node
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeModal;