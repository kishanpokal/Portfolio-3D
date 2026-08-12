import useGameStore from '../../store/useGameStore';
import { Box, Sphere } from '@react-three/drei';

// Void Island 1: Identity / About Me
function IdentityIsland() {
  return (
    <group position={[0, 0, -10]}>
      {/* Floating Base */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
         <cylinderGeometry args={[10, 10, 0.5, 32]} />
         <meshStandardMaterial color="#1a1a2e" /> {/* Dark indigo base */}
      </mesh>
      
      {/* Text Slabs (Placeholders) */}
      <Box args={[3, 5, 0.5]} position={[-4, 2.5, -2]} castShadow>
         <meshStandardMaterial color="#0f3460" />
      </Box>
      <Box args={[4, 6, 0.5]} position={[0, 3, -4]} castShadow>
         <meshStandardMaterial color="#0f3460" />
      </Box>
      <Box args={[3, 5, 0.5]} position={[4, 2.5, -2]} castShadow>
         <meshStandardMaterial color="#0f3460" />
      </Box>
      
      {/* Glowing Rune / Accent */}
      <Sphere args={[0.5, 16, 16]} position={[0, 1, 3]}>
        <meshStandardMaterial color="#e94560" emissive="#e94560" emissiveIntensity={2} />
      </Sphere>
    </group>
  );
}

// Void Island 2: Time / Journey
function JourneyIsland() {
  return (
    <group position={[0, 0, -10]}>
       {/* Connected Islets */}
       <Sphere args={[2, 32, 32]} position={[-6, 0, 0]} castShadow>
           <meshStandardMaterial color="#16213e" />
       </Sphere>
       <Sphere args={[2, 32, 32]} position={[0, 0, -4]} castShadow>
           <meshStandardMaterial color="#16213e" />
       </Sphere>
       <Sphere args={[2, 32, 32]} position={[6, 0, 0]} castShadow>
           <meshStandardMaterial color="#16213e" />
       </Sphere>
       
       {/* Energy Bridges */}
       <mesh position={[-3, 0, -2]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[5, 0.1, 1]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
       </mesh>
       <mesh position={[3, 0, -2]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[5, 0.1, 1]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
       </mesh>
    </group>
  );
}

// Void Island 3: Creation / Projects
function ProjectsIsland() {
  return (
    <group position={[0, 0, -10]}>
       {/* Tech platform (Triangle) */}
       <mesh receiveShadow position={[0, -0.5, 0]}>
           <cylinderGeometry args={[8, 8, 1, 3]} /> 
           <meshStandardMaterial color="#0f3460" />
       </mesh>
       
       {/* Pedestal for Phone */}
       <Box args={[1.5, 3, 1.5]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#1a1a2e" />
       </Box>
       
       {/* Phone Placeholder */}
       <Box args={[1.2, 2.5, 0.1]} position={[0, 4.5, 0]} castShadow rotation={[0.2, 0, 0]}>
          <meshStandardMaterial color="#000" />
       </Box>
    </group>
  );
}

export default function Portals() {
  const currentLocation = useGameStore((state) => state.currentLocation);

  return (
    <>
      {currentLocation === 'void-island-1' && <IdentityIsland />}
      {currentLocation === 'void-island-2' && <JourneyIsland />}
      {currentLocation === 'void-island-3' && <ProjectsIsland />}
    </>
  );
}
