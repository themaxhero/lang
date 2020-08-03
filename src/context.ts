type Tree<T> =
  | { ctor: "red"; key: string; value: T; left: Tree<T>; right: Tree<T> }
  | { ctor: "black"; key: string; value: T; left: Tree<T>; right: Tree<T> }
  | { ctor: "empty" };

type ColoredNode<T> = Exclude<Tree<T>, { ctor: "empty" }>;

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

function removeHelp2<T>(
  tree: ColoredNode<T>,
  targetKey: string,
): Tree<T> {
  const { ctor, key: k, value: v, left, right } = tree;
  if (targetKey < k) {
    if (left.ctor === "black") {
      if (left.left.ctor === "red") {
        const newLeft = removeHelp<T>(left, targetKey);
        return redBlack<T>(ctor, k, v, newLeft, right);
      }
      const movedTree = moveRedLeft<T>(tree);
      if (movedTree.ctor === "empty") return movedTree;
      const {
        ctor: mCtor,
        key: mKey,
        value: mValue,
        left: mLeft,
        right: mRight,
      } = movedTree;
      return balance<T>(
        mCtor,
        mKey,
        mValue,
        removeHelp<T>(mLeft, targetKey),
        mRight
      );
    }
    const newLeft = removeHelp<T>(left, targetKey);
    return redBlack<T>(ctor, k, v, newLeft, right);
  }
  const removeEQGTTree = removeHelpPrepEQGT<T>(tree, ctor, k, v, left, right);
  return removeHelpEQGT<T>(removeEQGTTree, targetKey);
}

function removeHelp<T>(
  tree: Tree<T>,
  targetKey: string,
): Tree<T> {
  if (tree.ctor === "empty") return tree;
  return removeHelp2<T>(tree, targetKey);
}

function remove<T>(tree: Tree<T>, targetKey: string): Tree<T> {
  const newContext = removeHelp<T>(tree, targetKey);
  if (newContext.ctor === "red") {
    const { key, value, left, right } = newContext as ColoredNode<T>;
    return black<T>(key, value, left, right);
  }
  return newContext;
}

function moveRedLeftHelp2<T>(
  tree: ColoredNode<T>,
): Tree<T> {
  const { key: k, value: v, left, right } = tree;
  const {
    key: lKey,
    value: lValue,
    left: lLeft,
    right: lRight,
  } = left as ColoredNode<T>;
  const {
    key: rKey,
    value: rValue,
    left: rLeft,
    right: rRight,
  } = right as ColoredNode<T>;
  const newLeft = red<T>(lKey, lValue, lLeft, lRight);
  const newRight = red<T>(rKey, rValue, rLeft, rRight);
  return black<T>(k, v, newLeft, newRight);
}

function moveRedLeftHelp<T>(tree: ColoredNode<T>): Tree<T> {
  const {
    key: lKey,
    value: lValue,
    left: lLeft,
    right: lRight,
  } = tree.left as ColoredNode<T>;
  const {
    key: rKey,
    value: rValue,
    left: rLeft,
    right: rRight,
  } = tree.right as ColoredNode<T>;
  const {
    key: rlKey,
    value: rlValue,
    left: rlLeft,
    right: rlRight,
  } = rLeft as ColoredNode<T>;
  const newRLeft = red<T>(lKey, lValue, lLeft, lRight);
  const left = black<T>(tree.key, tree.value, newRLeft, rlLeft);
  const right = black<T>(rKey, rValue, rlRight, rRight);
  return red<T>(rlKey, rlValue, left, right);
}

function moveRedLeft<T>(tree: Tree<T>): Tree<T> {
  if (tree.ctor === "empty") return tree;

  if (tree.left.ctor !== "empty" && tree.right.ctor !== "empty") {
    if (tree.right.left.ctor === "red") return moveRedLeftHelp<T>(tree);
    return moveRedLeftHelp2<T>(tree);
  }
  return tree;
}

