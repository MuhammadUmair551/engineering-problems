function calcMean(times) {
  const sum = times.reduce((acc, t) => acc + t, 0);
  return sum / times.length;
}

function calcMedian(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function calcStdDev(times, mean) {
  const squaredDiffs = times.map((t) => (t - mean) ** 2);
  const avgSquaredDiff = calcMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}


/**
 * @param {Function} fn       - Jo function measure karna hai
 * @param {Object}   options  - Configuration
 * @param {number}   options.warmup      - Kitne warmup runs (default: 10)
 * @param {number}   options.iterations  - Kitne actual measurement runs (default: 100)
 @param {string}   options.label       - Is benchmark ka naam
 */
function benchmark(fn, options = {}) {
  const warmupCount = options.warmup ?? 10;
  const iterCount = options.iterations ?? 100;
  const label = options.label ?? fn.name ?? "anonymous";

  console.log(`\n>>> Benchmarking: "${label}"`);
  console.log(`    Warmup: ${warmupCount} runs | Iterations: ${iterCount} runs`);

  console.log("    [1/2] Warmup chal raha hai...");
  for (let i = 0; i < warmupCount; i++) {
    fn();
  }

  console.log("    [2/2] Measurement chal raha hai...");
  const times = [];

  for (let i = 0; i < iterCount; i++) {
    const start = performance.now(); 
    fn();
    const end = performance.now();   
    times.push(end - start);        
  }

  const mean   = calcMean(times);
  const median = calcMedian(times);
  const stdDev = calcStdDev(times, mean);
  const min    = Math.min(...times);
  const max    = Math.max(...times);

  const opsPerSec = Math.round(1000 / mean);

  const results = { label, iterations: iterCount, mean, median, stdDev, min, max, opsPerSec };
  printResults(results);
  return results;
}

function printResults(r) {
  const f = (n) => n.toFixed(4);
  console.log(`\n  ┌─ Results: "${r.label}" (${r.iterations} iterations)`);
  console.log(`  │  Mean    : ${f(r.mean)} ms`);
  console.log(`  │  Median  : ${f(r.median)} ms   ← outliers se safe`);
  console.log(`  │  Std Dev : ${f(r.stdDev)} ms   ← consistency (low = acha)`);
  console.log(`  │  Min     : ${f(r.min)} ms`);
  console.log(`  │  Max     : ${f(r.max)} ms`);
  console.log(`  └─ Ops/sec : ${r.opsPerSec.toLocaleString()}`);
}

function compareBenchmarks(benchmarkList, sharedOptions = {}) {
  console.log("BENCHMARK COMPARISON");

  const results = benchmarkList.map(({ fn, label }) =>
    benchmark(fn, { ...sharedOptions, label })
  );

  const fastest = results.reduce((a, b) => (a.median < b.median ? a : b));

  console.log("\n Final Comparison (median time) ");
  results
    .sort((a, b) => a.median - b.median)
    .forEach((r, i) => {
      const marker = r.label === fastest.label ? " FASTEST" : "";
      const ratio = (r.median / fastest.median).toFixed(2);
      const slowLabel = i === 0 ? "" : ` (${ratio}x slower)`;
      console.log(`  ${i + 1}. ${r.label}: ${r.median.toFixed(4)}ms${marker}${slowLabel}`);
    });
}


function buildArrayNaive() {
  const arr = [];
  for (let i = 0; i < 1000; i++) {
    arr.push(i * 2);
  }
  return arr;
}

function buildArrayPreallocated() {
  const arr = new Array(1000);
  for (let i = 0; i < 1000; i++) {
    arr[i] = i * 2;
  }
  return arr;
}

function buildArrayMap() {
  return Array.from({ length: 1000 }, (_, i) => i * 2);
}

compareBenchmarks(
  [
    { fn: buildArrayNaive,        label: "push() loop" },
    { fn: buildArrayPreallocated, label: "new Array(n) + index" },
    { fn: buildArrayMap,          label: "Array.from()" },
  ],
  { warmup: 20, iterations: 200 }
);

benchmark(
  () => {
    let s = "";
    for (let i = 0; i < 500; i++) s += i;
  },
  { label: "String concatenation (500 chars)", warmup: 5, iterations: 50 }
);

console.log("\n[Done] Benchmark complete!\n");