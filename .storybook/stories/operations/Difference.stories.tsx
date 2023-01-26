import React from 'react'
import { Base, Difference, Geometry } from '../../../src'
import { BoxBlendGeometry, Setup } from '../../common'

export default {
  title: 'Operations / Difference',
}

export const Basic = () => (
  <Setup camera={{ position: [1, 1, 3] }}>
    <group position={[0, 0, 0]}>
      <mesh>
        <Geometry>
          <Base position={[-0.3, -0.3, 0.4]}>
            <BoxBlendGeometry depth={0.5} />
          </Base>
          <Difference position={[0.3, 0.3, 0.4]}>
            <BoxBlendGeometry depth={0.8} />
          </Difference>
        </Geometry>
        <meshNormalMaterial opacity={0.6} transparent />
      </mesh>
    </group>
  </Setup>
)
