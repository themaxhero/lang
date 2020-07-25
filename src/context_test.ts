import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import Context from "./context.ts";

Deno.test("optimization: empty never creates new objects", () => {
  assertEquals(Context.empty(), Context.empty());
});

Deno.test("get property is deterministic", () => {
  const a = Context.empty().set("key", "value");
  assertEquals(a.get("key"), a.get("key"));
});

Deno.test("set property", () => {
  const a = Context.empty().set("key", "value");
  assertEquals(a.get("key"), "value");
});

Deno.test("set property is deterministic", () => {
  const a = Context.empty().set("key", "value");
  const b = Context.empty().set("key", "value").set("key", "value");
  assertEquals(a.get("key"), b.get("key"));
});

Deno.test("set replaces existing property", () => {
  const a = Context.empty().set("key", "value").set("key", "replacement");
  assertEquals(a.get("key"), "replacement");
});

Deno.test("set keeps original object unchanged", () => {
  const a = Context.empty().set("key", "value");
  a.set("key", "replacement");
  assertEquals(a.get("key"), "value");
});
