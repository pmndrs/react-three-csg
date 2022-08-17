import React from 'react'
import { Addition, Brush } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Operations / Addition',
}

export const Basic = () => (
  <Setup>
    <mesh>
      <Addition>
        <Brush a position-z={0.5}>
          <boxBufferGeometry args={[1, 1, 1]} />
        </Brush>
        <Brush b position-z={-0.5}>
          <sphereBufferGeometry args={[1, 64, 64]} />
        </Brush>
      </Addition>
      <meshNormalMaterial />
    </mesh>
  </Setup>
)
