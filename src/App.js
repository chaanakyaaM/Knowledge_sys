import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { CustomNode, NodeModal, TopBar } from './components'; 

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const USER_ID = process.env.REACT_APP_USER_ID || 'default_user'; // You can make this dynamic based on auth

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service Functions
const flowAPI = {
  saveFlow: (userId, nodes, edges, theme) =>
    api.post('/api/flow/save', { user_id: userId, nodes, edges, theme }),
  
  loadFlow: (userId) =>
    api.get(`/api/flow/load/${userId}`),
  
  addNode: (userId, node) =>
    api.post('/api/flow/node', { user_id: userId, node }),
  
  deleteNode: (userId, nodeId) =>
    api.delete(`/api/flow/node/${userId}/${nodeId}`),
  
  deleteFlow: (userId) =>
    api.delete(`/api/flow/${userId}`),

  healthCheck: () =>
    api.get('/health'),
};

// Initial nodes, now with some additional nodes for linking (fallback data)
const initialNodes = [
  {
    id: '1',
    type: 'custom',
    data: {
      title: 'Node with Multiple Images',
      url: 'https://reactflow.dev/docs/guides/overview/',
      note: 'Images in this node should now stack vertically.',
      images: [
        'https://via.placeholder.com/150/FF5733/FFFFFF?text=Image+1',
        'https://via.placeholder.com/150/33FF57/FFFFFF?text=Image+2',
        'https://via.placeholder.com/150/3357FF/FFFFFF?text=Image+3'
      ],
      files: [],
      isHighlighted: false,
      darkMode: false,
    },
    position: {
      x: 50,
      y: 100,
    },
  },
  {
    id: '2',
    type: 'custom',
    data: {
      title: 'Another Node',
      url: 'https://example.com',
      note: 'This node is a placeholder.',
      images: [],
      files: [],
      isHighlighted: false,
      darkMode: false,
    },
    position: {
      x: 300,
      y: 50,
    },
  },
  {
    id: '3',
    type: 'custom',
    data: {
      title: 'Node with Single Image',
      url: 'https://github.com',
      note: 'This is a sample note',
      images: ['https://via.placeholder.com/150/FFC300/000000?text=Single+Image'],
      files: [],
      isHighlighted: false,
      darkMode: false,
    },
    position: {
      x: 300,
      y: 200,
    },
  },
];

