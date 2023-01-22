<p>
  <a href="https://codesandbox.io/s/mlgzsc"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/mlgzsc/screenshot.png" alt="Demo"/></a>
  <a href="https://codesandbox.io/s/y52tmt"><img width="20%" src="https://codesandbox.io/api/v1/sandboxes/y52tmt/screenshot.png" alt="Demo"/></a>
</p>

```shell
yarn add @react-three/csg
```

A small, abstraction around https://github.com/gkjohnson/three-bvh-csg.

You begin with a `CSG.Geometry` which is a regular `THREE.BufferGeometry` that you can pair with a `mesh`. You must first give it a `CSG.Base` which defines the base geometry to be operated upon. And now you chain your operations (`Subtraction`, `Addition`, `Difference`, `Intersection`), as many as you like. The order of operations is imporant! Think of it like an equation: bunnyGeometry + sphereGeometry - boxGeometry ... = outputGeometry.

```jsx
function Cross() {
  return (
    <mesh>
      <meshStandardMaterial />
      <CSG.Geometry>
        <CSG.Base scale={[2, 0.5, 0.5]} >
          <boxGeometry />
        </CSG.Base>
        <CSG.Addition scale={[0.5, 2, 0.5]}>
          <boxGeometry />
        </CSG.Addition>
      <CSG.Geometry>
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
      <CSG.Geometry>
        {/** The chain begins with a base geometry, where all operations are carried out on. */}
        <CSG.Base geometry={bunnyGeometry} scale={1.5} position={[0, 0.5, 0]} />
        {/** Chain your boolean operations: Addition, Subtraction, Difference and Intersection. */}
        <CSG.Subtraction position={[-1, 1, 1]}>
          {/** Geometry can be set by prop or by child, just like any regular <mesh>. */}
          <sphereGeometry />
        </CSG.Subtraction>
        {/** CSG.Geometry is re-usable, form hierachies with previously created CSG geometries. */}
        <CSG.Addition position={[0, 0, -0.75]}>
          {/** Combining two boxes into a cross */}
          <CSG.Geometry>
            <CSG.Base geometry={boxGeometry} scale={[2, 0.5, 0.5]} />
            <CSG.Addition geometry={boxGeometry} scale={[0.5, 2, 0.5]} />
          </CSG.Geometry>
        </CSG.Addition>
        {/** You can deeply nest operations. */}
        <group position={[0.5, 1, 0.9]}>
          <CSG.Subtraction>
            <sphereGeometry args={[0.65, 32, 32]} />
          </CSG.Subtraction>
        </group>
      </CSG.Geometry>
    </mesh>
  )
}
```

#### Updating the operations and runtime usage

Call `update()` on the main geometry to re-create it. Keep in mind that although the base CSG implementation is fast, this is something you may want to avoid doing often or runtime, depending on the complexity of your geometry.

The following would allow the user to move a cutter around with the mouse.

```jsx
import { PivotControls } from '@react-three/drei'

function Shape() {
  const csg = useRef()
  return (
    <mesh>
      <CSG.Geometry ref={csg}>
        <CSG.Base geometry={bunnyGeometry} />
        <PivotControls depthTest={false} anchor={[0, 0, 0]} onDrag={() => csg.current.update()}>
          <CSG.Subtraction geometry={sphereGeometry} />
        </PivotControls>
```

#### Using multi-material groups

With the `useGroups` prop you can instruct CSG to generate material groups. Thereby instead of ending up with a single clump of uniformly textured geometry you can, for instance, make cuts with different materials. Each operation now takes its own material! The resulting material group will be inserted into the mesh that carries the output operation.

```jsx
function Shape() {
  return (
    <mesh>
      <CSG.Geometry useGroups>
        <CSG.Base geometry={bunnyGeometry}>
          {/** The base material. Again it can be defined by prop or by child. */}
          <meshStandardMaterial />
        </CSG.Base>
        <CSG.Subtraction position={[-1, 1, 1]} material={metal}>
          {/** This cut-out will be blue. */ }
          <meshStandardMaterial color="blue" />
        </CSG.Subtraction>
        {/** etc. */}
        <CSG.Addition position={[1, -1, -1]} geometry={sphereGeometry} material={stone}>
```

#### Showing the operations

The following will make all operations visible.

```jsx
function Shape() {
  return (
    <mesh>
      <CSG.Geometry showOperations>
```

Whereas if you want to show only a single operation, you can do so by setting the `showOperation` prop on the root.

```jsx
function Shape() {
  return (
    <mesh>
      <CSG.Geometry>
        <CSG.Base geometry={bunnyGeometry} />
        <CSG.Addition geometry={carrotGeometry} showOperation />
```
