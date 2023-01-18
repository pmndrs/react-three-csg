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
  useImperativeHandle,
} from 'react'
import { ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import * as CSG from 'three-bvh-csg'

export type BrushProps = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
}

type SharedOperationProps = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
  useGroups?: boolean
}

type OperationProps = SharedOperationProps & {
  op: number
}

type Api = {
  parent: Api
  slots: [CSG.Brush | null, CSG.Brush | null]
  update: (force?: boolean) => void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      brush: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof CSG.Brush>
    }
  }
}

const context = createContext<Api>(null!)

export const Brush = forwardRef(({ a, b, children, ...props }: BrushProps, fref: React.ForwardedRef<CSG.Brush>) => {
  extend({ Brush: CSG.Brush })

  const refBrush = useRef<CSG.Brush>(null!)
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
    if (parent && (refBrush.current as any).needsUpdate) {
      ;(refBrush.current as any).needsUpdate = false
      parent.update(true)
    }
  })

  useImperativeHandle(fref, () => refBrush.current, [])

  return (
    <brush ref={refBrush} geometry={undefined} {...props}>
      {children}
    </brush>
  )
})

const Operation = forwardRef(
  ({ a, b, children, op, useGroups = false, ...props }: OperationProps, fref: React.ForwardedRef<CSG.Brush>) => {
    extend({ Brush: CSG.Brush })

    const parent = useContext(context)
    const refBrush = useRef<CSG.Brush>(null!)
    const refGeom = useRef<THREE.BufferGeometry>(null!)
    const [target] = useState<CSG.Brush>(() => new CSG.Brush())
    const [csgEvaluator] = useState(() => new CSG.Evaluator())
    const [slots] = useState<[CSG.Brush | null, CSG.Brush | null]>([null, null])

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
            csgEvaluator.useGroups = useGroups

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

              const result = csgEvaluator.evaluate(nodeA, nodeB, op, target)
              const geometry = result.geometry

              if (parent) {
                refBrush.current.geometry = geometry
                if (csgEvaluator.useGroups) refBrush.current.material = result.material
              } else {
                // Overwrite the higher up meshs material to use material groups
                if (csgEvaluator.useGroups && (refGeom.current as any)?.__r3f?.parent)
                  (refGeom.current as any).__r3f.parent.material = result.material
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
      [parent, useGroups]
    )

    useLayoutEffect(() => {
      // If an operation above this one exists, make this one act as a brush and subscribe to the op
      if (parent && (a || b)) {
        parent.slots[a ? 0 : 1] = refBrush.current
      }
      api.update(true)
    }, [api])

    useFrame(() => {
      if ((refBrush.current as any).needsUpdate) {
        ;(refBrush.current as any).needsUpdate = false
        api.update(true)
      }
    })

    useImperativeHandle(fref, () => refBrush.current, [])

    return (
      <context.Provider value={api}>
        <bufferGeometry ref={refGeom}>
          <brush ref={refBrush} {...props}>
            {children}
          </brush>
        </bufferGeometry>
      </context.Provider>
    )
  }
)

export type SubtractionProps = SharedOperationProps
export const Subtraction = forwardRef((props: SubtractionProps, fref: React.ForwardedRef<CSG.Brush>) => (
  <Operation {...props} ref={fref} op={CSG.SUBTRACTION} />
))

export type AdditionProps = SharedOperationProps
export const Addition = forwardRef((props: AdditionProps, fref: React.ForwardedRef<CSG.Brush>) => (
  <Operation {...props} ref={fref} op={CSG.ADDITION} />
))

export type DifferenceProps = SharedOperationProps
export const Difference = forwardRef((props: DifferenceProps, fref: React.ForwardedRef<CSG.Brush>) => (
  <Operation {...props} ref={fref} op={CSG.DIFFERENCE} />
))

export type IntersectionProps = SharedOperationProps
export const Intersection = forwardRef((props: IntersectionProps, fref: React.ForwardedRef<CSG.Brush>) => (
  <Operation {...props} ref={fref} op={CSG.INTERSECTION} />
))
