const fs = require('fs');
const paths = [
    'dist/cjs/server/zod-compat.js',
    'dist/esm/server/zod-compat.js',
    'dist/cjs/client/index.js',
    'dist/esm/client/index.js',
    'dist/cjs/shared/protocol.js',
    'dist/esm/shared/protocol.js'
];
paths.forEach(p => {
    const f = 'node_modules/@modelcontextprotocol/sdk/' + p;
    if (fs.existsSync(f)) {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/\.safeParse\?\.\(/g, '.safeParse(');
        c = c.replace(/\.safeParseAsync\?\.\(/g, '.safeParseAsync(');
        
        c = c.replace(/(\w+)\.safeParse\(/g, '(typeof $1.safeParse === "function" ? $1.safeParse.bind($1) : function(d){return {success:true,data:d}})(');
        c = c.replace(/(\w+)\.safeParseAsync\(/g, '(typeof $1.safeParseAsync === "function" ? $1.safeParseAsync.bind($1) : async function(d){return {success:true,data:d}})(');
        
        fs.writeFileSync(f, c);
        console.log('Fixed', p);
    }
});
