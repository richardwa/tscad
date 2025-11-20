export function processPolygons(polygons: Vec3[][]) {
  const vertexCache: Map<string, number> = new Map();
  const vertices: Vec3[] = [];
  const faces: number[][] = [];
  let error = 0;
  for (const t of polygons) {
    try {
      const translated = t.map((vert) => {
        const hash = vert.map((v) => v.toFixed(5)).join(" ");
        if (vertexCache.has(hash)) {
          return vertexCache.get(hash);
        } else {
          const index = vertices.length;
          vertices.push(vert);
          vertexCache.set(hash, index);
          return index;
        }
      }) as Vec3;
      faces.push(translated);
    } catch (e) {
      error++;
    }
  }

  if (error > 0) {
    console.warn(error, "polygon(s) contains undefined verticies, skipped");
  }
  console.log("faces", faces.length);
  console.log("vertices", vertices.length);

  return { vertices, faces };
}