// Initial edges to demonstrate linking (fallback data)
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [id, setId] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    note: '',
    images: [],
    files: [],
  });

  // Check backend connection
  const checkBackendConnection = useCallback(async () => {
    try {
      await flowAPI.healthCheck();
      setIsOnline(true);
      return true;
    } catch (error) {
      console.warn('Backend connection failed, using localStorage fallback:', error);
      setIsOnline(false);
      return false;
    }
  }, []);

  // Load data from backend or localStorage fallback
  useEffect(() => {
      const loadData = async () => {
      setIsLoading(true); // Start loading state
      try {
        const backendOnline = await checkBackendConnection(); // Check if the backend is available

        if (backendOnline) {
          // Backend is online, fetch data from API
          const response = await flowAPI.loadFlow(USER_ID); // API call to get flow data
          const { nodes: loadedNodes, edges: loadedEdges, theme } = response.data;

          if (loadedNodes.length > 0) {
            // If nodes are found, process them
            setNodes(
              loadedNodes.map(node => ({
                ...node,
                data: { ...node.data, darkMode: theme === 'dark' }
              }))
            );
            setEdges(loadedEdges);
            setDarkMode(theme === 'dark');

            // Get the maximum node id and set it for future nodes
            const maxNodeId = loadedNodes.reduce(
              (max, node) => Math.max(max, parseInt(node.id, 10)),
              0
            );
            setId(maxNodeId + 1);
          } else {
            // No data from backend, fallback to initial data
            setNodes(initialNodes.map(node => ({
              ...node,
              data: { ...node.data, darkMode: false }
            })));
            setEdges(initialEdges);
            setDarkMode(false);
          }
        } else {
          // If backend is offline, log the error and use initial/empty data
          console.error("Backend is unavailable, using initial data.");
          setNodes(initialNodes.map(node => ({
            ...node,
            data: { ...node.data, darkMode: false }
          })));
          setEdges(initialEdges);
          setDarkMode(false);
        }
      } catch (error) {
        console.error("Error loading data from API:", error);
        // In case of any error, fallback to initial/empty data
        setNodes(initialNodes.map(node => ({
          ...node,
          data: { ...node.data, darkMode: false }
        })));
        setEdges(initialEdges);
        setDarkMode(false);
      } finally {
        setIsLoading(false); // Stop loading state after completion
      }
    };


    loadData();
  }, [checkBackendConnection]);

  // Save data to backend or localStorage
      const saveFlowData = useCallback(async () => {
      if (nodes.length === 0) return; // Don't save empty data during initial load
      // const backendOnline = await checkBackendConnection();
      setSaveStatus('saving'); // Set saving status

      try {
        if (isOnline) {
          // Attempt to save to the backend via API
          await flowAPI.saveFlow(USER_ID, nodes, edges, darkMode ? 'dark' : 'light');
          setSaveStatus('saved');
          console.log('Flow data saved to backend');
        } else {
          // Backend is offline, handle error gracefully (no fallback to localStorage)
          throw new Error("Backend is offline. Cannot save data.");
        }
      } catch (error) {
        console.error('Failed to save flow data:', error);
        setSaveStatus('error');
        // Optionally, you can show a user-friendly message here
        alert('Failed to save data. Please try again when the backend is available.');
      }
    }, [nodes, edges, darkMode, isOnline]);


  // Auto-save with debouncing
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const saveTimeout = setTimeout(() => {
      saveFlowData();
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(saveTimeout);
  }, [saveFlowData, isLoading]);

  const handleInputChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const uploadedFiles = Array.from(e.target.files);
    const imagePromises = uploadedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((results) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...results],
      }));
    });
  }, []);

  const handleFileAttach = useCallback((e) => {
    const uploadedFiles = Array.from(e.target.files);
    const filePromises = uploadedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            dataURL: event.target.result,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((results) => {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...results],
      }));
    });
  }, []);

  const removeImage = useCallback((indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const removeFile = useCallback((indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    // e.preventDefault();

    const newNode = {
      id: `${id}`,
      type: 'custom',
      data: {
        title: formData.title,
        url: formData.url,
        note: formData.note,
        images: formData.images,
        files: formData.files,
        isHighlighted: false,
        darkMode: darkMode,
        createdAt: new Date().toISOString() 
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setId((prev) => prev + 1);
    setFormData({ title: '', url: '', note: '', images: [], files: [] });
    setModalOpen(false);
  }, [id, formData, darkMode]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted:
          term.length > 0 &&
          (node.data.title?.toLowerCase().includes(term.toLowerCase()) ||
            node.data.url?.toLowerCase().includes(term.toLowerCase()) ||
            node.data.note?.toLowerCase().includes(term.toLowerCase())),
      },
    }));

    setNodes(updatedNodes);
  }, [nodes]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, isHighlighted: false },
    }));
    setNodes(updatedNodes);
  }, [nodes]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode);
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: { ...node.data, darkMode: !darkMode },
      }))
    );
  }, [darkMode]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));
    },
    []
  );

  const onConnect = useCallback(
    (connection) => {
      const isDuplicate = edges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target) ||
          (edge.source === connection.target && edge.target === connection.source)
      );

      if (isDuplicate) {
        setEdges((prevEdges) =>
          prevEdges.filter(
            (edge) =>
              !(
                (edge.source === connection.source && edge.target === connection.target) ||
                (edge.source === connection.target && edge.target === connection.source)
              )
          )
        );
      } else {
        const newEdge = {
          ...connection,
          id: `e${connection.source}-${connection.target}-${Date.now()}`,
        };
        setEdges((prevEdges) => addEdge(newEdge, prevEdges));
      }
    },
    [edges]
  );

  const handleDeleteNode = useCallback(
    async (nodeId) => {
      // Optimistically update UI
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      // Try to delete from backend
      if (isOnline) {
        try {
          await flowAPI.deleteNode(USER_ID, nodeId);
          console.log(`Node ${nodeId} deleted from backend`);
        } catch (error) {
          console.error('Failed to delete node from backend:', error);
          // UI is already updated, so no rollback needed
        }
      }
    },
    [isOnline]
  );

  // Manual save function (for save button if needed)
  const handleManualSave = useCallback(async () => {
    await saveFlowData();
  }, [saveFlowData]);

  // Retry connection function
  const retryConnection = useCallback(async () => {
    const connected = await checkBackendConnection();
    if (connected) {
      // Try to sync local data to backend
      try {
        await flowAPI.saveFlow(USER_ID, nodes, edges, darkMode ? 'dark' : 'light');
        console.log('Local data synced to backend after reconnection');
      } catch (error) {
        console.error('Failed to sync local data to backend:', error);
      }
    }
  }, [checkBackendConnection, nodes, edges, darkMode]);

  // Theme styles (moved here as they depend on darkMode state in App)
  const appBackground = darkMode ? '#222' : '#f0f0f0';
  const topBarBackground = darkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const topBarColor = darkMode ? '#eee' : '#333';
  const modalBackground = darkMode ? '#444' : 'white';
  const modalColor = darkMode ? '#eee' : '#333';
  const inputBorder = darkMode ? '1px solid #666' : '1px solid #ddd';
  const inputColor = darkMode ? '#eee' : '#333';
  const inputBackground = darkMode ? '#333' : 'white';
  const buttonBackgroundPrimary = darkMode ? '#007bff' : '#0066cc';
  const buttonBackgroundSecondary = darkMode ? '#555' : '#f0f0f0';
  const buttonColorPrimary = 'white';
  const buttonColorSecondary = darkMode ? '#eee' : '#333';

  // Loading screen
  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: appBackground,
        color: darkMode ? '#eee' : '#333'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            {isOnline ? 'Connecting to backend...' : 'Loading from local storage...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: appBackground, transition: 'background-color 0.3s ease' }}>
      <ReactFlowProvider>
        <TopBar
          nodesCount={nodes.length}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
          setModalOpen={setModalOpen}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          // Connection status props
          isOnline={isOnline}
          saveStatus={saveStatus}
          onManualSave={handleManualSave}
          onRetryConnection={retryConnection}
          // Pass theme styles to TopBar
          topBarBackground={topBarBackground}
          topBarColor={topBarColor}
          inputBorder={inputBorder}
          inputColor={inputColor}
          inputBackground={inputBackground}
          buttonBackgroundPrimary={buttonBackgroundPrimary}
          buttonColorPrimary={buttonColorPrimary}
          buttonBackgroundSecondary={buttonBackgroundSecondary}
          buttonColorSecondary={buttonColorSecondary}
        />

        <NodeModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setFormData({ title: '', url: '', note: '', images: [], files: [] }); }}
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          handleFileAttach={handleFileAttach}
          removeImage={removeImage}
          removeFile={removeFile}
          handleSubmit={handleSubmit}
          darkMode={darkMode}
          // Pass theme styles to NodeModal
          modalBackground={modalBackground}
          modalColor={modalColor}
          inputBorder={inputBorder}
          inputColor={inputColor}
          inputBackground={inputBackground}
          buttonBackgroundPrimary={buttonBackgroundPrimary}
          buttonColorPrimary={buttonColorPrimary}
          buttonBackgroundSecondary={buttonBackgroundSecondary}
          buttonColorSecondary={buttonColorSecondary}
        />

        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onDelete: () => handleDeleteNode(node.id),
              darkMode: darkMode,
            },
          }))}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.3} 
          maxZoom={4}
          style={{ backgroundColor: appBackground }}
        >
          <Controls style={{
            backgroundColor: modalBackground,
            borderRadius: '4px',
            border: darkMode ? '1px solid #555' : '1px solid #ddd',
          }} />
          <Background color={darkMode ? '#444' : '#aaa'} gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;