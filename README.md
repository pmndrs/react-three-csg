<p>
  <a href="https://codesandbox.io/s/eckvc1"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/eckvc1/screenshot.png" alt="Demo"/></a>
  <a href="https://codesandbox.io/s/mw0dtc"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/mw0dtc/screenshot.png" alt="Demo"/></a>
</p>

```shell
yarn add @react-three/csg
```

A small, abstraction around https://github.com/gkjohnson/three-bvh-csg. It is not feature complete!

You have 4 operations:

- Subtraction
- Addition
- Difference
- Intersection

Each can take a `<Brush>`, which is like a THREE.Mesh, it needs a geometry. A brush must be either slot `a` or `b` (first & second operand), which you need to define as a prop.

If you nest operations, the operation itself becomes a brush and must also define a slot.

```jsx
import { Brush, Subtraction, Addition, Difference, Intersection } from '@react-three/csg'

function Model() {
  return (
    <Subtraction>
      <Subtraction a>
        <Brush a scale={1.5} position={[0, -1.04, 0]} geometry={nodes.bunny.geometry} />
        <Brush b ref={mesh} position={[0.5, -0.75, 1]}>
          <sphereGeometry />
        </Brush>
      </Subtraction>
      <Brush b position={[-1, 1, 1]}>
        <sphereGeometry />
      </Brush>
      <meshNormalMaterial />
    </Subtraction>
  )
}
```

#### Updating the operations

If you update a brush, or an operation, set `needsUpdate` on it, it will bubble up to its base operation. Keep in mind that although the base CSG implementation is fast, this is something you may want to avoid doing often or runtime, depending on the complexity of your geometry.

```jsx
function Shape() {
  const brush = useRef()
  useFrame((state, delta) => {
    brush.current.rotation.x += 0.025
    brush.current.needsUpdate = true
  })
  return (
      <Subtraction castShadow receiveShadow>
        <Brush a rotation={[0, Math.PI / 2, 0]} position={[-0.35, 0.4, 0.4]}>
          <boxGeometry />
        </Brush>
        <Brush b ref={brush} position={[-0.35, 0.4, 0.4]}>
          <boxGeometry />
        </Brush>
```        