// Run with: node tests/model.test.js
const assert = require("assert")
const path = require("path")
const Model = require(path.join(__dirname, "..", "Model.js"))

const test = (name, run) => { run(); console.log("ok - " + name) }

test("parseChargeLimit reads the sysfs value", () => {
  assert.strictEqual(Model.parseChargeLimit("80\n"), 80)
  assert.strictEqual(Model.parseChargeLimit("100"), 100)
})

test("parseChargeLimit rejects anything else", () => {
  for (const raw of ["", "\n", "0", "101", "-5", "80%", "abc", null, undefined]) {
    assert.strictEqual(Model.parseChargeLimit(raw), 0, String(raw))
  }
})

test("minutesToLimit counts to the given limit", () => {
  assert.strictEqual(Model.minutesToLimit(19, 38, 19, 100), 60)
  assert.strictEqual(Model.minutesToLimit(19, 38, 19, 80), 36)
  assert.strictEqual(Model.minutesToLimit(19, 38, -19, 100), 60)
})

test("minutesToLimit is 0 without a usable reading or at the limit", () => {
  assert.strictEqual(Model.minutesToLimit(34, 38, 19, 80), 0)
  assert.strictEqual(Model.minutesToLimit(19, 38, 0.1, 100), 0)
  assert.strictEqual(Model.minutesToLimit(19, 38, NaN, 100), 0)
  assert.strictEqual(Model.minutesToLimit(19, 0, 19, 100), 0)
  assert.strictEqual(Model.minutesToLimit(undefined, undefined, 19, 100), 0)
  assert.strictEqual(Model.minutesToLimit(19, 38, 19, 0), 0)
})

test("chargeLimitChangeAllowed spaces changes out", () => {
  assert.strictEqual(Model.chargeLimitChangeAllowed(0, 1000, 2500), true)
  assert.strictEqual(Model.chargeLimitChangeAllowed(1000, 3499, 2500), false)
  assert.strictEqual(Model.chargeLimitChangeAllowed(1000, 3500, 2500), true)
})

test("aboveChargeLimit only applies while holding above a real limit", () => {
  assert.strictEqual(Model.aboveChargeLimit(0.9, 80, true), true)
  assert.strictEqual(Model.aboveChargeLimit(0.9, 80, false), false)
  assert.strictEqual(Model.aboveChargeLimit(0.81, 80, true), false)
  assert.strictEqual(Model.aboveChargeLimit(0.8, 80, true), false)
  assert.strictEqual(Model.aboveChargeLimit(0.9, 100, true), false)
  assert.strictEqual(Model.aboveChargeLimit(0.9, 0, true), false)
})
