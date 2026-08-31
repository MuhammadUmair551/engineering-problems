# Worker Thread Task Processor

## Overview
This project demonstrates how to offload CPU-heavy work to worker threads in Node.js. It uses the `worker_threads` module to process tasks concurrently, reducing the load on the main event loop.

## What the code does
- Creates a pool of worker threads
- Submits different task types to workers
- Balances tasks across available workers
- Handles worker failures and recovers automatically
- Demonstrates task execution with Fibonacci, prime detection, and sorting

## Why it matters
Node.js is single-threaded by default, so compute-heavy tasks can block the main thread. Worker threads allow parts of the program to execute in parallel, which is useful for:
- CPU-bound tasks
- large computations
- background processing
- parallel job execution

## Example task types
- `fibonacci`
- `primes`
- `sort`
- `crash_test`

## Architecture
- `pool.js`: manages workers, scheduling, retries, and task queue
- `worker.js`: processes each task and sends results back to the main thread

## Notes
This is a practical systems example showing how to build a basic task-processing pool, which is a common pattern in worker-based architectures.
