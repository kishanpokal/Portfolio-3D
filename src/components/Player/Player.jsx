import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

const SPEED = 4
const JUMP_FORCE = 4
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export default function Player({ spawnPoint = [0, 3, 0], fallThreshold = -50 }) {
  const ref = useRef()
  const [, get] = useKeyboardControls()
  const { camera } = useThree()
  const canJump = useRef(true)

  useFrame(() => {
    if (!ref.current) return

    const { forward, backward, left, right, jump } = get()
    const velocity = ref.current.linvel()
    
    // Movement logic
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)
    
    // Get the actual camera look direction and extract yaw from it
    const cameraDir = new THREE.Vector3()
    camera.getWorldDirection(cameraDir)
    const yaw = Math.atan2(-cameraDir.x, -cameraDir.z)
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)

    if (forward || backward || left || right || jump) {
      ref.current.wakeUp()
    }

    ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

    // Ground detection: if vertical velocity is near zero, player is on ground
    const isGrounded = Math.abs(velocity.y) < 0.5

    // Jump — use velocity-based ground check (avoids raycast hitting own collider)
    if (jump && isGrounded && canJump.current) {
      ref.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true)
      canJump.current = false
      setTimeout(() => { canJump.current = true }, 400)
    }

    // Attach camera to player
    const translation = ref.current.translation()
    camera.position.set(translation.x, translation.y + 0.4, translation.z)

    // Respawn if fallen off the island
    if (translation.y < fallThreshold) {
      ref.current.setTranslation({ x: spawnPoint[0], y: spawnPoint[1], z: spawnPoint[2] }, true)
      ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <>
      <PointerLockControls />
      <RigidBody 
        ref={ref} 
        colliders={false} 
        mass={1} 
        type="dynamic" 
        position={spawnPoint}
        enabledRotations={[false, false, false]}
        linearDamping={0.5}
        ccd={true}
      >
        <CapsuleCollider args={[0.3, 0.4]} friction={0.2} restitution={0} />
      </RigidBody>
    </>
  )
}
