import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import reduce, { lam, app, var_ } from "./reduce.ts";

// (a => a)(b)
const id = lam("a", var_("a"));

// f => x => x
const zero = lam("f", lam("x", var_("x")));

// n => f => x => f(n(f)(x))
const succ = lam(
  "n",
  lam("f", lam("x", app(var_("f"), app(app(var_("n"), var_("f")), var_("x"))))),
);

// f => x => f(zero(f)(x))
const one = lam(
  "f",
  lam("x", app(var_("f"), app(app(zero, var_("f")), var_("x")))),
);

Deno.test("(a => a)(b) = b", () => {
  const b = var_("b");
  const expr = app(id, b);
  assertEquals(reduce(expr), b);
});

Deno.test("0++ = 1", () => {
  const expr = app(succ, zero);
  assertEquals(reduce(expr), one);
});
