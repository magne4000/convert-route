---
"convert-route": major
---

feat(rou3)!: `fromRou3` and `toRou3` follow the rou3 v0.12+ (1.x) syntax, aligned with URLPattern

- `fromRou3`: `*` is a catch-all that matches the rest of the path, `/` included (optional at the end of a route, at least one segment before more of it); `:name?`, `:name+` and `:name*` are supported; the old `*:name` form is no longer read as an optional param
- `toRou3`: an optional param becomes `:name?` in any position, so it always returns a single pattern instead of one per combination; an optional named catch-all becomes `:name*` instead of `**`, keeping its name
- `toRou3` throws a `ConvertRouteError` for a route with more than one greedy catch-all, which rou3 rejects
