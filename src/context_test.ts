import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
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

Deno.test("removes value from the context", () => {
  const a = Context.empty().set("key1", "a").set("key2", "b").set("key3", "c");
  const b = a.del("key1");
  const c = Context.empty().set("key2", "b").set("key3", "c")
  assertEquals(b, c);
})

Deno.test("fallbacks to empty Context when is empty", () => {
  const a = Context.empty().set("key1", "a");
  const b = a.del("key1");
  const c = Context.empty();
  assertEquals(b, c);
})
