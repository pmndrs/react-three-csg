import React from 'react'
import { Base, Geometry, Intersection } from '../../../src'
import { BoxBlendGeometry, Setup } from '../../common'

export default {
  title: 'Operations / Intersection',
}

export const Basic = () => (
  <Setup camera={{ position: [1, 1, 3] }}>
    <group position={[0, 0, 0]}>
      <mesh>
        <Geometry>
          <Base position={[-0.3, -0.3, 0.4]}>
            <BoxBlendGeometry />
          </Base>
          <Intersection position={[0.3, 0.3, 0.4]}>
            <BoxBlendGeometry />
          </Intersection>
        </Geometry>
        <meshNormalMaterial />
      </mesh>

      <mesh position={[-0.3, -0.3, 0.4]}>
        <BoxBlendGeometry />
        <meshNormalMaterial opacity={0.4} transparent />
      </mesh>

      <mesh position={[0.3, 0.3, 0.4]}>
        <BoxBlendGeometry />
        <meshNormalMaterial opacity={0.4} transparent />
      </mesh>
    </group>
  </Setup>
)
