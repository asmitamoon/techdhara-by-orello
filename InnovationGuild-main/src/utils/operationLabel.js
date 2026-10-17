// Prettify an unknown operation code into a readable label:
// "smart_irrigation" -> "Smart Irrigation"
const prettifyCode = (v) =>
  String(v ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// Resolve an operation code to its label using the DB-backed operations list
// (covers standard + user-added custom operations). Falls back to a prettified
// code while the list is loading or if the code is missing.
export const operationLabel = (operationsList, code) =>
  operationsList?.find((o) => o.value === code)?.label ?? prettifyCode(code)
