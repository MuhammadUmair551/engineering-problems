# Bloom Filter

## Overview
A Bloom filter is a space-efficient probabilistic data structure used to test whether an item is a member of a set. It supports fast membership checks and is commonly used in caching, database indexing, and network systems.

This implementation stores bits in a compact `Uint8Array` and uses multiple hash functions to reduce false positives while keeping memory usage low.

## What the code does
- Inserts items into the filter
- Checks whether an item may exist
- Tracks estimated false-positive rate
- Calculates memory usage and ideal parameter sizing
- Demonstrates how filter size and hash count affect performance and accuracy

## Core operations
- `insert(item)`: mark all hashed positions as set
- `lookup(item)`: return whether the item is definitely absent or probably present
- `falsePositiveRate()`: estimate the probability of a false positive
- `memoryUsage()`: inspect bit usage and memory footprint
- `optimalParams(n, targetFPRate)`: suggest a filter size and hash count

## Why it matters
A Bloom filter is useful when:
- you need quick membership tests
- the dataset is large
- memory must be controlled
- a small false-positive rate is acceptable

## Example
```js
const bf = new BloomFilter(200, 3);
bf.insert("apple");
const result = bf.lookup("apple");
console.log(result);
```

## Time and space complexity
- Insert: O(k)
- Lookup: O(k)
- Space: O(m)

Where:
- `k` is the number of hash functions
- `m` is the bit array size

## Notes
Bloom filters can return false positives, but they never return false negatives for inserted items. That makes them ideal for fast pre-checks before more expensive lookups.
