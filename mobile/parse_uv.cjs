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
function accData(json, bin, accessorIdx){
  const acc = json.accessors[accessorIdx];
  const bv = json.bufferViews[acc.bufferView];
  const start = (bv.byteOffset||0) + (acc.byteOffset||0);
  const compSize = {5126:4, 5123:2, 5125:4}[acc.componentType];
  const numComp = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[acc.type];
  const out = [];
  const dv = new DataView(bin.buffer, bin.byteOffset + start);
  for(let i=0;i<acc.count;i++){
    const row=[];
    for(let c=0;c<numComp;c++){
      if(acc.componentType===5126) row.push(dv.getFloat32((i*numComp+c)*4, true));
      else if(acc.componentType===5123) row.push(dv.getUint16((i*numComp+c)*2, true));
      else row.push(dv.getUint32((i*numComp+c)*4, true));
    }
    out.push(row);
  }
  return out;
}
const base = 'D:/lct-2026/mobile/assets/models/';
const { json, bin } = parseGLB(base + 'cat.glb');
// For the main body mesh 'Cube.006' (mesh index 1), print the UV range of its primitives
const meshes = json.meshes;
meshes.forEach((m,mi)=>{
  (m.primitives||[]).forEach(p=>{
    const ua = p.attributes.TEXCOORD_0;
    if(ua===undefined) return;
    const uvs = accData(json,bin,ua);
    let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;
    uvs.forEach(([u,v])=>{ minU=Math.min(minU,u);maxU=Math.max(maxU,u);minV=Math.min(minV,v);maxV=Math.max(maxV,v); });
    console.log('mesh',mi,m.name,'mat',p.material,'UVcount',uvs.length,'U',minU.toFixed(3),'-',maxU.toFixed(3),'V',minV.toFixed(3),'-',maxV.toFixed(3));
  });
});
