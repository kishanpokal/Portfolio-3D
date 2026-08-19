import React, { useRef, Suspense, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Grid, TransformControls, OrbitControls, useGLTF, Clone } from '@react-three/drei';
import useEditorStore from '../../store/useEditorStore';
import { IslandEnvironment } from '../Canvas/FloatingIsland';

const B = '/models/';

function PlacedModel({ data, onSelect, isSelected, transformMode, updateModel }) {
  const { scene } = useGLTF(B + data.file);
  
  if (isSelected) {
    return (
      <TransformControls
        mode={transformMode}
        position={data.position}
        rotation={data.rotation}
        scale={data.scale}
        onMouseUp={(e) => {
          if (e.target.object) {
            updateModel(data.id, {
              position: e.target.object.position.toArray(),
              rotation: e.target.object.rotation.toArray(),
              scale: e.target.object.scale.toArray()
            });
          }
        }}
      >
        <group onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}>
          <Clone object={scene} />
        </group>
      </TransformControls>
    );
  }

  return (
    <group 
      position={data.position} 
      rotation={data.rotation} 
      scale={data.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
    >
      <Clone object={scene} />
    </group>
  );
}

function EditorContent() {
  const editorScene = useEditorStore(s => s.editorScene);
  const overworldModels = useEditorStore(s => s.overworldModels);
  const islandModels = useEditorStore(s => s.islandModels);
  const contactModels = useEditorStore(s => s.contactModels);
  const selectedId = useEditorStore(s => s.selectedId);
  const selectedFile = useEditorStore(s => s.selectedFile);
  const addModel = useEditorStore(s => s.addModel);
  const updateModel = useEditorStore(s => s.updateModel);
  const setSelectedId = useEditorStore(s => s.setSelectedId);
  const transformMode = useEditorStore(s => s.transformMode);
  const clearSelection = useEditorStore(s => s.clearSelection);
  const showGround = useEditorStore(s => s.showGround);

  const placedModels = editorScene === 'contact'
    ? contactModels
    : (editorScene === 'island' ? islandModels : overworldModels);
  
  const { camera } = useThree();
  const controlsRef = useRef();
  
  const selectedModel = placedModels.find(m => m.id === selectedId);

  // Focus on scene change
  useEffect(() => {
    if (controlsRef.current) {
      if (editorScene === 'contact') {
        controlsRef.current.target.set(38, 1, 0);
        camera.position.set(38 + 12, 12, 12);
      } else if (editorScene === 'island') {
        controlsRef.current.target.set(0, 1, 0);
        camera.position.set(12, 12, 12);
      } else {
        controlsRef.current.target.set(0, 0, 0);
        camera.position.set(15, 15, 15);
      }
      controlsRef.current.update();
    }
  }, [editorScene, camera]);

  // 'F' key to focus on selected model
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'f' && selectedModel && controlsRef.current) {
        const [x, y, z] = selectedModel.position;
        controlsRef.current.target.set(x, y, z);
        camera.position.set(x + 5, y + 5, z + 5);
        controlsRef.current.update();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModel, camera]);

  const handleClick = (e) => {
    if (e.object?.name === 'placementPlane') {
      if (selectedFile && !selectedId) {
        addModel(selectedFile, [e.point.x, e.point.y, e.point.z]);
      } else {
        clearSelection();
      }
    }
  };

  const isIsland = editorScene === 'island' || editorScene === 'contact';

  return (
    <>
      <OrbitControls ref={controlsRef} makeDefault />
      
      {/* Lighting */}
      {isIsland ? (
        <>
          {/* Island scenes get the sky environment */}
          <IslandEnvironment weather="sunny" />
        </>
      ) : (
        <>
          {/* Overworld scene gets standard lighting */}
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        </>
      )}

      {/* Grid for reference */}
      <Grid 
        args={[150, 150]} 
        position={[0, -0.01, 0]} 
        cellColor="#666" 
        sectionColor="#999" 
        fadeDistance={75}
        visible={!showGround}
      />

      {/* Visual Ground (overworld only) */}
      {showGround && !isIsland && (
        <mesh position={[4, -0.52, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4a7c3f" roughness={0.95} />
        </mesh>
      )}

      {/* Invisible plane to catch clicks for placement */}
      <mesh 
        name="placementPlane" 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, isIsland ? 0 : 0, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Render all placed models */}
      {placedModels.map(model => (
        <PlacedModel 
          key={model.id} 
          data={model} 
          onSelect={setSelectedId}
          isSelected={model.id === selectedId}
          transformMode={transformMode}
          updateModel={updateModel}
        />
      ))}
    </>
  );
}

export default function EditorScene() {
  return (
    <Suspense fallback={null}>
      <EditorContent />
    </Suspense>
  );
}
