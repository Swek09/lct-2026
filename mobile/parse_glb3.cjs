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
function walk(nodes, idx, depth, parent){
  const n = nodes[idx];
  if(!n) return;
  const info = {
    name: n.name,
    children: n.children||[],
    translation: n.translation,
    rotation: n.rotation,
    scale: n.scale,
    mesh: n.mesh,
    skin: n.skin,
  };
  console.log('  '.repeat(depth) + JSON.stringify(info));
  (n.children||[]).forEach(c=>walk(nodes,c,depth+1,idx));
}
const base = 'D:/lct-2026/mobile/assets/models/';
for (const f of ['Cat_Small.glb','cat.glb']) {
  const { json } = parseGLB(base + f);
  console.log('===== ' + f + ' hierarchy =====');
  const nodes = json.nodes||[];
  const scene = json.scenes && json.scenes[json.scene||0];
  (scene&&scene.nodes||[]).forEach(r=>walk(nodes,r,0,null));
}
console.log('===== Bow nodes =====');
const bow = parseGLB(base + 'Bow.glb').json;
console.log(JSON.stringify(bow.nodes, null, 2));
console.log('===== Glasses nodes =====');
const gl = parseGLB(base + 'Glasses.glb').json;
console.log(JSON.stringify(gl.nodes, null, 2));
console.log('===== BirthdayHat nodes =====');
const hat = parseGLB(base + 'BirthdayHat.glb').json;
console.log(JSON.stringify(hat.nodes, null, 2));
