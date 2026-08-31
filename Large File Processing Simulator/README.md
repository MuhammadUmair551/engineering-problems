# Large File Processing Simulator

## Overview
This project compares two ways of processing large datasets:
1. streaming data with a generator
2. loading all data into memory as an array

It demonstrates the memory and performance trade-offs between lazy processing and eager loading.

## What the code does
- Generates records incrementally
- Processes records one by one
- Compares memory footprint against a full in-memory array approach
- Prints timing and heap usage for both approaches

## Why it matters
When working with large files or big datasets, loading everything into memory can become expensive or impossible. Streaming and generator-based processing let you work with data in smaller chunks and reduce peak memory usage.

## Example idea
```js
function* generateDataset(total) {
  for (let i = 1; i <= total; i++) {
    yield { id: i, amount: i * 10 };
  }
}
```

## Complexity
- Generator approach: memory-efficient and scalable for large inputs
- Array approach: simpler but higher memory use

## Notes
This is a practical example of how engineering systems often choose streaming strategies to handle large-scale processing without exhausting memory.
