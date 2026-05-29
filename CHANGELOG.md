# Changelog

## 0.0.5

Added `no-family-collection-read`, a lint rule that prevents keyed atom-family projections from reading collection/list projections. Row/item atoms should read from keyed source or index atoms to avoid circular projection graphs and unnecessary broad invalidation.
