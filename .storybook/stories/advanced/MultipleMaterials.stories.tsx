import React from 'react'
import { Addition, Base, Geometry, Subtraction } from '../../../src'
import { Setup } from '../../common'

export default {
  title: 'Advanced / Multiple Materials',
}

export const MultipleMaterials = () => {
  return (
    <Setup>
      <mesh>
        <Geometry useGroups>
          <Base>
            <boxBufferGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="orange" />
          </Base>
          <Subtraction position={[0.5, 0.5, 0.5]}>
            <sphereBufferGeometry args={[0.65, 64, 64]} />
            <meshNormalMaterial />
          </Subtraction>
          <Addition position={[-0.5, -0.5, -0.5]}>
            <sphereBufferGeometry args={[1, 64, 64]} />
            <meshNormalMaterial />
          </Addition>
        </Geometry>
      </mesh>
    </Setup>
  )
}
