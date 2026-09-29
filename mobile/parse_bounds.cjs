const fs = require('fs');
function parseGLB(path){
  const buf = fs.readFileSync(path);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) throw new Error('not glb: '+path);
  const length = buf.readUInt32LE(8);
  let off = 12;
  let json = null;
  let bin = null;
  while (off < length) {
    const chunkLen = buf.readUInt32LE(off);
    const chunkType = buf.readUInt32LE(off+4);
    const data = buf.slice(off+8, off+8+chunkLen);
    if (chunkType === 0x4E4F534A) { json = JSON.parse(data.toString('utf8')); }
    else if (chunkType === 0x004E4942) { bin = data; }
    off += 8 + chunkLen;
  }
  return { json, bin };
}
function readAccessorMinMax(json, accessorIdx){
  const acc = json.accessors[accessorIdx];
  return { type: acc.type, componentType: acc.componentType, min: acc.min, max: acc.max, count: acc.count };
}
const base = 'D:/lct-2026/mobile/assets/models/';
function meshBounds(json, meshIdx){
  const mesh = json.meshes[meshIdx];
  let min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  (mesh.primitives||[]).forEach(p=>{
    if(p.attributes.POSITION!==undefined){
      const acc = json.accessors[p.attributes.POSITION];
      if(acc.min && acc.max){
        for(let i=0;i<3;i++){ min[i]=Math.min(min[i],acc.min[i]); max[i]=Math.max(max[i],acc.max[i]); }
      }
    }
  });
  return {min,max};
}
for (const f of ['Bow.glb','Glasses.glb','BirthdayHat.glb']) {
  const { json } = parseGLB(base + f);
  console.log('===== ' + f + ' =====');
  json.nodes.forEach((n,i)=>{
    const b = meshBounds(json, n.mesh);
    console.log(' node', i, n.name, 'mesh', n.mesh, 'bounds min', b.min.map(v=>v.toFixed(3)), 'max', b.max.map(v=>v.toFixed(3)));
  });
}
// cat body overall bounds (mesh 0 is BézierCurve, but use all meshes combined)
for (const f of ['cat.glb','Cat_Small.glb']) {
  const { json } = parseGLB(base + f);
  console.log('===== ' + f + ' overall =====');
  let min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  json.meshes.forEach((m,mi)=>{
    const b = meshBounds(json, mi);
    for(let i=0;i<3;i++){ min[i]=Math.min(min[i],b.min[i]); max[i]=Math.max(max[i],b.max[i]); }
    // also print per-mesh bounds
    console.log('  mesh', mi, m.name, 'min', b.min.map(v=>v.toFixed(3)), 'max', b.max.map(v=>v.toFixed(3)));
  });
  console.log('  TOTAL min', min.map(v=>v.toFixed(3)), 'max', max.map(v=>v.toFixed(3)));
}
