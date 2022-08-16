import React from 'react'
import { Brush, Difference } from '../../../src'
import { BoxBlendGeometry, Setup } from '../../common'

export default {
  title: 'Operations / Difference',
}

export const Basic = () => (
  <Setup camera={{ position: [1, 1, 3] }}>
    <group position={[0, 0, 0]}>
      <mesh>
        <Difference>
          <Brush a position={[-0.3, -0.3, 0.4]}>
            <BoxBlendGeometry depth={0.5} />
          </Brush>
          <Brush b position={[0.3, 0.3, 0.4]}>
            <BoxBlendGeometry depth={0.8} />
          </Brush>
        </Difference>
        <meshNormalMaterial opacity={0.6} transparent />
      </mesh>
    </group>
  </Setup>
)
