---
name: ts-fixture-complete-shapes
description: TypeScript test fixtures must include all required interface fields, not just the fields under test — partial shapes fail tsc --noEmit
type: convention
captured: 2026-05-02
source: /build session — verifier first-run failure on qf-coverage-probe tests, fix commit 5619cf0
---

When writing vitest mocks or inline fixtures for typed interfaces, every required field must be present even if the test only asserts on one or two of them. Partial objects compile fine at mock-call sites but fail `tsc --noEmit` because TypeScript checks the full shape against the interface.

**Why:** The verifier runs `tsc --noEmit` over the whole project. A fixture like `{ id: 1, body: "<p>text</p>" }` assigned to a `ReflectPost` (which has 7 required fields) will pass the Jest/vitest runtime but block CI on the type check. The same issue applies to function signatures — `csvField(value: string | null | boolean)` passed a `number` compiled fine in isolation but failed the project-wide check.

**How to apply:** When mocking a typed interface in tests, copy the full interface shape and fill every required field with a realistic stub value. For optional fields, use `null` or `undefined` as appropriate. If the interface grows new required fields later, TypeScript will immediately flag any fixture that is missing them — treat that as the intended behaviour, not a nuisance. Also check function parameter types when passing computed values (numbers, booleans) to helpers typed for a narrower set.
