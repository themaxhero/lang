type Tree<T> =
  | { ctor: "red"; key: string; value: T; left: Tree<T>; right: Tree<T> }
  | { ctor: "black"; key: string; value: T; left: Tree<T>; right: Tree<T> }
  | { ctor: "empty" };

// deno-lint-ignore no-explicit-any
const empty: Tree<any> = { ctor: "empty" };

function redBlack<T>(
  tag: "red" | "black",
  key: string,
  value: T,
  left: Tree<T>,
  right: Tree<T>,
): Tree<T> {
  return { ctor: tag, key, value, left, right };
}

function red<T>(
  key: string,
  value: T,
  left: Tree<T>,
  right: Tree<T>,
): Tree<T> {
  return redBlack("red", key, value, left, right);
}

function black<T>(
  key: string,
  value: T,
  left: Tree<T>,
  right: Tree<T>,
): Tree<T> {
  return redBlack("black", key, value, left, right);
}

function balance<T>(
  ctor: "red" | "black",
  key: string,
  value: T,
  left: Tree<T>,
  right: Tree<T>,
): Tree<T> {
  if (right.ctor === "red") {
    if (left.ctor === "red") {
      return red(
        key,
        value,
        black(left.key, left.value, left.left, left.right),
        black(right.key, right.value, right.left, right.right),
      );
    }
    return redBlack(
      ctor,
      right.key,
      right.value,
      red(key, value, left, right.left),
      right.right,
    );
  }

  if (left.ctor === "red") {
    const ll = left.left;

    if (ll?.ctor == "red") {
      return red(
        left.key,
        left.value,
        black(ll.key, ll.value, ll.left, ll.left),
        black(key, value, left.left, right),
      );
    }
  }

  return redBlack(ctor, key, value, left, right);
}

function setHelp<T>(
  tree: Tree<T>,
  key: string,
  value: T,
): Tree<T> {
  if (tree.ctor === "empty") {
    return red(
      key,
      value,
      empty as Tree<T>,
      empty as Tree<T>,
    );
  }

  const treeKey = tree.key;

  if (key === treeKey) {
    return redBlack(tree.ctor, treeKey, value, tree.left, tree.right);
  } else if (key < treeKey) {
    return balance(
      tree.ctor,
      treeKey,
      tree.value,
      setHelp(tree.left, key, value),
      tree.right,
    );
  }

  return balance(
    tree.ctor,
    treeKey,
    tree.value,
    tree.left,
    setHelp(tree.right, key, value),
  );
}

export class KeyNotFoundError extends Error {
  constructor(key: string) {
    super(`${key} is not defined`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Used for variable scope management.
 * A simple red black tree data type with two operations: get and set.
 */
export class Context<T> {
  // deno-lint-ignore no-explicit-any
  private static _empty = new Context<any>(empty);

  /**
   * Create an empty context.
   */
  public static empty<T>(): Context<T> {
    return Context._empty;
  }

  private constructor(private tree: Tree<T>) {}

  /**
   * Get the value associated with a key.
   * Throws KeyNotFoundError when key is not found.
   *
   * @param key 
   */
  public get(key: string): T {
    for (
      let tree = this.tree;
      tree.ctor != "empty";
      tree = (key < tree.key) ? tree.left : tree.right
    ) {
      // TODO: remove the undefined check
      if (key === tree.key && tree.value !== undefined) return tree.value;
    }

    throw new KeyNotFoundError(key);
  }

  /**
   * Insert a key-value pair to the context.
   * Replaces value when there is a collision.
   * 
   * @param key 
   * @param value 
   */
  public set(key: string, value: T): Context<T> {
    const tree = setHelp(this.tree, key, value);
    tree.ctor = "black";
    return new Context(tree);
  }

  /**
   * Remove a key-value pair from the context.
   * If the key is not found, no changes are made.
   */
  public del(key: string): Context<T> {
    // TODO: implement removal
    return this.set(key, undefined as any);
  }
}

export default Context;
