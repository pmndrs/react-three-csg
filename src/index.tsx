import * as THREE from 'three'
import React, { createContext, forwardRef, useMemo, useContext, useEffect, useRef, useState } from 'react'
import { ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'
/** @ts-ignore */
import * as CSG from './packages/three-bvh-csg'
/** @ts-ignore */
export * from './packages/three-bvh-csg'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      brush: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
    }
  }
}

type BrushType = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
}

type OperationType = JSX.IntrinsicElements['mesh'] & {
  a?: boolean
  b?: boolean
  type: any
}

type ApiType = {
  getRef: () => React.MutableRefObject<THREE.Mesh & { a: any; b: any }>
}

const context = createContext<ApiType>(null!)

export const Brush = forwardRef(({ a, b, children, ...props }: BrushType, fref) => {
  extend({ Brush: CSG.Brush })
  const ref = useRef<THREE.Mesh & { a: any; b: any }>(null!)
  const parent = useContext(context)
  useEffect(() => {
    // If this brush does not have geometry directly traverse it
    if (!ref.current.geometry || !ref.current.geometry.attributes?.position) {
      let brush: THREE.Mesh | null = null
      ref.current.traverse(
        (obj: THREE.Object3D) => obj !== ref.current && obj instanceof CSG.Brush && (brush = obj as THREE.Mesh)
      )
      if (brush) ref.current.geometry = (brush as THREE.Mesh).geometry
    }

    // Subscribe to the operation above
    if (parent && (a || b)) {
      const parentRef = parent.getRef()
      // @ts-ignore
      if (parentRef) parentRef[a ? 'a' : 'b'] = ref.current
    }
  })
  return (
    <brush visible={!(a || b)} ref={mergeRefs([fref, ref])} geometry={undefined} {...props}>
      {children}
    </brush>
  )
})

const Operation = forwardRef(({ a, b, children, type, ...props }: OperationType, fref) => {
  const parent = useContext(context)
  const ref = useRef<THREE.Mesh & { a: any; b: any }>(null!)
  const [target] = useState(() => new CSG.Brush())
  const [csgEvaluator] = useState(() => new CSG.Evaluator())

  const update = () => {
    const nodeA = ref.current.a
    const nodeB = ref.current.b
    if (nodeA && nodeB) {
      csgEvaluator.useGroups = false
      try {
        if (target.geometry) {
          // Dispose previous geometry
          target.geometry.dispose()
          target.geometry = new THREE.BufferGeometry()
        }
        ref.current.geometry = csgEvaluator.evaluate(nodeA, nodeB, type, target).geometry
      } catch (e) {
        console.log(e)
      }
    }
  }

  const m1 = new THREE.Matrix4()
  const m2 = new THREE.Matrix4()
  useFrame(() => {
    const nodeA = ref.current.a
    const nodeB = ref.current.b
    // If A or B changed in position, rotation or size, update CSG
    if (nodeA && nodeB && (!m1.equals(nodeA.matrixWorld) || !m2.equals(nodeB.matrixWorld))) {
      m1.copy(nodeA.matrixWorld)
      m2.copy(nodeB.matrixWorld)
      update()
    }
  })

  useEffect(() => {
    // Fetch operation B and B
    const nodeA = ref.current.a
    const nodeB = ref.current.b
    if (nodeA && nodeB) {
      // Update their matrix world
      nodeA.updateMatrixWorld()
      nodeB.updateMatrixWorld()

      // If an operation above this one exists, make this one act as a brush and subscribe to the op
      if (parent && (a || b)) {
        const parentRef = parent.getRef()
        // @ts-ignore
        if (parentRef) parentRef[a ? 'a' : 'b'] = ref.current
      }

      update()
    }
  })

  // Context api
  const api = useMemo(() => ({ getRef: () => ref.current }), [])

  return (
    <context.Provider value={api as any}>
      <brush visible={parent && !(a || b)} ref={mergeRefs([fref, ref])} {...props}>
        {children}
      </brush>
    </context.Provider>
  )
})

export const Subtraction = forwardRef((props, fref) => <Operation ref={fref} {...props} type={CSG.SUBTRACTION} />)
export const Addition = forwardRef((props, fref) => <Operation ref={fref} {...props} type={CSG.ADDITION} />)
export const Difference = forwardRef((props, fref) => <Operation ref={fref} {...props} type={CSG.DIFFERENCE} />)
export const Intersection = forwardRef((props, fref) => <Operation ref={fref} {...props} type={CSG.INTERSECTION} />)