function moveRedRightHelp2<T>(tree: Tree<T>): Tree<T> {
  if (tree.ctor === "empty" || tree.left.ctor === "empty" || tree.right.ctor === "empty")
    return tree;
  const { key: k, value: v, left, right } = tree;
  const {
    key: lKey,
    value: lValue,
    left: lLeft,
    right: lRight,
  } = left;
  const {
    key: rKey,
    value: rValue,
    left: rLeft,
    right: rRight,
  } = right;
  const newLeft = red<T>(lKey, lValue, lLeft, lRight);
  const newRight = red<T>(rKey, rValue, rLeft, rRight);
  return black<T>(k, v, newLeft, newRight);
}

function moveRedRightHelp<T>(tree: ColoredNode<T>): Tree<T> {
  const {
    key: lKey,
    value: lValue,
    left: lLeft,
    right: lRight,
  } = tree.left as ColoredNode<T>;
  const {
    key: rKey,
    value: rValue,
    left: rLeft,
    right: rRight,
  } = tree.right as ColoredNode<T>;
  const {
    key: llKey,
    value: llValue,
    left: llLeft,
    right: llRight,
  } = lLeft as ColoredNode<T>;
  const newLLeft = red<T>(rKey, rValue, rLeft, rRight);
  const left = black<T>(llKey, llValue, llLeft, llRight);
  const right = black<T>(tree.key, tree.value, lRight, newLLeft);
  return red<T>(lKey, lValue, left, right);
}

function moveRedRight<T>(tree: Tree<T>): Tree<T> {
  if (tree.ctor === "empty") return tree;

  if (tree.left.ctor !== "empty" && tree.right.ctor !== "empty") {
    if (tree.left.left.ctor === "red") return moveRedRightHelp<T>(tree);
    return moveRedRightHelp2<T>(tree);
  }
  return tree;
}

function removeHelpPrepEQGT<T>(
  tree: ColoredNode<T>,
  ctor: "red" | "black",
  key: string,
  value: T,
  left: Tree<T>,
  right: Tree<T>
): Tree<T> {
  if (left.ctor === "red") {
    const newRight = red<T>(key, value, left.right, right);

    return redBlack<T>(ctor, left.key, left.value, left.left, newRight);
  }
  if (right.ctor === "black" && right.left.ctor !== "red") {
    return moveRedRight<T>(tree);
  }
  return tree;
}

function removeHelpEQGT<T>(tree: Tree<T>, targetKey: string): Tree<T> {
  if (tree.ctor === "empty") return tree;
  if (targetKey === tree.key) {
    const result = getMin<T>(tree.right);
    if (result.ctor === "empty") return result;
    const { ctor, key, value, left, right } = result;
    return balance<T>(ctor, key, value, left, removeMin(right));
  }
  const { ctor, key, value, left, right } = tree;
  return balance<T>(ctor, key, value, left, removeHelp(right, targetKey));
}

function getMin<T>(tree: Tree<T>): Tree<T> {
  if (tree.ctor === "empty" || tree.left.ctor === "empty") return tree;
  return getMin(tree.left);
}

function removeMin<T>(tree: Tree<T>): Tree<T> {
  if (tree.ctor === "empty" || tree.left.ctor === "empty") return empty as Tree<T>;
  if (tree.left.ctor !== "black"){
    const { ctor, key, value, left, right } = tree;
    return redBlack<T>(ctor, key, value, removeMin(left), right);
  }
  if (tree.left.left.ctor !== "red"){
    const movedTree = moveRedLeft(tree);
    if (movedTree.ctor === "empty")
      return empty as Tree<T>;
    const { ctor, key, value, left, right } = movedTree;
    return balance(ctor, key, value, removeMin(left), right);
  }
  const { ctor, key, value, left, right } = tree;
  return redBlack<T>(ctor, key, value, removeMin(left), right)
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
      if (key === tree.key) return tree.value;
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
    const tree = remove<T>(this.tree, key);
    return new Context(tree);
  }
}

export default Context;
