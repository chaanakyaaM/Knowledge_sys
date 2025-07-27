import  { useState } from 'react';

const TopBar = ({
  nodesCount,
  searchTerm,
  handleSearch,
  clearSearch,
  setModalOpen,
  toggleDarkMode,
  darkMode,
  // Theme props
  topBarBackground,
  topBarColor,
  inputBorder,
  inputColor,
  inputBackground,
  buttonBackgroundPrimary,
  buttonColorPrimary,
  buttonBackgroundSecondary,
  buttonColorSecondary,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Toggle Button - Only visible when collapsed */}
      {!isExpanded && (
        <button
          onClick={toggleExpanded}
          style={{
            position: 'absolute',
            top: 15,
            left: 15,
            zIndex: 15,
            padding: '8px 10px',
            backgroundColor: topBarBackground,
            color: topBarColor,
            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          title="Expand toolbar"
        >
          ☰
        </button>
      )}

      {/* Main TopBar - Only visible when expanded */}
      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            zIndex: 10,
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: topBarBackground,
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: topBarColor,
            flexWrap: 'wrap',
            animation: isExpanded ? 'fadeInSlide 0.3s ease forwards' : 'fadeOutSlide 0.3s ease forwards',
          }}
        >
          {/* Collapse Button */}
          <button
            onClick={toggleExpanded}
            style={{
              padding: '6px 8px',
              backgroundColor: 'transparent',
              color: topBarColor,
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '28px',
              height: '28px',
              transition: 'all 0.2s ease',
            }}
            title="Collapse toolbar"
          >
            ×
          </button>
          {/* Left section - Main actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: '8px 16px',
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

          {/* Center section - Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: '6px 12px',
                border: inputBorder,
                borderRadius: '4px',
                fontSize: '14px',
                width: '100%',
                color: inputColor,
                backgroundColor: inputBackground
              }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  padding: '4px 8px',
                  backgroundColor: buttonBackgroundSecondary,
                  border: inputBorder,
                  color: buttonColorSecondary,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Right section - Stats and theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            <div style={{ 
              fontSize: '12px', 
              color: topBarColor,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
            }}>
              <span>{nodesCount} nodes</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '8px 12px',
                backgroundColor: darkMode ? '#f0f0f0' : '#333',
                color: darkMode ? '#333' : '#f0f0f0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutSlide {
          from {
            opacity: 1;
            transform: translateY(0);
            transition
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;