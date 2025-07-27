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

import { CustomNode, NodeModal, TopBar } from './components'; // Import components

// Initial nodes, now with some additional nodes for linking
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

// Initial edges to demonstrate linking
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'example link' },
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
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    note: '',
    images: [],
    files: [],
  });

  // Load data and theme from localStorage on component mount
  useEffect(() => {
    try {
      const savedNodes = JSON.parse(localStorage.getItem('reactflow-nodes')) || initialNodes;
      const savedEdges = JSON.parse(localStorage.getItem('reactflow-edges')) || initialEdges;
      const savedTheme = localStorage.getItem('reactflow-theme') === 'dark';

      setNodes(savedNodes.map(node => ({ ...node, data: { ...node.data, darkMode: savedTheme } })));
      setEdges(savedEdges);
      setDarkMode(savedTheme);

      const maxNodeId = savedNodes.reduce((max, node) => Math.max(max, parseInt(node.id, 10)), 0);
      setId(maxNodeId + 1);
    } catch (error) {
      console.error("Failed to load from localStorage, using initial data:", error);
      setNodes(initialNodes.map(node => ({ ...node, data: { ...node.data, darkMode: false } })));
      setEdges(initialEdges);
      setDarkMode(false);
    }
  }, []);

  // Save nodes and edges to localStorage whenever they change
  const saveFlowData = useCallback(() => {
    localStorage.setItem('reactflow-nodes', JSON.stringify(nodes));
    localStorage.setItem('reactflow-edges', JSON.stringify(edges));
    localStorage.setItem('reactflow-theme', darkMode ? 'dark' : 'light');
    console.log('Nodes, edges, and theme saved to localStorage.');
  }, [nodes, edges, darkMode]);

  useEffect(() => {
    saveFlowData();
  }, [saveFlowData]);

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
    (nodeId) => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    []
  );

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
          maxZoom={4} // You can also adjust maxZoom if needed, default is 2
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