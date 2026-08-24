class BloomFilter {
  /**
   * @param {number}
   * @param {number} 
   */
  constructor(size = 1000, hashCount = 3) {
    this.size      = size;
    this.hashCount = hashCount;

    this.bitArray = new Uint8Array(size);

    this.itemCount = 0;
  }

  _getIndexes(item) {
    const str    = String(item);
    const hash1  = this._fnv1a(str);
    const hash2  = this._djb2(str);            
    const indexes = [];

    for (let i = 0; i < this.hashCount; i++) {
      const combined = Math.abs((hash1 + i * hash2) % this.size);
      indexes.push(combined);
    }

    return indexes;
  }

  _fnv1a(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; 
    }
    return hash;
  }

  _djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  insert(item) {
    const indexes = this._getIndexes(item);

    for (const idx of indexes) {
      this.bitArray[idx] = 1;
    }

    this.itemCount++;
    return indexes; 
  }

  lookup(item) {
    const indexes = this._getIndexes(item);

    for (const idx of indexes) {
      if (this.bitArray[idx] === 0) {
        // Koi bhi ek bit 0 hai — DEFINITELY nahi hai
        return { result: false, certain: true, indexes };
      }
    }

    return { result: true, certain: false, indexes };
  }

  falsePositiveRate() {
    const k = this.hashCount;
    const n = this.itemCount;
    const m = this.size;

    if (n === 0) return 0;

    const exponent = -k * n / m;
    const rate     = Math.pow(1 - Math.exp(exponent), k);
    return rate;
  }

  memoryUsage() {
    const bitsUsed  = this.bitArray.filter(b => b === 1).length;
    const totalBits = this.size;
    const bytes     = Math.ceil(totalBits / 8);
    const kb        = (bytes / 1024).toFixed(3);

    return { totalBits, bitsUsed, bytes, kb };
  }


  static optimalParams(n, targetFPRate) {
    const ln2 = Math.log(2);
    const m   = Math.ceil(-n * Math.log(targetFPRate) / (ln2 * ln2));
    const k   = Math.round((m / n) * ln2);
    return { optimalSize: m, optimalHashCount: k };
  }

  summary() {
    const mem = this.memoryUsage();
    const fp  = this.falsePositiveRate();

    console.log("\n── Bloom Filter Status ──");
    console.log(`  Bit array size : ${this.size} bits (${mem.kb} KB)`);
    console.log(`  Hash functions : ${this.hashCount}`);
    console.log(`  Items inserted : ${this.itemCount}`);
    console.log(`  Bits set (1s)  : ${mem.bitsUsed} / ${mem.totalBits} (${((mem.bitsUsed/mem.totalBits)*100).toFixed(1)}% filled)`);
    console.log(`  Est. FP rate   : ${(fp * 100).toFixed(4)}%`);
  }
}

console.log("=== BLOOM FILTER DEMO ===\n");

console.log("── Test 1: Basic insert & lookup ──");
const bf = new BloomFilter(200, 3);

const words = ["apple", "banana", "cherry", "date", "elderberry"];
words.forEach(w => {
  const idxs = bf.insert(w);
  console.log(`  insert("${w}") → bits set at: [${idxs.join(", ")}]`);
});

console.log();
const testWords = ["apple", "banana", "mango", "grape", "cherry", "watermelon"];
testWords.forEach(w => {
  const { result, certain } = bf.lookup(w);
  const verdict = result
    ? "PROBABLY exists (could be false positive)"
    : "DEFINITELY not in set";
  console.log(`  lookup("${w}") → ${verdict}`);
});

bf.summary();

console.log("── Test 2: False positive rate — small filter, many items ──");
const smallBF = new BloomFilter(50, 3);
for (let i = 0; i < 30; i++) {
  smallBF.insert(`item_${i}`);
}

let falsePositives = 0;
const testCount = 1000;
for (let i = 1000; i < 1000 + testCount; i++) {
  const { result } = smallBF.lookup(`item_${i}`);
  if (result) falsePositives++;
}

console.log(`  50-bit filter, 30 items inserted`);
console.log(`  Tested ${testCount} non-existent items`);
console.log(`  False positives: ${falsePositives} / ${testCount} (${(falsePositives/testCount*100).toFixed(1)}%)`);
console.log(`  Theoretical FP rate: ${(smallBF.falsePositiveRate() * 100).toFixed(1)}%`);

console.log("\n── Test 3: Memory tradeoff — same items, different sizes ──");
const sizes = [100, 500, 1000, 5000];
const n = 100;

console.log(`  Inserting ${n} items into filters of different sizes:`);
console.log(`  ${"Size (bits)".padEnd(14)} ${"Memory (KB)".padEnd(14)} ${"Est. FP Rate"}`);
console.log(`  ${"─".repeat(46)}`);

sizes.forEach(size => {
  const f = new BloomFilter(size, 3);
  for (let i = 0; i < n; i++) f.insert(`word_${i}`);
  const mem = f.memoryUsage();
  const fp  = (f.falsePositiveRate() * 100).toFixed(4);
  console.log(`  ${String(size).padEnd(14)} ${mem.kb.padEnd(14)} ${fp}%`);
});

console.log("\n── Test 4: Optimal parameters calculator ──");
const examples = [
  { n: 1000,    p: 0.01  }, 
  { n: 1000000, p: 0.001 },  
  { n: 500,     p: 0.05  }, 
];

examples.forEach(({ n, p }) => {
  const { optimalSize, optimalHashCount } = BloomFilter.optimalParams(n, p);
  const memKB = (Math.ceil(optimalSize / 8) / 1024).toFixed(2);
  console.log(`  n=${n}, target FP=${(p*100)}% → size=${optimalSize} bits (${memKB} KB), k=${optimalHashCount} hashes`);
});

console.log("\n[Done]");