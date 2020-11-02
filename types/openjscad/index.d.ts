type Geom3 = {
  // we generally don't manipulate the shape directly, but it is here as a reference type
  polygons: []
}

type Geom2 = {

}

declare module '@jscad/csg/src/api'{
  const csg: {
    CAG: {
      Vertex: any,
      Side: any,
      circle: any,
      ellipse: any,
      rectangle: any,
      roundedRectangle: any,
      fromSides: any,
      fromObject: any,
      fromPoints: any,
      fromPointsNoCheck: any,
      fromPath2: any,
      fromFakeCSG: any,
      fromCompactBinary: any
    },
    CSG: {
      _CSGDEBUG: false,
      defaultResolution2D: number,
      defaultResolution3D: number,
      EPS: number,
      angleEPS: number,
      areaEPS: number,
      all: number,
      top: number,
      bottom: number,
      left: number,
      right: number,
      front: number,
      back: number,
      staticTag: number,
      getTag: any,
      Vector2D: any,
      Vector3D: any,
      Vertex: any,
      Plane: any,
      Polygon: any,
      Polygon2D: any,
      Line2D: any,
      Line3D: any,
      Path2D: any,
      OrthoNormalBasis: any,
      Matrix4x4: any,
      Connector: any,
      ConnectorList: any,
      Properties: any,
      sphere: any,
      cube: any,
      roundedCube: any,
      cylinder: any,
      roundedCylinder: any,
      cylinderElliptic: any,
      polyhedron: any,
      fromCompactBinary: any,
      fromObject: any,
      fromSlices: any,
      fromPolygons: any,
      toPointCloud: any,
      parseOptionAs2DVector: any,
      parseOptionAs3DVector: any,
      parseOptionAs3DVectorList: any,
      parseOptionAsBool: any,
      parseOptionAsFloat: any,
      parseOptionAsInt: any
    }
  };
  const primitives2d: {
    circle: any,
    square: any,
    polygon: any,
    triangle: any
  };

  const primitives3d: {
    cube: any,
    sphere: any,
    cylinder: any,
    geodesicSphere: any,
    torus: any,
    polyhedron: any
  };

  const booleanOps: {
    union: any,
    difference: any,
    intersection: any
  };
  
  const transformations: {
    translate: any,
    center: any,
    scale: any,
    rotate: any,
    transform: any,
    mirror: any,
    expand: any,
    contract: any,
    minkowski: any,
    hull: any,
    chain_hull: any
  };
  const extrusions: {
    extrudeInOrthonormalBasis: any,
    extrudeInPlane: any,
    extrude: any,
    linear_extrude: any,
    rotate_extrude: any,
    rotateExtrude: any,
    rectangular_extrude: any
  };

  const color: {
    css2rgb: any,
    color: any,
    rgb2hsl: any,
    hsl2rgb: any,
    rgb2hsv: any,
    hsv2rgb: any,
    html2rgb: any,
  }

  const maths: {
    sin: any,
    cos: any,
    asin: any,
    acos: any,
    tan: any,
    atan2: any,
    ceil: any,
    floor: any,
    abs: any,
    min: any,
    max: any,
    rands: any,
    log: any,
    lookup: any,
    pow: any,
    sign: any,
    sqrt: any,
    round: any
  };
  const text: {
    vector_char: any,
    vector_text: any,
    vectorChar: any,
    vectorText: any
  };
  const OpenJsCad: { OpenJsCad: { log: any } };
  const debug: { echo: any }
  
}
  

declare module '@jscad/core' {
  type OutputTypes = 'stlb';
  const generateOutput: (a: OutputTypes, b) => Output;
  class Output {
    asBuffer: () => NodeJS.ArrayBufferView;
  }
}