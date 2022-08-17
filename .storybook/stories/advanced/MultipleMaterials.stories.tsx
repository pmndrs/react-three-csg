import React from 'react'
import { Addition, Brush, Subtraction } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Advanced / Multiple Materials',
}

export const MultipleMaterials = () => {
  return (
    <Setup>
      <mesh>
        <Addition useGroups>
          <Subtraction a useGroups>
            <Brush a>
              <boxBufferGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="orange" />
            </Brush>
            <Brush b position={[0.5, 0.5, 0.5]}>
              <sphereBufferGeometry args={[0.65, 64, 64]} />
              <meshNormalMaterial />
            </Brush>
          </Subtraction>
          <Brush b position={[-0.5, -0.5, -0.5]}>
            <sphereBufferGeometry args={[1, 64, 64]} />
            <meshNormalMaterial />
          </Brush>
        </Addition>
      </mesh>
    </Setup>
  )
}
