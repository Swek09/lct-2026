const fs = require('fs');
function parseGLB(path){
  const buf = fs.readFileSync(path);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) throw new Error('not glb: '+path);
  const version = buf.readUInt32LE(4);
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
for (const f of ['Cat_Small.glb','cat.glb','Bow.glb','Glasses.glb','BirthdayHat.glb']) {
  const j = parseGLB(base + f);
  console.log('===== ' + f + ' =====');
  console.log('meshes:', (j.meshes||[]).map(m=>m.name));
  console.log('materials:', (j.materials||[]).map(m=>m.name));
  console.log('animations:', (j.animations||[]).map(a=>a.name));
  const nodes=(j.nodes||[]);
  console.log('nodes count:', nodes.length);
  console.log('node names:', JSON.stringify(nodes.map(n=>n.name)));
  console.log('skins:', (j.skins||[]).length);
  console.log('scenes:', (j.scenes||[]).map(s=>s.name));
}
