# Custom Object Pool

## Overview
An object pool is a design pattern that reuses pre-created objects instead of repeatedly allocating and garbage-collecting new ones. It is especially useful when many short-lived objects are created in hot loops.

This project demonstrates a simple pooling approach for game-like or performance-sensitive workloads where object creation overhead matters.

## What the code does
- Creates a pool of reusable objects
- Acquires an object from the pool
- Releases it back to the pool after use
- Compares pooled vs non-pooled object creation performance

## Why it matters
In JavaScript, allocating lots of temporary objects can increase GC pressure and reduce throughput. A pool helps when:
- many objects are created and discarded quickly
- you want to reduce allocation churn
- the workload repeats often enough to justify reuse

## Example behavior
```js
const pool = new ObjectPool(1000);
const obj = pool.acquire();
obj.x = 10;
obj.y = 20;
pool.release(obj);
```

## Trade-offs
- Good for repeated short-lived objects
- Not useful when object lifetimes are unpredictable
- Requires careful reset logic so reused objects do not retain stale state

## Complexity
- Acquire: O(1)
- Release: O(1)
- Memory: O(n) for pool size

## Notes
The benchmark in this project compares performance between creating objects directly and reusing pooled objects. It helps illustrate when pooling is beneficial and when the overhead may not be worth it.
