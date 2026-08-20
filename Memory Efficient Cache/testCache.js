const MemoryEfficientCache = require("./MemoryEfficientCache");

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
    console.log("Starting Memory-Efficient Cache Tests \n");

    const cache = new MemoryEfficientCache(100, 1000);

    console.log("Test 1: Basic Get and Set");

    cache.set("user_1", "Ali");

    console.log("Get user_1:", cache.get("user_1"));

    console.log("Stats after insertion:", cache.getStats());

    console.log("");

    console.log("Test 2: TTL Expiration");
    console.log("Waiting 1.2 seconds for 'user_1' to expire...");

    await sleep(1200);

    console.log(
        "Get user_1 (should be null):",
        cache.get("user_1")
    );

    console.log("Stats after expiry:", cache.getStats());

    console.log("");

    console.log("Test 3: Memory Limit & LRU Eviction");

    const longTTL = 50000;

    console.log("Adding items to fill memory...");

    cache.set("itemA", "valueA", longTTL);
    cache.set("itemB", "valueB", longTTL);
    cache.set("itemC", "valueC", longTTL);

    console.log("Current Cache State:", cache.getStats());

    console.log("Accessing 'itemA' to make it Most Recently Used...");

    cache.get("itemA");

    console.log(
        "Adding 'itemD' (22 bytes). Total: 88 bytes."
    );

    cache.set("itemD", "valueD", longTTL);

    console.log(
        "Adding 'itemE' (22 bytes). Total space requires 110 bytes (Limit: 100)."
    );

    console.log(
        "This must evict the Least Recently Used item, which should be 'itemB'!"
    );

    cache.set("itemE", "valueE", longTTL);

    console.log("\nChecking which items are still in cache:");

    console.log(
        "Get itemB (should be null - evicted):",
        cache.get("itemB")
    );

    console.log(
        "Get itemC (should be 'valueC'):",
        cache.get("itemC")
    );

    console.log(
        "Get itemA (should be 'valueA' - because we accessed it, it was saved):",
        cache.get("itemA")
    );

    console.log(
        "Get itemD (should be 'valueD'):",
        cache.get("itemD")
    );

    console.log(
        "Get itemE (should be 'valueE'):",
        cache.get("itemE")
    );

    console.log("\nFinal Stats:", cache.getStats());

    console.log("\n Test completed successfully");
}

runTests().catch((err) => console.error(err));