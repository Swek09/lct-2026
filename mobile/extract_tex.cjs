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
const base = 'D:/lct-2026/mobile/assets/models/';
for (const f of ['Cat_Small.glb','cat.glb','Bow.glb','Glasses.glb','BirthdayHat.glb']) {
  const { json, bin } = parseGLB(base + f);
  console.log('===== ' + f + ' =====');
  const bvs = json.bufferViews || [];
  (json.images||[]).forEach((img, i) => {
    const bv = bvs[img.bufferView];
    const start = (bv.byteOffset||0);
    const data = bin.slice(start, start + bv.byteLength);
    const out = base + '_tex_' + f.replace('.glb','') + '_' + i + '.png';
    fs.writeFileSync(out, data);
    console.log('image', i, img.mimeType, 'bytes', bv.byteLength, '->', out);
  });
}
