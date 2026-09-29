const fs = require('fs');
function parseGLB(path){
  const buf = fs.readFileSync(path);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) throw new Error('not glb: '+path);
  const length = buf.readUInt32LE(8);
  let off = 12;
  let json = null;
  while (off < length) {
    const chunkLen = buf.readUInt32LE(off);
    const chunkType = buf.readUInt32LE(off+4);
    const data = buf.slice(off+8, off+8+chunkLen);
    if (chunkType === 0x4E4F534A) { json = JSON.parse(data.toString('utf8')); }
    off += 8 + chunkLen;
  }
  return json;
}
const base = 'D:/lct-2026/mobile/assets/models/';
for (const f of ['Cat_Small.glb','cat.glb']) {
  const j = parseGLB(base + f);
  console.log('===== ' + f + ' =====');
  console.log('materials:', JSON.stringify(j.materials, null, 2));
  // which mesh uses which material
  console.log('mesh->material:');
  (j.meshes||[]).forEach(m=>{
    const prims=(m.primitives||[]).map(p=>p.material);
    console.log('  ', m.name, '-> mat idx', JSON.stringify(prims));
  });
  console.log('images:', (j.images||[]).map(i=>i.name || i.uri || 'embedded'));
  console.log('textures:', (j.textures||[]).length);
}
