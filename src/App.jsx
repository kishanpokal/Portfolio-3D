import './index.css'
import Scene from './components/Canvas/Scene'
import useGameStore from './store/useGameStore'
import EditorScene from './components/Editor/EditorScene'
import EditorUI from './components/Editor/EditorUI'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
]

function App() {
  const { isEditor, toggleEditor } = useGameStore()

  return (
    <KeyboardControls map={keyboardMap}>
      {isEditor ? (
        <>
          <Canvas shadows gl={{ antialias: true }}>
            <EditorScene />
          </Canvas>
          <EditorUI />
        </>
      ) : (
        <>
          {/* 3D Canvas Layer */}
          <Scene />
          
          {/* Portfolio Name */}
          <div style={{
            position: 'fixed',
            top: '24px',
            left: '32px',
            zIndex: 100,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 0 20px rgba(120, 80, 200, 0.6), 0 2px 8px rgba(0,0,0,0.5)',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              textTransform: 'uppercase',
            }}>
              Kishan Pokal
            </h1>
            <p style={{
              margin: '4px 0 0 2px',
              fontSize: '12px',
              letterSpacing: '5px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              textTransform: 'uppercase',
            }}>
              Portfolio
            </p>
          </div>
        </>
      )}

      {/* Editor Toggle Button */}
      <button 
        onClick={toggleEditor}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: isEditor ? '#F44336' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {isEditor ? 'Exit Editor' : 'Map Editor'}
      </button>
    </KeyboardControls>
  )
}

export default App
