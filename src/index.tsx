import * as THREE from 'three'
import React, {
  createContext,
  forwardRef,
  useMemo,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'
/** @ts-ignore */
import * as CSG from './packages/three-bvh-csg'
/** @ts-ignore */
export * from './packages/three-bvh-csg'

type Brush = THREE.Mesh & {
  a: any
  b: any
  needsUpdate: boolean
}

type BrushProps = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
}

type OperationProps = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
  op: number
}

type Api = {
  parent: Api
  slots: [Brush | null, Brush | null]
  update: (force?: boolean) => void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      brush: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
    }
  }
}

const context = createContext<Api>(null!)

export const Brush = forwardRef(({ a, b, children, ...props }: BrushProps, fref: React.ForwardedRef<Brush>) => {
  extend({ Brush: CSG.Brush })
  const refBrush = useRef<Brush>(null!)
  const parent = useContext(context)

  useLayoutEffect(() => {
    // If this brush does not have geometry directly traverse it
    if (!refBrush.current.geometry || !refBrush.current.geometry.attributes?.position) {
      let brush: THREE.Mesh = null!
      refBrush.current.traverse(
        (obj) => obj !== refBrush.current && obj instanceof CSG.Brush && (brush = obj as THREE.Mesh)
      )
      if (brush) refBrush.current.geometry = brush.geometry
    }

    // Subscribe to the operation above
    if (parent && (a || b)) {
      parent.slots[a ? 0 : 1] = refBrush.current
    }
  }, [])

  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current && parent) parent.update(true)
  })
  useEffect(() => {
    mounted.current = true
  }, [])

  useFrame(() => {
    if (parent && refBrush.current.needsUpdate) {
      refBrush.current.needsUpdate = false
      parent.update(true)
    }
  })

  return (
    <brush ref={mergeRefs([fref, refBrush])} geometry={undefined} {...props}>
      {children}
    </brush>
  )
})

const Operation = forwardRef(({ a, b, children, op, ...props }: OperationProps, fref: React.ForwardedRef<Brush>) => {
  const parent = useContext(context)
  const refBrush = useRef<Brush>(null!)
  const refGeom = useRef<THREE.BufferGeometry>(null!)
  const [target] = useState<Brush>(() => new CSG.Brush())
  const [csgEvaluator] = useState(() => new CSG.Evaluator())
  const [slots] = useState<[Brush | null, Brush | null]>([null, null])

  const api = useMemo(
    () => ({
      parent,
      slots,
      update: (force?: boolean) => {
        const nodeA = slots[0]
        const nodeB = slots[1]
        if (nodeA && nodeB && refBrush.current) {
          refBrush.current.matrixWorld.identity()
          nodeA.updateMatrixWorld()
          nodeB.updateMatrixWorld()
          csgEvaluator.useGroups = false

          function dispose(geometry: THREE.BufferGeometry) {
            geometry.attributes = {}
            geometry.groups = []
            geometry.boundingBox = null
            geometry.boundingSphere = null
            geometry.drawRange = { start: 0, count: Infinity }
            geometry.dispose()
          }

          try {
            if (target.geometry) {
              // Dispose previous geometry
              dispose(target.geometry)
              if (!parent) dispose(refGeom.current)
              target.geometry = new THREE.BufferGeometry()
            }

            const geometry = csgEvaluator.evaluate(nodeA, nodeB, op, target).geometry
            if (parent) refBrush.current.geometry = geometry
            else {
              refGeom.current.attributes = geometry.attributes
              refGeom.current.groups = geometry.groups
              refGeom.current.drawRange = geometry.drawRange
            }
          } catch (e) {
            console.log(e)
          }
          if (force) {
            let cur = parent
            while (cur) {
              cur.update()
              cur = cur.parent
            }
          }
        }
      },
    }),
    [parent]
  )

  useLayoutEffect(() => {
    // If an operation above this one exists, make this one act as a brush and subscribe to the op
    if (parent && (a || b)) {
      parent.slots[a ? 0 : 1] = refBrush.current
    }
    api.update(true)
  }, [])

  useFrame(() => {
    if (refBrush.current.needsUpdate) {
      refBrush.current.needsUpdate = false
      api.update(true)
    }
  })

  return (
    <context.Provider value={api}>
      <bufferGeometry ref={refGeom}>
        <brush ref={mergeRefs([fref, refBrush])} {...props}>
          {children}
        </brush>
      </bufferGeometry>
    </context.Provider>
  )
})

export const Subtraction = forwardRef((props: THREE.Mesh, fref: React.ForwardedRef<Brush>) => (
  <Operation ref={fref} {...props} op={CSG.SUBTRACTION} />
))
export const Addition = forwardRef((props: THREE.Mesh, fref: React.ForwardedRef<Brush>) => (
  <Operation ref={fref} {...props} op={CSG.ADDITION} />
))
export const Difference = forwardRef((props: THREE.Mesh, fref: React.ForwardedRef<Brush>) => (
  <Operation ref={fref} {...props} op={CSG.DIFFERENCE} />
))
export const Intersection = forwardRef((props: THREE.Mesh, fref: React.ForwardedRef<Brush>) => (
  <Operation ref={fref} {...props} op={CSG.INTERSECTION} />
))
