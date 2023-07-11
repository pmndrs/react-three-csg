import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import { Base, BaseRef, CSGGeometryRef, Geometry, Subtraction } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Advanced / Updating',
}

const UpdatingExample = () => {
  const csg = useRef<CSGGeometryRef>(null!)
  const base = useRef<BaseRef>(null!)

  useFrame((_, delta) => {
    base.current.rotation.x += 0.5 * delta
    csg.current.update()
  })

  return (
    <mesh>
      <Geometry ref={csg}>
        <Base position={[0, 0, -0.5]} ref={base}>
          <boxGeometry args={[1, 1, 1]} />
        </Base>
        <Subtraction>
          <sphereGeometry args={[0.45, 64, 64]} />
        </Subtraction>
      </Geometry>
      <meshNormalMaterial />
    </mesh>
  )
}

export const Updating = () => (
  <Setup>
    <UpdatingExample />
  </Setup>
)
