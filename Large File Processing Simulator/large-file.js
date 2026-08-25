const { performance } = require("perf_hooks");

const TOTAL_RECORDS = 1_000_000;

function* generateDataset(total) {

    for (let i = 1; i <= total; i++) {
        yield {
            id: i,
            name: `User ${i}`,
            amount: i * 10
        };
    }
}

function processRecord(record) {
    return record.amount * 2;
}


function processWithGenerator() {

    console.log("\n--- Generator Approach ---");

    const startMemory = process.memoryUsage().heapUsed;

    const startTime = performance.now();

    let total = 0;

    const dataset = generateDataset(TOTAL_RECORDS);

    for (const record of dataset) {

        total += processRecord(record);
    }

    const endTime = performance.now();

    const endMemory = process.memoryUsage().heapUsed;

    const memoryUsed =
        (endMemory - startMemory) / 1024 / 1024;

    console.log(`Processed: ${TOTAL_RECORDS} records`);
    console.log(`Result: ${total}`);
    console.log(`Time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Memory change: ${memoryUsed.toFixed(2)} MB`);
}

function processNormally() {

    console.log("\n--- Normal Array Approach ---");

    const startMemory = process.memoryUsage().heapUsed;

    const startTime = performance.now();

    const dataset = [];
    for (let i = 1; i <= TOTAL_RECORDS; i++) {

        dataset.push({
            id: i,
            name: `User ${i}`,
            amount: i * 10
        });
    }

    let total = 0;

    for (const record of dataset) {

        total += processRecord(record);
    }

    const endTime = performance.now();

    const endMemory = process.memoryUsage().heapUsed;

    const memoryUsed =
        (endMemory - startMemory) / 1024 / 1024;

    console.log(`Processed: ${TOTAL_RECORDS} records`);
    console.log(`Result: ${total}`);
    console.log(`Time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Memory change: ${memoryUsed.toFixed(2)} MB`);
}
console.log("Large File Processing Simulator");

processWithGenerator();
processNormally();