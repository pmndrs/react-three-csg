import * as React from 'react'
import { Vector3 } from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Canvas, CanvasProps, extend, ThreeElement, useThree } from '@react-three/fiber'

const OrbitControls = extend(OrbitControlsImpl)

function Controls(props: Omit<ThreeElement<typeof OrbitControlsImpl>, 'args'>) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)

  return <OrbitControls enableDamping {...props} args={[camera, gl.domElement]} />
}

export type SetupProps = React.PropsWithChildren<
  CanvasProps & {
    cameraFov?: number
    cameraPosition?: Vector3
    controls?: boolean
    lights?: boolean
  }
>

export const Setup = ({
  children,
  cameraFov = 55,
  cameraPosition = new Vector3(-5, 4, 4),
  controls = true,
  lights = true,
  ...restProps
}: SetupProps) => (
  <Canvas shadows camera={{ position: cameraPosition, fov: cameraFov }} {...restProps}>
    {children}
    {lights && (
      <>
        <ambientLight intensity={0.8} />
        <pointLight intensity={1} position={[0, 6, 0]} />
      </>
    )}
    {controls && <Controls />}
  </Canvas>
)
