import * as React from 'react'
import * as THREE from 'three'
import { extend, ReactThreeFiber, ThreeElements } from '@react-three/fiber'
import {
  SUBTRACTION,
  ADDITION,
  DIFFERENCE,
  INTERSECTION,
  REVERSE_SUBTRACTION,
  Brush as BrushImpl,
  Evaluator,
} from 'three-bvh-csg'

const TYPES = {
  subtraction: SUBTRACTION,
  reverseSubtraction: REVERSE_SUBTRACTION,
  addition: ADDITION,
  difference: DIFFERENCE,
  intersection: INTERSECTION,
}

export class Brush extends BrushImpl {
  operator: keyof typeof TYPES = 'addition'
  showOperation?: boolean
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    brush: ReactThreeFiber.ThreeElement<typeof Brush>
  }
}

export type CSGGeometryProps = {
  children?: React.ReactNode
  /** Use material groups, each operation can have its own material, default: false */
  useGroups?: boolean
  /** Show operation meshes, default: false */
  showOperations?: boolean
  /** Re-compute vertx normals, default: false */
  computeVertexNormals?: boolean
}

export type CSGGeometryApi = {
  computeVertexNormals: boolean
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
  ;(geometry as any).boundsTree = geometry.index = geometry.boundingBox = geometry.boundingSphere = null
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

export const Geometry = ({
  children,
  computeVertexNormals = false,
  useGroups = false,
  showOperations = false,
  ref: fref,
}: { ref?: React.RefObject<CSGGeometryRef> } & CSGGeometryProps) => {
  const geo = React.useRef<THREE.BufferGeometry>(null!)
  const operations = React.useRef<THREE.Group>(null!)
  const ev = React.useMemo(() => Object.assign(new Evaluator(), { useGroups }), [useGroups])

  const update = React.useCallback(() => {
    try {
      const ops = operations.current.children.slice() as Brush[]
      if (ops.length > 0) {
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
          ;(geo.current as any).boundsTree = (root.geometry as any).boundsTree
          geo.current.index = root.geometry.index
          geo.current.attributes = root.geometry.attributes
          geo.current.groups = root.geometry.groups
          geo.current.drawRange = root.geometry.drawRange
          if (ev.useGroups && (geo.current as any)?.__r3f?.parent?.material)
            (geo.current as any).__r3f.parent.material = root.material
          if (computeVertexNormals) geo.current.computeVertexNormals()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [computeVertexNormals, ev])

  const api = React.useMemo(
    () => ({ computeVertexNormals, showOperations, useGroups, update }),
    [computeVertexNormals, showOperations, useGroups]
  )
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

export type BaseProps = ThreeElements['brush']
export type BaseRef = Brush
// export const Base = React.forwardRef<Brush, BaseProps>(
export const Base = ({
  showOperation = false,
  operator = 'addition',
  ref: fref,
  ...props
}: { ref?: Brush } & BaseProps) => {
  extend({ Brush })
  const { showOperations } = React.useContext(csgContext)
  return (
    <brush operator={operator} raycast={() => null} visible={showOperation || showOperations} ref={fref} {...props} />
  )
}

type OperationProps = Omit<BaseProps, 'operator'>

export type AdditionProps = OperationProps
export type AdditionRef = BaseRef
export const Addition = ({ ref: fref, ...props }: { ref?: AdditionRef } & AdditionProps) => (
  <Base ref={fref} operator="addition" {...props} />
)

export type SubtractionProps = OperationProps
export type SubtractionRef = BaseRef
export const Subtraction = ({ ref: fref, ...props }: { ref?: SubtractionRef } & SubtractionProps) => (
  <Base ref={fref} operator="subtraction" {...props} />
)

export type ReverseSubtractionProps = OperationProps
export type ReverseSubtractionRef = BaseRef
export const ReverseSubtraction = ({
  ref: fref,
  ...props
}: { ref?: ReverseSubtractionRef } & ReverseSubtractionProps) => (
  <Base ref={fref} operator="reverseSubtraction" {...props} />
)

export type DifferenceProps = OperationProps
export type DifferenceRef = BaseRef
export const Difference = ({ ref: fref, ...props }: { ref?: DifferenceRef } & DifferenceProps) => (
  <Base ref={fref} operator="difference" {...props} />
)

export type IntersectionProps = OperationProps
export type IntersectionRef = BaseRef
export const Intersection = ({ ref: fref, ...props }: { ref?: IntersectionRef } & IntersectionProps) => (
  <Base ref={fref} operator="intersection" {...props} />
)

export function useCSG() {
  return React.useContext(csgContext)
}
