const { performance } = require("perf_hooks");
const leakedObjects = [];
function createMemoryLeak() {

    for (let i = 0; i < 5000; i++) {

        const object = {
            id: i,
            data: new Array(100).fill("memory leak")
        };
        leakedObjects.push(object);
    }
}
function getMemoryUsage() {

    const memory = process.memoryUsage();
    return memory.heapUsed / 1024 / 1024;
}

function detectMemoryLeak() {

    const measurements = [];

    console.log("Memory Leak Detector");

    const startMemory = getMemoryUsage();

    console.log(
        `\nStarting Memory: ${startMemory.toFixed(2)} MB`
    );

    for (let i = 1; i <= 10; i++) {

        createMemoryLeak();

        const currentMemory = getMemoryUsage();

        measurements.push(currentMemory);

        console.log(
            `Iteration ${i}: ${currentMemory.toFixed(2)} MB`
        );
    }
    const finalMemory =
        measurements[measurements.length - 1];

    const memoryGrowth =
        finalMemory - startMemory;


    console.log(
        `\nMemory Growth: ${memoryGrowth.toFixed(2)} MB`
    );
    const threshold = 10; // MB

    if (memoryGrowth > threshold) {

        console.log(
            "\nWARNING: Possible memory leak detected!"
        );

    } else {

        console.log(
            "\nMemory usage appears normal."
        );
    }
}
detectMemoryLeak();