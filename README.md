```shell
yarn add @react-three/csg
```

A small abstraction around https://github.com/gkjohnson/three-bvh-csg

Demo: https://codesandbox.io/s/busy-swirles-eckvc1?file=/src/App.js

You have 4 operations:

- Subtraction
- Addition
- Difference
- Intersection

Each can take a `<Brush>`, which is like a THREE.Mesh, it needs a geometry. A brush must be either slot `a` or `b` (first, second operand), which you need to define as a prop.

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
