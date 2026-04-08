import { oxlintRules } from "../compat/ported-rules.mjs";

function isEffectLikeText(text) {
  return (
    text.includes('"effect"') ||
    text.includes("'effect'") ||
    text.includes('"effect/') ||
    text.includes("'effect/") ||
    text.includes('"@effect-atom/atom-react"') ||
    text.includes("'@effect-atom/atom-react'")
  );
}

function unwrapParens(node) {
  while (node?.type === "ParenthesizedExpression") {
    node = node.expression;
  }
  return node;
}

function isDirectMemberAccess(node, objectName, propertyName) {
  node = unwrapParens(node);
  if (!node || node.type !== "MemberExpression" || node.computed) {
    return false;
  }
  return (
    node.object?.type === "Identifier" &&
    node.object.name === objectName &&
    node.property?.type === "Identifier" &&
    node.property.name === propertyName
  );
}

function isDirectMemberAccessOnObject(node, objectName) {
  node = unwrapParens(node);
  if (!node || node.type !== "MemberExpression" || node.computed) {
    return false;
  }
  return (
    node.object?.type === "Identifier" &&
    node.object.name === objectName &&
    node.property?.type === "Identifier"
  );
}

function isDirectMemberCall(node, objectName, propertyName) {
  return (
    node?.type === "CallExpression" &&
    isDirectMemberAccess(unwrapParens(node.callee), objectName, propertyName)
  );
}

function isDirectMemberCallOnObject(node, objectName) {
  return (
    node?.type === "CallExpression" &&
    isDirectMemberAccessOnObject(unwrapParens(node.callee), objectName)
  );
}

function isStringLiteral(node) {
  return (
    node &&
    ((node.type === "Literal" && typeof node.value === "string") ||
      node.type === "StringLiteral")
  );
}

function isNullLiteral(node) {
  return (
    node &&
    ((node.type === "Literal" && node.value === null) ||
      node.type === "NullLiteral")
  );
}

function firstArgument(node) {
  return node?.arguments?.[0] ?? null;
}

function lastArgument(node) {
  const args = callArguments(node);
  return args.at(-1) ?? null;
}

function callArguments(node) {
  return node?.arguments ?? [];
}

function textOf(sourceCode, node) {
  return node ? sourceCode.getText(node) : "";
}

function isImportExpressionNode(node) {
  return (
    node?.type === "ImportExpression" ||
    (node?.type === "CallExpression" && unwrapParens(node.callee)?.type === "Import")
  );
}

function isGeneratorFunctionExpression(node) {
  return (
    node?.type === "FunctionExpression" &&
    node.generator === true
  );
}

