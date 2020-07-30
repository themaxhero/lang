import Context, { KeyNotFoundError } from "./context.ts";

export type Expr =
  | { ctor: "lam"; name: string; body: Expr }
  | { ctor: "app"; func: Expr; argm: Expr }
  | { ctor: "var"; name: string };

export function lam(name: string, body: Expr): Expr {
  return { ctor: "lam", name, body };
}

export function app(func: Expr, argm: Expr): Expr {
  return { ctor: "app", func, argm };
}

export function var_(name: string): Expr {
  return { ctor: "var", name };
}

export function replace(
  expr: Expr,
  ctx: Context<Expr> = Context.empty(),
): Expr {
  console.log(expr);
  switch (expr.ctor) {
    case "app": {
      return app(
        replace(expr.func, ctx),
        replace(expr.argm, ctx),
      );
    }
    case "lam": {
      const name = expr.name;
      return lam(
        name,
        replace(expr.body, ctx.del(name)),
      );
    }
    case "var": {
      try {
        return ctx.get(expr.name);
      } catch (e) {
        if (e instanceof KeyNotFoundError) return expr;
        throw e;
      }
    }
  }
}

export function reduce(
  expr: Expr,
  ctx: Context<Expr> = Context.empty(),
): Expr {
  if (expr.ctor === "app") {
    const func = reduce(expr.func, ctx);

    if (func.ctor === "lam") {
      const argm = reduce(expr.argm, ctx);
      return reduce(replace(func.body, ctx.set(func.name, argm)), ctx);
    }

    return app(func, expr.argm);
  }

  return expr;
}

export default reduce;
