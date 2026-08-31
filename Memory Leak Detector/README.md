# Memory Leak Detector

## Overview
This project simulates memory growth by repeatedly creating objects and storing them in a global array. It demonstrates how memory leaks can appear in JavaScript applications when references are accidentally retained.

## What the code does
- Creates many objects in a loop
- Stores them in a long-lived array
- Measures application memory before and after repeated allocations
- Warns if memory growth exceeds a threshold

## Why it matters
Memory leaks can slowly consume RAM until the application becomes slow, unresponsive, or crashes. Detecting this pattern early is important for long-running services and UI applications.

## Example flow
```js
const leakedObjects = [];

for (let i = 0; i < 5000; i++) {
  leakedObjects.push({ id: i, data: new Array(100).fill("memory leak") });
}
```

## Key insight
The leak is not necessarily caused by JavaScript itself; it often occurs because a variable or collection continues holding references that should have been released.

## Notes
This example is intentionally simplified and meant to illustrate the symptom of memory growth rather than a production-grade leak detector.
