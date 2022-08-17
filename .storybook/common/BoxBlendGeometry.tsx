import * as THREE from 'three'
import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { ExtrudeGeometry } from 'three'

export function BoxBlendGeometry({ width = 1, height = 1, radius = 0.2, depth = 1 }) {
  const geometry = useRef<ExtrudeGeometry>(null!)
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-width / 2, -height / 2 + radius)
    s.lineTo(-width / 2, height / 2 - radius)
    s.absarc(-width / 2 + radius, height / 2 - radius, radius, 1 * Math.PI, 0.5 * Math.PI, true)
    s.lineTo(width / 2 - radius, height / 2)
    s.absarc(width / 2 - radius, height / 2 - radius, radius, 0.5 * Math.PI, 0 * Math.PI, true)
    s.lineTo(width / 2, -height / 2 + radius)
    s.absarc(width / 2 - radius, -height / 2 + radius, radius, 2 * Math.PI, 1.5 * Math.PI, true)
    s.lineTo(-width / 2 + radius, -height / 2)
    s.absarc(-width / 2 + radius, -height / 2 + radius, radius, 1.5 * Math.PI, 1 * Math.PI, true)
    return new THREE.Shape(s.getPoints(10))
  }, [width, height, radius, depth])

  const config = useMemo(() => ({ depth, bevelEnabled: false }), [depth])

  useLayoutEffect(() => {
    geometry.current.translate(0, 0, -depth / 2)
    geometry.current.computeVertexNormals()
  }, [shape])
  
  return <extrudeGeometry ref={geometry} args={[shape, config]} />
}
