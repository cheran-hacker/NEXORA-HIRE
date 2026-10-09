console.time('load'); await import('./server.js').catch(e=>{}); console.timeEnd('load'); process.exit(0);
