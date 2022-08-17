import * as THREE from 'three'
import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { ExtrudeGeometry } from 'three'

export function HeartGeometry({ radius = 1, depth = 1 }) {
  const geometry = useRef<ExtrudeGeometry>(null!)
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const x = -2.5
    const y = -5
    s.moveTo(x + 2.5, y + 2.5)
    s.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y)
    s.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5)
    s.bezierCurveTo(x - 3, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5)
    s.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5)
    s.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y)
    s.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5)
    return new THREE.Shape(s.getPoints(10))
  }, [radius, depth])

  const config = useMemo(() => ({ depth: depth * 10, bevelEnabled: false }), [depth])

  useLayoutEffect(() => {
    geometry.current.translate(0, 0, (-depth * 10) / 2)
    geometry.current.scale(radius / 10, radius / 10, radius / 10)
    geometry.current.rotateY(Math.PI / 2)
    geometry.current.rotateZ(Math.PI)
    geometry.current.computeVertexNormals()
  }, [shape])

  return <extrudeGeometry ref={geometry} args={[shape, config]} />
}
