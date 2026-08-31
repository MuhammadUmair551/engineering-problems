# Efficient Search Index

## Overview
This project implements a small search index using an inverted index, which maps words to the documents in which they appear. It supports phrase-like query parsing for `AND` and `OR` searches and ranks results by relevance.

## What the code does
- Builds an inverted index from a document set
- Tracks word frequency per document
- Supports query combinations such as:
  - `javascript and python`
  - `javascript or react`
- Sorts results by score using document frequency and relevance weighting

## Core concepts
- `invertedIndex`: maps a word to the document IDs containing it
- `wordFrequency`: tracks how many times each word appears in each document
- `rankResults()`: assigns a score to each matching document

## Why it matters
Search engines and document retrieval systems rely on inverted indexes because they make lookups faster than scanning every document every time.

## Example
```js
buildIndex(documents);
const results = search("javascript and python");
displayResults(results);
```

## Time complexity
- Building index: O(total words)
- Query lookup: roughly O(number of matching documents)
- Ranking: depends on the number of results returned

## Notes
This is a simplified version of a real search engine, but it demonstrates the core principles behind indexing and relevance-based ranking.
