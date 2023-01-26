import React from 'react'
import { Addition, Base, Geometry } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Operations / Addition',
}

export const Basic = () => (
  <Setup>
    <mesh>
      <Geometry>
        <Base position-z={0.5}>
          <boxBufferGeometry args={[1, 1, 1]} />
        </Base>
        <Addition position-z={-0.5}>
          <sphereBufferGeometry args={[1, 64, 64]} />
        </Addition>
      </Geometry>
      <meshNormalMaterial />
    </mesh>
  </Setup>
)
