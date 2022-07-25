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
  const ref = useRef<Brush>(null!)
  const parent = useContext(context)

  useLayoutEffect(() => {
    // If this brush does not have geometry directly traverse it
    if (!ref.current.geometry || !ref.current.geometry.attributes?.position) {
      let brush: THREE.Mesh = null!
      ref.current.traverse((obj) => obj !== ref.current && obj instanceof CSG.Brush && (brush = obj as THREE.Mesh))
      if (brush) ref.current.geometry = brush.geometry
    }

    // Subscribe to the operation above
    if (parent && (a || b)) {
      parent.slots[a ? 0 : 1] = ref.current
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
    if (parent && ref.current.needsUpdate) {
      ref.current.needsUpdate = false
      parent.update(true)
    }
  })

  return (
    <brush
      traverse={(cb) => cb(ref.current)}
      visible={!(a || b)}
      ref={mergeRefs([fref, ref])}
      geometry={undefined}
      {...props}
    >
      {children}
    </brush>
  )
})

const Operation = forwardRef(({ a, b, children, op, ...props }: OperationProps, fref: React.ForwardedRef<Brush>) => {
  const parent = useContext(context)
  const ref = useRef<Brush>(null!)
  const [target] = useState(() => new CSG.Brush())
  const [csgEvaluator] = useState(() => new CSG.Evaluator())
  const [slots] = useState<[Brush | null, Brush | null]>([null, null])

  const api = useMemo(
    () => ({
      parent,
      slots,
      update: (force?: boolean) => {
        const nodeA = slots[0]
        const nodeB = slots[1]
        if (nodeA && nodeB && ref.current) {          
          ref.current.matrixWorld.identity()
          nodeA.updateMatrixWorld()
          nodeB.updateMatrixWorld()
          csgEvaluator.useGroups = false
          try {
            if (target.geometry) {
              // Dispose previous geometry
              target.geometry.dispose()
              target.geometry = new THREE.BufferGeometry()
            }
            ref.current.geometry = csgEvaluator.evaluate(nodeA, nodeB, op, target).geometry
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
      parent.slots[a ? 0 : 1] = ref.current
    }
    api.update(true)
  }, [])

  useFrame(() => {
    if (ref.current.needsUpdate) {
      ref.current.needsUpdate = false
      api.update(true)
    }
  })

  return (
    <context.Provider value={api}>
      <brush traverse={(cb) => cb(ref.current)} visible={parent && !(a || b)} ref={mergeRefs([fref, ref])} {...props}>
        {children}
      </brush>
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
