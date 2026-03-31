# Node.js Side Module

This folder is an optional Node.js side module for lightweight data manipulation.

It does not replace the Python backend and does not affect the Flask app runtime.

## What it contains

- `src/scoreTools.js`
  - weighted score utility
  - competition ranking utility (tie-aware positions)
- `src/demo.js`
  - small runnable demo with sample student rows

## Run demo

```bash
cd node-tools
npm run demo
```

## Why this exists

It provides a small Node.js companion utility while keeping the main system architecture intact:

- Frontend client
- Python API service (Flask) for report generation
- Optional Node.js side tools for data manipulation support
