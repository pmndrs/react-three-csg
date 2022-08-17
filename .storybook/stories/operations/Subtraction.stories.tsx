import React from 'react'
import { Brush, Subtraction } from '../../../src'
import { BoxBlendGeometry, HeartGeometry, Setup } from '../../common'

export default {
  title: 'Operations / Subtraction',
}

export const Basic = () => (
  <Setup>
    <mesh>
      <Subtraction>
        <Brush a rotation={[0, Math.PI / 2, 0]} position={[-0.35, 0.4, 0.4]}>
          <BoxBlendGeometry depth={0.75} />
        </Brush>
        <Brush b position={[-0.35, 0.4, 0.4]}>
          <HeartGeometry radius={0.6} depth={3} />
        </Brush>
      </Subtraction>
      <meshNormalMaterial />
    </mesh>
  </Setup>
)

export const Nested = () => (
  <Setup>
    <mesh>
      <Subtraction>
        <Subtraction a>
          <Brush a rotation={[0, Math.PI / 2, 0]} position={[-0.35, 0.4, 0.4]}>
            <BoxBlendGeometry depth={0.75} width={2} height={2} />
          </Brush>
          <Brush b position={[-0.35, 0, 0.4]}>
            <HeartGeometry radius={0.6} depth={3} />
          </Brush>
        </Subtraction>
        <Brush b position={[-0.35, 0.8, 0.4]}>
          <HeartGeometry radius={0.6} depth={3} />
        </Brush>
      </Subtraction>
      <meshNormalMaterial />
    </mesh>
  </Setup>
)
