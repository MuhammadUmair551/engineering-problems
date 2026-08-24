// Ye file ka code har worker(thread) chalaye ga.
const { parentPort, workerData } = require("worker_threads");

parentPort.on("message", (task) => {

  try {
    let result;

    switch (task.type) {

      case "fibonacci": {
        result = fibonacci(task.data.n);
        break;
      }

      case "primes": {
        result = findPrimes(task.data.limit);
        break;
      }

      case "sort": {
        result = [...task.data.array].sort((a, b) => a - b);
        break;
      }

      case "crash_test": {
        throw new Error("Intentional worker crash for testing!");
      }

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    parentPort.postMessage({ id: task.id, result, error: null });

  } catch (err) {
    parentPort.postMessage({ id: task.id, result: null, error: err.message });
  }
});


function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function findPrimes(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;

  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }

  return sieve.reduce((acc, isPrime, num) => {
    if (isPrime) acc.push(num);
    return acc;
  }, []);
}

console.log(`[Worker ${workerData?.id ?? "?"}] Ready`);