const { readyPromise } = require('./server');
const runTests = require('./test-auth');

async function main() {
  try {
    await readyPromise;
    // Small buffer to ensure server port is bound
    await new Promise((r) => setTimeout(r, 500));
    await runTests();
    process.exit(0);
  } catch (err) {
    console.error('Test suite failed:', err);
    process.exit(1);
  }
}

main();
