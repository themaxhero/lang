type ContextData<T> =
  | { tag: "empty" }
  | {
    tag: "red";
    key: string;
    value: T;
    left: ContextData<T>;
    right: ContextData<T>;
  }
  | {
    tag: "black";
    key: string;
    value: T;
    left: ContextData<T>;
    right: ContextData<T>;
  };

const empty: ContextData<unknown> = { tag: "empty" };

function newCtxData<T>(
  tag: "red" | "black",
  key: string,
  value: T,
  left: ContextData<T>,
  right: ContextData<T>,
): ContextData<T> {
  return { tag, key, value, left, right };
}

function newRedCtxData<T>(
  key: string,
  value: T,
  left: ContextData<T>,
  right: ContextData<T>,
): ContextData<T> {
  return newCtxData("red", key, value, left, right);
}

function newBlackCtxData<T>(
  key: string,
  value: T,
  left: ContextData<T>,
  right: ContextData<T>,
): ContextData<T> {
  return newCtxData("black", key, value, left, right);
}

function balance<T>(
  color: "red" | "black",
  key: string,
  value: T,
  left: ContextData<T>,
  right: ContextData<T>,
): ContextData<T> {
  if (right.tag === "red") {
    if (left.tag === "red") {
      return newRedCtxData(
        key,
        value,
        newBlackCtxData(left.key, left.value, left.left, left.right),
        newBlackCtxData(right.key, right.value, right.left, right.right),
      );
    }
    return newCtxData(
      color,
      right.key,
      right.value,
      newRedCtxData(key, value, left, right.left),
      right.right,
    );
  }

  if (left.tag === "red") {
    const ll = left.left;

    if (ll?.tag == "red") {
      return newRedCtxData(
        left.key,
        left.value,
        newBlackCtxData(ll.key, ll.value, ll.left, ll.left),
        newBlackCtxData(key, value, left.left, right),
      );
    }
  }

  return newCtxData(color, key, value, left, right);
}

function setHelp<T>(
  ctx: ContextData<T>,
  key: string,
  value: T,
): ContextData<T> {
  if (ctx.tag === "empty") {
    return newRedCtxData(
      key,
      value,
      empty as ContextData<T>,
      empty as ContextData<T>,
    );
  } else if (key === ctx.key) {
    return newCtxData(ctx.tag, ctx.key, value, ctx.left, ctx.right);
  } else if (key < ctx.key) {
    return balance(
      ctx.tag,
      ctx.key,
      ctx.value,
      setHelp(ctx.left, key, value),
      ctx.right,
    );
  } else {
    return balance(
      ctx.tag,
      ctx.key,
      ctx.value,
      ctx.left,
      setHelp(ctx.right, key, value),
    );
  }
}

function set<T>(ctx0: ContextData<T>, key: string, value: T): ContextData<T> {
  const ctx1 = setHelp(ctx0, key, value);
  ctx1.tag = "black";
  return ctx1;
}

export class KeyNotFoundError extends Error {
  constructor(key: string) {
    super(`${key} is not defined`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

function get<T>(ctx0: ContextData<T>, key: string): T {
  for (
    let ctx1 = ctx0;
    ctx1.tag != "empty";
    ctx1 = (key < ctx1.key) ? ctx1.left : ctx1.right
  ) {
    if (key === ctx1.key) return ctx1.value;
  }

  throw new KeyNotFoundError(key);
}

export class Context<T> {
  private static _empty = new Context<unknown>(empty);

  public static empty<T>(): Context<T> {
    return Context._empty as Context<T>;
  }

  private constructor(private data: ContextData<T>) {}

  /**
   * Get the value associated with a key.
   * Throws KeyNotFoundError when key is not found.
   *
   * @param key 
   */
  public get(key: string): T {
    return get(this.data, key);
  }

  /**
   * Insert a key-value pair to the context.
   * Replaces value when there is a collision.
   * 
   * @param key 
   * @param value 
   */
  public set(key: string, value: T): Context<T> {
    return new Context<T>(set(this.data, key, value));
  }
}

export default Context;
