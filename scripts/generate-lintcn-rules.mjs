import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lintcnRules } from "../compat/ported-rules.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, ".lintcn", "linteffect");

function toSnakeCase(value) {
  return value.replaceAll("-", "_");
}

function toPascalCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toMessageId(value) {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function goString(value) {
  return JSON.stringify(value);
}

function sourceUrl(sourceRule) {
  return `https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/${sourceRule}`;
}

function emitFile(rule) {
  const metadata = [
    `// lintcn:name ${rule.name}`,
    ...(rule.severity === "error" ? [] : ["// lintcn:severity warn"]),
    `// lintcn:description ${rule.message}`,
    `// lintcn:source ${sourceUrl(rule.sourceRule)}`,
  ];

  const varName = `${toPascalCase(rule.name)}Rule`;
  const messageId = toMessageId(rule.name);

  const header = `${metadata.join("\n")}

package linteffect

import (
\t"github.com/microsoft/typescript-go/shim/ast"
\t"github.com/typescript-eslint/tsgolint/internal/rule"
)

var ${varName} = rule.Rule{
\tName: ${goString(rule.name)},
\tRun: func(ctx rule.RuleContext, options any) rule.RuleListeners {
`;

  const footer = `\t},
}
`;
  const effectGuard = rule.effectOnly
    ? `\t\t\t\tif !isEffectFile(ctx) {\n\t\t\t\t\treturn\n\t\t\t\t}\n`
    : "";

  switch (rule.matcher.kind) {
    case "if-statement":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindIfStatement: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\treportRule(ctx, node.AsIfStatement().Expression, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t},
\t\t}
${footer}`;
    case "switch-statement":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindSwitchStatement: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\treportRule(ctx, node.AsSwitchStatement().Expression, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t},
\t\t}
${footer}`;
    case "conditional-expression":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindConditionalExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\treportRule(ctx, node.AsConditionalExpression().Condition, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t},
\t\t}
${footer}`;
    case "return-null":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindReturnStatement: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif expr := node.AsReturnStatement().Expression; expr != nil && expr.Kind == ast.KindNullKeyword {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "try-statement":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindTryStatement: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t},
\t\t}
${footer}`;
    case "dynamic-import":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif node.AsCallExpression().Expression.Kind == ast.KindImportKeyword {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "member-call":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
${effectGuard}\t\t\t\tif isMemberCall(node, ${goString(rule.matcher.objectName)}, ${goString(rule.matcher.propertyName)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "member-access":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindPropertyAccessExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isPropertyAccess(node, ${goString(rule.matcher.objectName)}, ${goString(rule.matcher.propertyName)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-fn-generator-call":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isMemberCall(node, "Effect", "fn") && firstArgumentIsGeneratorFunction(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "react-hook-call":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif isReactHookCall(node) {
\t\t\t\t\treportRule(ctx, node.Expression(), ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "member-call-string-arg":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isMemberCall(node, ${goString(rule.matcher.objectName)}, ${goString(rule.matcher.propertyName)}) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\targ := firstCallArgument(node)
\t\t\t\tif arg != nil && arg.Kind == ast.KindStringLiteral {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "const-string":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindVariableDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isConstVariableDeclaration(node) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tinit := node.AsVariableDeclaration().Initializer
\t\t\t\tif init != nil && init.Kind == ast.KindStringLiteral {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "type-text-regex":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindTypeReference: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif textMatches(node, ${goString(rule.matcher.pattern)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "type-alias-contains":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindTypeAliasDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif stringsContainsNodeText(node.AsTypeAliasDeclaration().Type, ${goString(rule.matcher.substring)}) {
\t\t\t\t\treportRule(ctx, node.AsTypeAliasDeclaration().Type, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "const-as-expression-non-const":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindVariableDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isConstVariableDeclaration(node) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tinit := node.AsVariableDeclaration().Initializer
\t\t\t\tif init == nil {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif init.Kind != ast.KindAsExpression {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif nodeText(init.AsAsExpression().Type) != "const" {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "member-call-arg-text-regex":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isMemberCall(node, ${goString(rule.matcher.objectName)}, ${goString(rule.matcher.propertyName)}) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif textMatches(firstCallArgument(node), ${goString(rule.matcher.pattern)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "member-call-text-regex":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isMemberCall(node, ${goString(rule.matcher.objectName)}, ${goString(rule.matcher.propertyName)}) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif textMatches(node, ${goString(rule.matcher.pattern)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "nested-arrow-iife":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif nested := nestedArrowIife(node); nested != nil {
\t\t\t\t\treportRule(ctx, nested, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-ladder":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindVariableDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif init := node.AsVariableDeclaration().Initializer; hasDeepEffectCall(init) {
\t\t\t\t\treportRule(ctx, init, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t\tast.KindReturnStatement: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif expr := node.AsReturnStatement().Expression; hasDeepEffectCall(expr) {
\t\t\t\t\treportRule(ctx, expr, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "deep-effect-call":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif hasDeepEffectCall(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-side-effect-wrapper":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isEffectSideEffectWrapper(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-wrapper-alias":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindVariableDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isEffectWrapperAliasVariable(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t\tast.KindFunctionDeclaration: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isEffectWrapperAliasFunction(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "inline-runtime-provide":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isInlineRuntimeProvideCall(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "match-effect-branch":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isMatchEffectBranchCall(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "return-in-arrow-callback":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif ret := firstReturnInArrowCallbackArgs(node); ret != nil {
\t\t\t\t\treportRule(ctx, ret, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "return-in-function-callback":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif ret := firstReturnInFunctionCallbackArgs(node); ret != nil {
\t\t\t\t\treportRule(ctx, ret, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "unknown-boolean-coercion-helper":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindBinaryExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isTypeofBooleanCheck(node) && sourceTextMatches(ctx, "Match\\\\.orElse\\\\(\\\\s*\\\\(\\\\)\\\\s*=>\\\\s*null\\\\s*\\\\)") {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-sync-side-effect-wrapper":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isEffectSyncSideEffectWrapper(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "call-text-regex":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
${effectGuard}\t\t\t\tif textMatches(node, ${goString(rule.matcher.pattern)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "object-text-regex":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindObjectLiteralExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif textMatches(node, ${goString(rule.matcher.pattern)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "nested-member-call-arg":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isMemberCallOnObject(node, ${goString(rule.matcher.objectName)}) && hasMemberCallArgumentOnObject(node, ${goString(rule.matcher.objectName)}) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "effect-succeed-simple-value":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif !isMemberCall(node, "Effect", "succeed") {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\targ := firstCallArgument(node)
\t\t\t\tif arg == nil || isDisallowedEffectSucceedArgument(arg) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t},
\t\t}
${footer}`;
    case "iife-call":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isInlineFunctionCallee(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    case "pipe-call-has-nested-pipe":
      return `${header}\t\treturn rule.RuleListeners{
\t\t\tast.KindCallExpression: func(node *ast.Node) {
\t\t\t\tif !isEffectFile(ctx) {
\t\t\t\t\treturn
\t\t\t\t}
\t\t\t\tif isPipeCall(node) && hasNestedPipeArgument(node) {
\t\t\t\t\treportRule(ctx, node, ${goString(messageId)}, ${goString(rule.message)})
\t\t\t\t}
\t\t\t},
\t\t}
${footer}`;
    default:
      throw new Error(`Unsupported matcher kind: ${rule.matcher.kind}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });

for (const entry of fs.readdirSync(outputDir)) {
  if (
    /^[a-z0-9_]+\.go$/i.test(entry) &&
    entry !== "common.go" &&
    !entry.endsWith("_test.go")
  ) {
    fs.rmSync(path.join(outputDir, entry));
  }
}

for (const rule of lintcnRules) {
  const filename = `${toSnakeCase(rule.name)}.go`;
  fs.writeFileSync(path.join(outputDir, filename), emitFile(rule));
}
