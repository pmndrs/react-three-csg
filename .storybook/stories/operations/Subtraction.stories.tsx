import React from 'react'
import { Base, Geometry, Subtraction } from '../../../src'
import { BoxBlendGeometry, HeartGeometry, Setup } from '../../common'

export default {
  title: 'Operations / Subtraction',
}

export const Basic = () => (
  <Setup>
    <mesh>
      <Geometry>
        <Base rotation={[0, Math.PI / 2, 0]} position={[-0.35, 0.4, 0.4]}>
          <BoxBlendGeometry depth={0.75} />
        </Base>
        <Subtraction position={[-0.35, 0.4, 0.4]}>
          <HeartGeometry radius={0.6} depth={3} />
        </Subtraction>
      </Geometry>
      <meshNormalMaterial />
    </mesh>
  </Setup>
)
