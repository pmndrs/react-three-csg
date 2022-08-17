import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import { Brush, BrushRef, Subtraction } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Advanced / Updating',
}

const UpdatingExample = () => {
  const brush = useRef<BrushRef>(null!)

  useFrame((_, delta) => {
    brush.current.rotation.x += 0.5 * delta
    brush.current.needsUpdate = true
  })

  return (
    <mesh>
      <Subtraction a>
        <Brush a ref={brush} position={[0, 0, -0.5]}>
          <boxBufferGeometry args={[1, 1, 1]} />
        </Brush>
        <Brush b>
          <sphereBufferGeometry args={[0.45, 64, 64]} />
        </Brush>
      </Subtraction>
      <meshNormalMaterial />
    </mesh>
  )
}

export const Updating = () => (
  <Setup>
    <UpdatingExample />
  </Setup>
)
