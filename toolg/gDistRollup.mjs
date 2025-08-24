import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'
import getFiles from 'w-package-tools/src/getFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


rollupFiles({
    fns: 'WDwdataTweqod.mjs',
    fdSrc,
    fdTar,
    // nameDistType: 'kebabCase',
    hookNameDist: () => {
        return 'w-dwdata-tweqod'
    },
    globals: {
        'path': 'path',
        'fs': 'fs',
        'url': 'url',
        'pino': 'pino',
        'events': 'events',
        'chokidar': 'chokidar',
        'xxhash-wasm': 'xxhash-wasm',
    },
    external: [
        'path',
        'fs',
        'url',
        'pino',
        'events',
        'chokidar',
        'xxhash-wasm',
    ],
})

