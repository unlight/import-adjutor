#!/usr/bin/env node

const getStdin = require('get-stdin');

(async () => {
    console.log('log', await getStdin());
})();
