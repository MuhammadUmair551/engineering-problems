    const { Worker } = require("worker_threads");
const path = require("path");

const WORKER_FILE = path.join(__dirname, "worker.js");

class WorkerPool {
  constructor(poolSize = 4, maxRetries = 2) {
    this.poolSize  = poolSize;
    this.maxRetries = maxRetries;

    this.workers = [];

    this.queue = [];

    this.pending = new Map();

    this.nextTaskId = 1;

    this._initPool();

    console.log(`[Pool] Started with ${poolSize} workers`);
  }


  _initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      this._spawnWorker(i);
    }
  }

  _spawnWorker(workerId) {
    const worker = new Worker(WORKER_FILE, {
      workerData: { id: workerId },
    });

    worker.on("message", (msg) => this._handleResult(worker, msg));

    worker.on("error", (err) => this._handleCrash(worker, workerId, err));

    worker.on("exit", (code) => {
      if (code !== 0) {
      }
    });

    const entry = { worker, id: workerId, activeTasks: 0 };
    this.workers.push(entry);

    return entry;
  }


  /**
   * Koi bhi kaam submit karo — Promise return hogi
   *
   * @param {string} type   - Task type: "fibonacci", "primes", "sort"
   * @param {object} data   - Task ka input data
   * @returns {Promise}     - Resolves with result, rejects with error
   */
  runTask(type, data) {
    return new Promise((resolve, reject) => {
      const taskId  = this.nextTaskId++;
      const task    = { id: taskId, type, data };
      const retries = this.maxRetries;

      this._dispatch({ task, resolve, reject, retries });
    });
  }

  _dispatch({ task, resolve, reject, retries }) {
    const target = this._leastBusyWorker();

    if (target) {
      this.pending.set(task.id, { resolve, reject, retries });
      target.activeTasks++;
      target.worker.postMessage(task);
      console.log(`[Pool] Task #${task.id} (${task.type}) → Worker ${target.id} [activeTasks: ${target.activeTasks}]`);
    } else {
      this.queue.push({ task, resolve, reject, retries });
      console.log(`[Pool] Task #${task.id} queued (queue size: ${this.queue.length})`);
    }
  }

  _leastBusyWorker() {
    if (this.workers.length === 0) return null;

    const sorted = [...this.workers].sort((a, b) => a.activeTasks - b.activeTasks);
    return sorted[0];
  }

  _handleResult(worker, msg) {
    const { id, result, error } = msg;
    const entry = this._getWorkerEntry(worker);
    if (entry) entry.activeTasks = Math.max(0, entry.activeTasks - 1);

    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);

    if (error) {
      console.log(`[Pool] Task #${id} failed: ${error}`);
      pending.reject(new Error(error));
    } else {
      console.log(`[Pool] Task #${id} done`);
      pending.resolve(result);
    }

    this._processQueue(entry);
  }

  _handleCrash(worker, workerId, err) {
    console.error(`[Pool] Worker ${workerId} CRASHED: ${err.message}`);

    const idx = this.workers.findIndex((w) => w.worker === worker);
    let crashedEntry = null;
    if (idx !== -1) {
      crashedEntry = this.workers.splice(idx, 1)[0];
    }

    console.log(`[Pool] Spawning replacement for Worker ${workerId}`);
    const newEntry = this._spawnWorker(workerId);

    setTimeout(() => this._processQueue(newEntry), 50);
  }

  _processQueue(workerEntry) {
    if (this.queue.length === 0) return;
    if (!workerEntry) return;

    const next = this.queue.shift();
    console.log(`[Pool] Dequeuing Task #${next.task.id} (queue remaining: ${this.queue.length})`);

    this.pending.set(next.task.id, {
      resolve: next.resolve,
      reject: next.reject,
      retries: next.retries,
    });

    workerEntry.activeTasks++;
    workerEntry.worker.postMessage(next.task);
  }


  _getWorkerEntry(worker) {
    return this.workers.find((w) => w.worker === worker);
  }

  status() {
    console.log("\n[Pool Status]");
    console.log(`  Workers: ${this.workers.length}/${this.poolSize}`);
    console.log(`  Queue:   ${this.queue.length} pending`);
    this.workers.forEach((w) =>
      console.log(`  Worker ${w.id}: ${w.activeTasks} active tasks`)
    );
  }

  async shutdown() {
    console.log("[Pool] Shutting down...");
    await Promise.all(this.workers.map((w) => w.worker.terminate()));
    this.workers = [];
    console.log("[Pool] All workers terminated");
  }
}


async function main() {
  const pool = new WorkerPool(3, 2);

  console.log("\n=== TEST 1: Multiple tasks (load balancing) ===");

  const tasks = [
    pool.runTask("fibonacci", { n: 35 }),
    pool.runTask("fibonacci", { n: 33 }),
    pool.runTask("primes",    { limit: 50000 }),
    pool.runTask("fibonacci", { n: 34 }),
    pool.runTask("primes",    { limit: 30000 }),
    pool.runTask("sort",      { array: Array.from({ length: 10000 }, () => Math.random()) }),
  ];

  pool.status();

  const results = await Promise.allSettled(tasks);

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const val = Array.isArray(r.value)
        ? `Array[${r.value.length}]`
        : r.value;
      console.log(`  Task ${i + 1}: OK → ${val}`);
    } else {
      console.log(`  Task ${i + 1}: FAILED → ${r.reason.message}`);
    }
  });

  console.log("\n=== TEST 2: Failure recovery ===");

  try {
    await pool.runTask("crash_test", {});
  } catch (e) {
    console.log(`  Expected error caught: ${e.message}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  console.log("\n  Sending task after recovery...");
  const postCrash = await pool.runTask("fibonacci", { n: 30 });
  console.log(`  Post-crash task result: ${postCrash}`);

  pool.status();
  await pool.shutdown();
}

main().catch(console.error);