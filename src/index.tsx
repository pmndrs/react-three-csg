import * as React from 'react'
import * as THREE from 'three'
import { extend, ReactThreeFiber } from '@react-three/fiber'
import { SUBTRACTION, ADDITION, DIFFERENCE, INTERSECTION, Brush as BrushImpl, Evaluator } from 'three-bvh-csg'

const TYPES = {
  subtraction: SUBTRACTION,
  addition: ADDITION,
  difference: DIFFERENCE,
  intersection: INTERSECTION,
}

export type Brush = BrushImpl & {
  operator: keyof typeof TYPES
  showOperation?: boolean
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      brush: ReactThreeFiber.Object3DNode<Brush, typeof THREE.Mesh>
    }
  }
}

export type CSGGeometryProps = {
  children?: React.ReactNode
  useGroups?: boolean
  showOperations?: boolean
}

export type CSGGeometryApi = {
  showOperations: boolean
  useGroups: boolean
  update: () => void
}

export type CSGGeometryRef = CSGGeometryApi & {
  geometry: THREE.BufferGeometry
  operations: THREE.Group
}

function dispose(geometry: THREE.BufferGeometry) {
  geometry.dispose()
  geometry.attributes = {}
  geometry.groups = []
  geometry.boundingBox = null
  geometry.boundingSphere = null
  geometry.drawRange = { start: 0, count: Infinity }
}

function resolve(op: THREE.Object3D): Brush {
  let currentOp: THREE.Object3D = null!
  if (op instanceof BrushImpl) {
    op.updateMatrixWorld()
    currentOp = op
  } else {
    op.traverse((obj) => {
      obj.updateMatrixWorld()
      if (!currentOp && obj instanceof BrushImpl) currentOp = obj
    })
  }
  return currentOp as Brush
}

const csgContext = React.createContext<CSGGeometryApi>(null!)
export const Geometry = React.forwardRef(
  (
    { children, useGroups = false, showOperations = false }: CSGGeometryProps,
    fref: React.ForwardedRef<CSGGeometryRef>
  ) => {
    const geo = React.useRef<THREE.BufferGeometry>(null!)
    const operations = React.useRef<THREE.Group>(null!)
    const ev = React.useMemo(() => Object.assign(new Evaluator(), { useGroups }), [useGroups])

    const update = React.useCallback(() => {
      try {
        const ops = operations.current.children.slice() as Brush[]
        if (ops.length > 1) {
          // Dispose old geometry
          dispose(geo.current)
          // Set the ops groups matrix to identiy
          operations.current.matrixWorld.identity()

          let root = resolve(ops.shift()!)
          if (root) {
            while (ops.length) {
              const op = resolve(ops.shift()!)
              if (op) root = ev.evaluate(root, op, TYPES[op.operator] || ADDITION) as Brush
            }
            geo.current.attributes = root.geometry.attributes
            geo.current.groups = root.geometry.groups
            geo.current.drawRange = root.geometry.drawRange
            if (ev.useGroups && (geo.current as any)?.__r3f?.parent?.material)
              (geo.current as any).__r3f.parent.material = root.material
          }
        }
      } catch (e) {
        console.log(e)
      }
    }, [ev])

    const api = React.useMemo(() => ({ showOperations, useGroups, update }), [showOperations, useGroups])
    React.useLayoutEffect(() => void update())
    React.useImperativeHandle(fref, () => ({ geometry: geo.current, operations: operations.current, ...api }), [api])

    return (
      <>
        <group matrixAutoUpdate={false} ref={operations}>
          <csgContext.Provider value={api}>{children}</csgContext.Provider>
        </group>
        <bufferGeometry ref={geo} />
      </>
    )
  }
)

export const Base = React.forwardRef(
  (
    { showOperation, operator = 'addition', ...props }: JSX.IntrinsicElements['brush'],
    fref: React.ForwardedRef<Brush>
  ) => {
    extend({ Brush: BrushImpl })
    const { showOperations } = React.useContext(csgContext)
    return (
      <brush
        operator={operator}
        raycast={() => null}
        visible={showOperation || showOperations ? true : false}
        ref={fref}
        {...props}
      />
    )
  }
)

export const Addition = React.forwardRef((props, fref: React.ForwardedRef<Brush>) => (
  <Base ref={fref} operator="addition" {...props} />
))
export const Subtraction = React.forwardRef((props, fref: React.ForwardedRef<Brush>) => (
  <Base ref={fref} operator="subtraction" {...props} />
))
export const Difference = React.forwardRef((props, fref: React.ForwardedRef<Brush>) => (
  <Base ref={fref} operator="difference" {...props} />
))
export const Intersection = React.forwardRef((props, fref: React.ForwardedRef<Brush>) => (
  <Base ref={fref} operator="intersection" {...props} />
))