function isInlineFunctionLike(node) {
  node = unwrapParens(node);
  return (
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}

function isReactHookCall(node, hookNames) {
  if (node?.type !== "CallExpression") {
    return false;
  }

  const callee = unwrapParens(node.callee);
  if (callee?.type === "Identifier") {
    return hookNames.has(callee.name);
  }

  return (
    callee?.type === "MemberExpression" &&
    !callee.computed &&
    callee.property?.type === "Identifier" &&
    hookNames.has(callee.property.name)
  );
}

function isPipeCall(node) {
  if (node?.type !== "CallExpression") {
    return false;
  }

  const callee = unwrapParens(node.callee);
  if (callee?.type === "Identifier") {
    return callee.name === "pipe";
  }

  return (
    callee?.type === "MemberExpression" &&
    !callee.computed &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "pipe"
  );
}

function isMethodPipeCall(node) {
  if (node?.type !== "CallExpression") {
    return false;
  }

  const callee = unwrapParens(node.callee);
  return (
    callee?.type === "MemberExpression" &&
    !callee.computed &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "pipe"
  );
}

function hasNestedPipeArgument(sourceCode, node) {
  return callArguments(node).some((argument) =>
    /\bpipe\s*\(|\.pipe\s*\(/.test(textOf(sourceCode, argument)),
  );
}

function isDisallowedEffectSucceedArgument(node) {
  node = unwrapParens(node);
  return (
    node?.type === "ObjectExpression" ||
    node?.type === "ArrayExpression" ||
    node?.type === "CallExpression" ||
    node?.type === "ConditionalExpression"
  );
}

function firstDescendant(node, predicate) {
  if (!node) {
    return null;
  }

  const stack = [];
  const pushChildren = (value) => {
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        pushChildren(value[index]);
      }
      return;
    }
    if (value && typeof value.type === "string") {
      stack.push(value);
    }
  };

  for (const [key, value] of Object.entries(node)) {
    if (key !== "parent") {
      pushChildren(value);
    }
  }

  while (stack.length > 0) {
    const current = stack.pop();
    if (predicate(current)) {
      return current;
    }
    for (const [key, value] of Object.entries(current)) {
      if (key !== "parent") {
        pushChildren(value);
      }
    }
  }

  return null;
}

function hasAncestor(node, predicate) {
  for (let parent = node?.parent; parent; parent = parent.parent) {
    if (predicate(parent)) {
      return true;
    }
  }
  return false;
}

function topLevelReturnExpression(node) {
  node = unwrapParens(node);
  if (node?.type !== "BlockStatement") {
    return null;
  }
  for (const statement of node.body ?? []) {
    if (statement.type === "ReturnStatement") {
      return statement.argument ?? null;
    }
  }
  return null;
}

function isEffectCall(node) {
  return isDirectMemberCallOnObject(unwrapParens(node), "Effect");
}

function isConsoleCall(node) {
  if (node?.type !== "CallExpression") {
    return false;
  }
  const callee = unwrapParens(node.callee);
  return (
    callee?.type === "MemberExpression" &&
    !callee.computed &&
    callee.object?.type === "Identifier" &&
    callee.object.name === "console"
  );
}

function isEffectSyncSideEffectWrapper(node) {
  if (!isDirectMemberCall(node, "Effect", "sync")) {
    return false;
  }
  const argument = unwrapParens(firstArgument(node));
  if (argument?.type !== "ArrowFunctionExpression") {
    return false;
  }
  const body = unwrapParens(argument.body);
  return body?.type === "CallExpression" && !isConsoleCall(body);
}

function nestedArrowIife(node) {
  if (node?.type !== "CallExpression") {
    return null;
  }
  const callee = unwrapParens(node.callee);
  if (callee?.type !== "ArrowFunctionExpression") {
    return null;
  }

  const body = unwrapParens(callee.body);
  if (
    body?.type === "CallExpression" &&
    unwrapParens(body.callee)?.type === "ArrowFunctionExpression"
  ) {
    return body;
  }

  return firstDescendant(body, (child) => (
    child?.type === "CallExpression" &&
    unwrapParens(child.callee)?.type === "ArrowFunctionExpression"
  ));
}

function hasDeepEffectCall(node) {
  node = unwrapParens(node);
  if (!isEffectCall(node)) {
    return false;
  }
  const inner = unwrapParens(firstArgument(node));
  return isEffectCall(inner) && isEffectCall(unwrapParens(firstArgument(inner)));
}

function containsSideEffectWrapperContent(sourceCode, node) {
  const text = textOf(sourceCode, node);
  return (
    /\b(?:setState|invalidate)\s*\(/.test(text) ||
    /\bAtom\.set\s*\(/.test(text) ||
    /\bEffect\.log[\w$]*\s*\(/.test(text) ||
    /\bconsole\.[A-Za-z_$][\w$]*\s*\(/.test(text)
  );
}

function isEffectSideEffectWrapper(sourceCode, node) {
  if (
    !isDirectMemberCall(node, "Effect", "as") &&
    !isDirectMemberCall(node, "Effect", "zipRight")
  ) {
    return false;
  }
  return containsSideEffectWrapperContent(sourceCode, unwrapParens(firstArgument(node)));
}

function isPipeCallWithEffectSource(node) {
  node = unwrapParens(node);
  return isPipeCall(node) && isEffectCall(unwrapParens(firstArgument(node)));
}

function returnsEffectWrapperAlias(node) {
  node = unwrapParens(node);
  if (!node) {
    return false;
  }
  if (isPipeCallWithEffectSource(node) || isEffectCall(node)) {
    return true;
  }
  const returnExpression = unwrapParens(topLevelReturnExpression(node));
  return (
    isPipeCallWithEffectSource(returnExpression) ||
    isEffectCall(returnExpression)
  );
}

function isConstDeclarator(node) {
  return node?.type === "VariableDeclarator" && node.parent?.kind === "const";
}

function isEffectWrapperAliasVariable(node) {
  if (!isConstDeclarator(node)) {
    return false;
  }
  const init = unwrapParens(node.init);
  if (!init) {
    return false;
  }
  return (
    isPipeCallWithEffectSource(init) ||
    (init.type === "ArrowFunctionExpression" && returnsEffectWrapperAlias(init.body))
  );
}

function isEffectWrapperAliasFunction(node) {
  return node?.type === "FunctionDeclaration" && returnsEffectWrapperAlias(node.body);
}

function isInlineRuntimeProvideCall(node) {
  if (!isDirectMemberCall(node, "Effect", "provide") || callArguments(node).length !== 1) {
    return false;
  }
  return (
    hasAncestor(
      node,
      (parent) => parent?.type === "YieldExpression" && parent.delegate === true,
    ) &&
    hasAncestor(node, isMethodPipeCall)
  );
}

function callbackBody(node) {
  node = unwrapParens(node);
  if (node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression") {
    return node.body ?? null;
  }
  return null;
}

function containsBranchSequencing(sourceCode, node) {
  const text = textOf(sourceCode, node);
  return (
    /\bEffect\.(?:flatMap|map|andThen|tap|zipRight)\s*\(/.test(text) ||
    /(?:^|[^A-Za-z0-9_$])pipe\s*\(/.test(text) ||
    /\.pipe\s*\(/.test(text) ||
    /\bStream\.[A-Za-z_$][\w$]*\s*\(/.test(text)
  );
}

function isMatchEffectBranchCall(sourceCode, node) {
  node = unwrapParens(node);

  if (isMethodPipeCall(node)) {
    const callee = unwrapParens(node.callee);
    if (
      callee?.type === "MemberExpression" &&
      isDirectMemberCall(unwrapParens(callee.object), "Match", "value")
    ) {
      for (const argument of callArguments(node)) {
        const branch = unwrapParens(argument);
        if (
          !isDirectMemberCall(branch, "Match", "when") &&
          !isDirectMemberCall(branch, "Match", "orElse")
        ) {
          continue;
        }
        const body = callbackBody(lastArgument(branch));
        if (body && containsBranchSequencing(sourceCode, body)) {
          return true;
        }
      }
    }
  }

  if (!isDirectMemberCall(node, "Option", "match")) {
    return false;
  }

  const cases = callArguments(node)[1];
  return Boolean(firstDescendant(cases, (child) => {
    const body = callbackBody(child);
    return body ? containsBranchSequencing(sourceCode, body) : false;
  }));
}

function isSchemaFilterCall(node) {
  return (
    isDirectMemberCall(node, "S", "filter") ||
    isDirectMemberCall(node, "Schema", "filter")
  );
}

function firstReturnInArrowCallbackArgs(node) {
  if (node?.type !== "CallExpression" || isSchemaFilterCall(node)) {
    return null;
  }
  for (const argument of callArguments(node)) {
    const callback = unwrapParens(argument);
    if (
      callback?.type === "ArrowFunctionExpression" &&
      callback.body?.type === "BlockStatement"
    ) {
      const found = firstDescendant(callback.body, (child) => child?.type === "ReturnStatement");
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function firstReturnInFunctionCallbackArgs(node) {
  if (node?.type !== "CallExpression") {
    return null;
  }
  for (const argument of callArguments(node)) {
    const callback = unwrapParens(argument);
    if (callback?.type === "FunctionExpression" && callback.body) {
      const found = firstDescendant(callback.body, (child) => child?.type === "ReturnStatement");
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function isTypeofBooleanCheck(node) {
  return (
    node?.type === "BinaryExpression" &&
    node.operator === "===" &&
    unwrapParens(node.left)?.type === "UnaryExpression" &&
    unwrapParens(node.left).operator === "typeof" &&
    isStringLiteral(unwrapParens(node.right)) &&
    unwrapParens(node.right).value === "boolean"
  );
}

function createRule(definition) {
  return {
    meta: {
      type: definition.severity === "error" ? "problem" : "suggestion",
      schema: [],
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode();
      const effectFile = !definition.effectOnly || isEffectLikeText(sourceCode.text);
      const report = (node) => {
        context.report({
          node,
          message: definition.message,
        });
      };

      const ensureEffectFile = () => effectFile;

      switch (definition.matcher.kind) {
        case "if-statement":
          return {
            IfStatement(node) {
              if (!ensureEffectFile()) return;
              report(node.test ?? node);
            },
          };
        case "switch-statement":
          return {
            SwitchStatement(node) {
              if (!ensureEffectFile()) return;
              report(node.discriminant ?? node);
            },
          };
        case "conditional-expression":
          return {
            ConditionalExpression(node) {
              if (!ensureEffectFile()) return;
              report(node.test ?? node);
            },
          };
        case "return-null":
          return {
            ReturnStatement(node) {
              if (!ensureEffectFile()) return;
              if (isNullLiteral(node.argument)) {
                report(node);
              }
            },
          };
        case "try-statement":
          return {
            TryStatement(node) {
              if (!ensureEffectFile()) return;
              report(node);
            },
          };
        case "dynamic-import":
          return {
            ImportExpression(node) {
              report(node);
            },
            CallExpression(node) {
              if (isImportExpressionNode(node)) {
                report(node);
              }
            },
          };
        case "member-call":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                isDirectMemberCall(
                  node,
                  definition.matcher.objectName,
                  definition.matcher.propertyName,
                )
              ) {
                report(node);
              }
            },
          };
        case "member-access":
          return {
            MemberExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                isDirectMemberAccess(
                  node,
                  definition.matcher.objectName,
                  definition.matcher.propertyName,
                )
              ) {
                report(node);
              }
            },
          };
        case "effect-fn-generator-call":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (!isDirectMemberCall(node, "Effect", "fn")) {
                return;
              }
              if (isGeneratorFunctionExpression(firstArgument(node))) {
                report(node);
              }
            },
          };
        case "react-hook-call": {
          const hookNames = new Set(definition.matcher.hookNames);
          return {
            CallExpression(node) {
              if (isReactHookCall(node, hookNames)) {
                report(node.callee ?? node);
              }
            },
          };
        }
        case "member-call-string-arg":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                !isDirectMemberCall(
                  node,
                  definition.matcher.objectName,
                  definition.matcher.propertyName,
                )
              ) {
                return;
              }
              if (isStringLiteral(firstArgument(node))) {
                report(node);
              }
            },
          };
        case "const-string":
          return {
            VariableDeclaration(node) {
              if (!ensureEffectFile()) return;
              if (node.kind !== "const") {
                return;
              }
              for (const declarator of node.declarations ?? []) {
                if (isStringLiteral(declarator.init)) {
                  report(node);
                  return;
                }
              }
            },
          };
        case "type-text-regex": {
          const pattern = new RegExp(definition.matcher.pattern);
          const visitor = {};
          for (const nodeType of definition.matcher.nodeTypes) {
            visitor[nodeType] = (node) => {
              if (!ensureEffectFile()) return;
              if (pattern.test(textOf(sourceCode, node).trim())) {
                report(node);
              }
            };
          }
          return visitor;
        }
        case "type-alias-contains":
          return {
            TSTypeAliasDeclaration(node) {
              if (!ensureEffectFile()) return;
              if (textOf(sourceCode, node.typeAnnotation ?? node).includes(definition.matcher.substring)) {
                report(node.typeAnnotation ?? node);
              }
            },
          };
        case "const-as-expression-non-const":
          return {
            VariableDeclaration(node) {
              if (!ensureEffectFile()) return;
              if (node.kind !== "const") {
                return;
              }
              for (const declarator of node.declarations ?? []) {
                const init = declarator.init;
                if (!init || init.type !== "TSAsExpression") {
                  continue;
                }
                if (textOf(sourceCode, init.typeAnnotation).trim() !== "const") {
                  report(node);
                  return;
                }
              }
            },
          };
        case "member-call-arg-text-regex": {
          const pattern = new RegExp(definition.matcher.pattern);
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                !isDirectMemberCall(
                  node,
                  definition.matcher.objectName,
                  definition.matcher.propertyName,
                )
              ) {
                return;
              }
              const argText = textOf(sourceCode, firstArgument(node)).trim();
              if (pattern.test(argText)) {
                report(node);
              }
            },
          };
        }
        case "member-call-text-regex": {
          const pattern = new RegExp(definition.matcher.pattern);
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                !isDirectMemberCall(
                  node,
                  definition.matcher.objectName,
                  definition.matcher.propertyName,
                )
              ) {
                return;
              }
              if (pattern.test(textOf(sourceCode, node))) {
                report(node);
              }
            },
          };
        }
        case "call-text-regex": {
          const pattern = new RegExp(definition.matcher.pattern);
          const excludedCallees = new Set(definition.matcher.excludedCallees ?? []);
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (excludedCallees.has(textOf(sourceCode, node.callee).trim())) {
                return;
              }
              if (pattern.test(textOf(sourceCode, node))) {
                report(node);
              }
            },
          };
        }
        case "object-text-regex": {
          const pattern = new RegExp(definition.matcher.pattern);
          return {
            ObjectExpression(node) {
              if (!ensureEffectFile()) return;
              if (pattern.test(textOf(sourceCode, node))) {
                report(node);
              }
            },
          };
        }
        case "nested-member-call-arg":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (!isDirectMemberCallOnObject(node, definition.matcher.objectName)) {
                return;
              }
              if (
                callArguments(node).some((argument) =>
                  isDirectMemberCallOnObject(argument, definition.matcher.objectName),
                )
              ) {
                report(node);
              }
            },
          };
        case "effect-succeed-simple-value":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (!isDirectMemberCall(node, "Effect", "succeed")) {
                return;
              }
              const argument = firstArgument(node);
              if (!argument || isDisallowedEffectSucceedArgument(argument)) {
                return;
              }
              report(node);
            },
          };
        case "effect-sync-side-effect-wrapper":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isEffectSyncSideEffectWrapper(node)) {
                report(node);
              }
            },
          };
        case "iife-call":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isInlineFunctionLike(node.callee)) {
                report(node);
              }
            },
          };
        case "pipe-call-has-nested-pipe":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isPipeCall(node) && hasNestedPipeArgument(sourceCode, node)) {
                report(node);
              }
            },
          };
        case "nested-arrow-iife":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              const nested = nestedArrowIife(node);
              if (nested) {
                report(nested);
              }
            },
          };
        case "effect-ladder":
          return {
            VariableDeclarator(node) {
              if (!ensureEffectFile()) return;
              if (hasDeepEffectCall(node.init)) {
                report(node.init ?? node);
              }
            },
            ReturnStatement(node) {
              if (!ensureEffectFile()) return;
              if (hasDeepEffectCall(node.argument)) {
                report(node.argument ?? node);
              }
            },
          };
        case "effect-side-effect-wrapper":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isEffectSideEffectWrapper(sourceCode, node)) {
                report(node);
              }
            },
          };
        case "effect-wrapper-alias":
          return {
            VariableDeclarator(node) {
              if (!ensureEffectFile()) return;
              if (isEffectWrapperAliasVariable(node)) {
                report(node.init ?? node);
              }
            },
            FunctionDeclaration(node) {
              if (!ensureEffectFile()) return;
              if (isEffectWrapperAliasFunction(node)) {
                report(node);
              }
            },
          };
        case "inline-runtime-provide":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isInlineRuntimeProvideCall(node)) {
                report(node);
              }
            },
          };
        case "match-effect-branch":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (isMatchEffectBranchCall(sourceCode, node)) {
                report(node);
              }
            },
          };
        case "deep-effect-call":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              if (hasDeepEffectCall(node)) {
                report(node);
              }
            },
          };
        case "return-in-arrow-callback":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              const ret = firstReturnInArrowCallbackArgs(node);
              if (ret) {
                report(ret);
              }
            },
          };
        case "return-in-function-callback":
          return {
            CallExpression(node) {
              if (!ensureEffectFile()) return;
              const ret = firstReturnInFunctionCallbackArgs(node);
              if (ret) {
                report(ret);
              }
            },
          };
        case "unknown-boolean-coercion-helper":
          return {
            BinaryExpression(node) {
              if (!ensureEffectFile()) return;
              if (
                isTypeofBooleanCheck(node) &&
                /Match\.orElse\s*\(\s*\(\)\s*=>\s*null\s*\)/.test(sourceCode.text)
              ) {
                report(node);
              }
            },
          };
        default:
          return {};
      }
    },
  };
}

const rules = Object.fromEntries(
  oxlintRules.map((definition) => [definition.name, createRule(definition)]),
);

export default {
  meta: {
    name: "linteffect",
  },
  rules,
};
