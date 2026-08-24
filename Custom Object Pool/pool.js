const { performance } = require("perf_hooks");

class ObjectPool {
    constructor(size) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createObject());
        }
    }

    createObject() {
        return {
            x: 0,
            y: 0,
            active: false
        };
    }

    acquire() {
        if (this.pool.length > 0) {
            const object = this.pool.pop();

            object.active = true;

            return object;
        }

        return this.createObject();
    }

    release(object) {
        object.x = 0;
        object.y = 0;
        object.active = false;

        this.pool.push(object);
    }
}

const ITERATIONS = 100000;

function withoutPooling() {

    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        const object = {
            x: i,
            y: i,
            active: true
        };

        object.x++;
        object.y++;
    }

    const end = performance.now();

    return end - start;
}

function withPooling() {

    const pool = new ObjectPool(1000);

    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {

        const object = pool.acquire();

        object.x = i;
        object.y = i;

        object.x++;
        object.y++;

        pool.release(object);
    }

    const end = performance.now();

    return end - start;
}

console.log("Object Pool Benchmark");
console.log("=====================");

const normalTime = withoutPooling();
const pooledTime = withPooling();

console.log(`\nWithout Pooling: ${normalTime.toFixed(3)} ms`);
console.log(`With Pooling:    ${pooledTime.toFixed(3)} ms`);

console.log("\nDifference:");

if (pooledTime < normalTime) {
    console.log(
        `Pooling was faster by ${(normalTime - pooledTime).toFixed(3)} ms`
    );
} else {
    console.log(
        `Pooling was slower by ${(pooledTime - normalTime).toFixed(3)} ms`
    );
}