import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Clone, Stage } from '@react-three/drei';
import useEditorStore from '../../store/useEditorStore';
import useGameStore from '../../store/useGameStore';
import { MODEL_CATEGORIES } from './modelList';

const B = '/models/';

function ModelPreview({ file }) {
  if (!file) return null;
  const { scene } = useGLTF(B + file);
  return (
    <Stage environment="city" intensity={0.6}>
      <Clone object={scene} />
    </Stage>
  );
}

function ToggleBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
      background: active ? '#FF9800' : '#333',
      color: 'white', fontSize: '11px', fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s'
    }}>
      {label}
    </button>
  );
}

export default function EditorUI() {
  const { 
    selectedFile, setSelectedFile, 
    selectedId, transformMode, setTransformMode, 
    hoveredFile, setHoveredFile,
    showGround, toggleGround,
    editorScene, setEditorScene,
    exportBlueprint, duplicateSelected, removeSelected, clearAll 
  } = useEditorStore();

  const { alwaysDay, alwaysClear, toggleAlwaysDay, toggleAlwaysClear } = useGameStore();

  const handleExport = () => {
    const code = exportBlueprint();
    navigator.clipboard.writeText(code);
    alert('Blueprint copied to clipboard! Paste into the appropriate blueprint file.');
  };

  const previewFile = hoveredFile || selectedFile;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      display: 'flex'
    }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: '300px',
        backgroundColor: 'rgba(20, 20, 25, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Map Editor</h2>
          
          {/* Scene Selector */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
            <button 
              onClick={() => setEditorScene('island')}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                background: editorScene === 'island' ? '#9C27B0' : '#333',
                color: 'white', fontSize: '13px', fontWeight: editorScene === 'island' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              🏝️ Island
            </button>
            <button 
              onClick={() => setEditorScene('overworld')}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                background: editorScene === 'overworld' ? '#4CAF50' : '#333',
                color: 'white', fontSize: '13px', fontWeight: editorScene === 'overworld' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              ⛰️ Overworld
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <button onClick={handleExport} style={{ flex: 1, padding: '8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export</button>
            <button onClick={clearAll} style={{ flex: 1, padding: '8px', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
          </div>
          <button onClick={toggleGround} style={{ width: '100%', padding: '6px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginBottom: '8px' }}>
            {showGround ? 'Hide Ground' : 'Show Ground'}
          </button>

          {/* Scene Override Toggles */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <ToggleBtn label="☀️ Always Day" active={alwaysDay} onClick={toggleAlwaysDay} />
            <ToggleBtn label="🌤️ Always Clear" active={alwaysClear} onClick={toggleAlwaysClear} />
          </div>
        </div>

        {/* 3D PREVIEW WINDOW */}
        <div style={{ height: '200px', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
          {previewFile ? (
            <Canvas camera={{ position: [2, 2, 2] }}>
              <Suspense fallback={null}>
                <ModelPreview file={previewFile} />
                <OrbitControls autoRotate />
              </Suspense>
            </Canvas>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              Select a model
            </div>
          )}
          {previewFile && (
            <div style={{ position: 'absolute', bottom: 5, left: 5, fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '3px' }}>
              {previewFile}
            </div>
          )}
        </div>

        {/* MODEL LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {Object.entries(MODEL_CATEGORIES).map(([cat, files]) => (
            <div key={cat} style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#aaa', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>{cat}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {files.map(f => (
                  <div 
                    key={f}
                    onMouseEnter={() => setHoveredFile(f)}
                    onMouseLeave={() => setHoveredFile(null)}
                    onClick={() => setSelectedFile(selectedFile === f ? null : f)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      background: selectedFile === f ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                      color: selectedFile === f ? '#4CAF50' : '#ddd',
                      borderLeft: selectedFile === f ? '3px solid #4CAF50' : '3px solid transparent'
                    }}
                  >
                    {f.replace('.glb', '')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOOLBAR (BOTTOM CENTER) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(20, 20, 25, 0.9)',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        gap: '10px',
        pointerEvents: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Scene indicator pill */}
        <div style={{
          alignSelf: 'center',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          background: editorScene === 'island' ? 'rgba(156, 39, 176, 0.3)' : 'rgba(76, 175, 80, 0.3)',
          color: editorScene === 'island' ? '#CE93D8' : '#A5D6A7',
          border: `1px solid ${editorScene === 'island' ? '#9C27B0' : '#4CAF50'}`,
          marginRight: '5px'
        }}>
          {editorScene === 'island' ? '🏝️ Island' : '⛰️ Overworld'}
        </div>

        <div style={{ color: '#aaa', fontSize: '14px', alignSelf: 'center', marginRight: '10px' }}>Transform:</div>
        {['translate', 'rotate', 'scale'].map(mode => (
          <button
            key={mode}
            onClick={() => setTransformMode(mode)}
            style={{
              padding: '8px 16px',
              background: transformMode === mode ? '#2196F3' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {mode}
          </button>
        ))}
        {selectedId && (
          <>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }} />
            <button onClick={duplicateSelected} style={{ padding: '8px 16px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Duplicate</button>
            <button onClick={removeSelected} style={{ padding: '8px 16px', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
          </>
        )}
      </div>
      
    </div>
  );
}
