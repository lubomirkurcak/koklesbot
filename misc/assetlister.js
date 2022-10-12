const fs = require('node:fs');
const path = require('node:path');

const assetpath = path.join(__dirname, '../assets');
const files = fs.readdirSync(assetpath);

for (const file of files) {
    const filepath = path.join(assetpath, file);
    const name = path.parse(filepath).name;
    const base = path.parse(filepath).base;
    const ext = path.parse(filepath).ext;

    console.log(`{ name: '${name}', value: '${base}' },`);
}
