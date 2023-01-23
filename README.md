<p>
  <a href="https://codesandbox.io/s/mlgzsc"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/mlgzsc/screenshot.png" alt="Demo"/></a>
  <a href="https://codesandbox.io/s/y52tmt"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/y52tmt/screenshot.png" alt="Interactive"/></a>
  <a href="https://codesandbox.io/s/mw0dtc"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/mw0dtc/screenshot.png" alt="Physics"/></a>
  <a href="https://codesandbox.io/s/k3ly88"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/k3ly88/screenshot.png" alt="Instances"/></a>
</p>

```shell
yarn add @react-three/csg
```

Constructive solid geometry for React, a small abstraction around [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg).

Begin with a `Geometry` which is a regular `THREE.BufferGeometry` that you can pair with a `mesh`, or anything else that relies on geometry (physics rigid bodies etc).

```jsx
import { Geometry, Base, Addition, Subtraction, Intersection, Difference } from '@react-three/csg'

function Cross() {
  return (
    <mesh>
      <meshStandardMaterial />
      <Geometry>
```

You must first give it a `Base` which is the geometry foundation for all ensuing operations. All operations within `Geometry`, including `Base`, behave like regular meshes. They all receive geometry (and optionally a material, see [using-multi-material-groups](#using-multi-material-groups)), you can also nest, group and transform them.

```jsx
        <Base scale={[2, 0.5, 0.5]}>
          <boxGeometry />
        </Base>
```

Now you chain your operations, as many as you like, but keep in mind that order matters. The following operations are available:

- `Subtraction` subtracts the geometry from the previous
- `Addition` adds the geometry to the previous
- `Intersection` is the overlap between the geometry and the previous
- `Difference` is the negative overlap between the geometry and the previous

```jsx
        <Addition scale={[0.5, 2, 0.5]}>
          <boxGeometry />
        </Addition>
      <Geometry>
    </mesh>
  )
}
```

#### A more complex example

```jsx
import * as CSG from '@react-three/csg'

function Shape() {
  return (
    <mesh>
      <meshNormalMaterial />
      {/** This will yield a regular THREE.BufferGeometry which needs to be paired with a mesh. */}
      <Geometry>
        {/** The chain begins with a base geometry, where all operations are carried out on. */}
        <Base geometry={bunnyGeometry} scale={1.5} position={[0, 0.5, 0]} />
        {/** Chain your boolean operations: Addition, Subtraction, Difference and Intersection. */}
        <Subtraction position={[-1, 1, 1]}>
          {/** Geometry can be set by prop or by child, just like any regular <mesh>. */}
          <sphereGeometry />
        </Subtraction>
        {/** Geometry is re-usable, form hierachies with previously created CSG geometries. */}
        <Addition position={[0, 0, -0.75]}>
          {/** Combining two boxes into a cross */}
          <Geometry>
            <Base geometry={boxGeometry} scale={[2, 0.5, 0.5]} />
            <Addition geometry={boxGeometry} scale={[0.5, 2, 0.5]} />
          </Geometry>
        </Addition>
        {/** You can deeply nest operations. */}
        <group position={[0.5, 1, 0.9]}>
          <Subtraction>
            <sphereGeometry args={[0.65, 32, 32]} />
          </Subtraction>
        </group>
      </Geometry>
    </mesh>
  )
}
```

#### Updating the operations and runtime usage

Call `update()` on the main geometry to re-create it. Keep in mind that although the base CSG implementation is fast, this is something you may want to avoid doing often or runtime, depending on the complexity of your geometry. By default it will compute vertex normals (to fix lighting issues), if you don't want that just call `update(false)`.

The following would allow the user to move a cutter around with the mouse.

```jsx
import { PivotControls } from '@react-three/drei'

function Shape() {
  const csg = useRef()
  return (
    <mesh>
      <Geometry ref={csg}>
        <Base geometry={bunnyGeometry} />
        <PivotControls depthTest={false} anchor={[0, 0, 0]} onDrag={() => csg.current.update()}>
          <Subtraction geometry={sphereGeometry} />
        </PivotControls>
```

#### Using multi-material groups

With the `useGroups` prop you can instruct CSG to generate material groups. Thereby instead of ending up with a single clump of uniformly textured geometry you can, for instance, make cuts with different materials. Each operation now takes its own material! The resulting material group will be inserted into the mesh that carries the output operation.

```jsx
function Shape() {
  return (
    <mesh>
      <Geometry useGroups>
        <Base geometry={bunnyGeometry}>
          {/** The base material. Again it can be defined by prop or by child. */}
          <meshStandardMaterial />
        </Base>
        <Subtraction position={[-1, 1, 1]} material={metal}>
          {/** This cut-out will be blue. */ }
          <meshStandardMaterial color="blue" />
        </Subtraction>
        {/** etc. */}
        <Addition position={[1, -1, -1]} geometry={sphereGeometry} material={stone}>
```

#### Showing the operations

The following will make all operations visible.

```jsx
function Shape() {
  return (
    <mesh>
      <Geometry showOperations>
```

Whereas if you want to show only a single operation, you can do so by setting the `showOperation` prop on the root.

```jsx
function Shape() {
  return (
    <mesh>
      <Geometry>
        <Base geometry={bunnyGeometry} />
        <Addition geometry={carrotGeometry} showOperation />
```
