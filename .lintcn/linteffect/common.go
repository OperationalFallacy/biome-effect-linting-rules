package linteffect

import (
	"regexp"
	"strings"

	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/microsoft/typescript-go/shim/scanner"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var reactHookNames = map[string]struct{}{
	"useState":             {},
	"useReducer":           {},
	"useContext":           {},
	"useCallback":          {},
	"useEffect":            {},
	"useSyncExternalStore": {},
}

func isEffectFile(ctx rule.RuleContext) bool {
	text := ctx.SourceFile.Text()
	return strings.Contains(text, "\"effect\"") ||
		strings.Contains(text, "'effect'") ||
		strings.Contains(text, "\"effect/") ||
		strings.Contains(text, "'effect/") ||
		strings.Contains(text, "\"@effect-atom/atom-react\"") ||
		strings.Contains(text, "'@effect-atom/atom-react'")
}

func reportRule(ctx rule.RuleContext, node *ast.Node, id string, description string) {
	ctx.ReportNode(node, rule.RuleMessage{
		Id:          id,
		Description: description,
	})
}

func isIdentifierNamed(node *ast.Node, name string) bool {
	return node != nil && ast.IsIdentifier(node) && node.Text() == name
}

func isPropertyAccess(node *ast.Node, objectName string, propertyName string) bool {
	return node != nil &&
		ast.IsPropertyAccessExpression(node) &&
		isIdentifierNamed(node.AsPropertyAccessExpression().Expression, objectName) &&
		node.AsPropertyAccessExpression().Name().Text() == propertyName
}

func isPropertyAccessOnObject(node *ast.Node, objectName string) bool {
	return node != nil &&
		ast.IsPropertyAccessExpression(node) &&
		isIdentifierNamed(node.AsPropertyAccessExpression().Expression, objectName)
}

func isMemberCall(node *ast.Node, objectName string, propertyName string) bool {
	return node != nil &&
		ast.IsCallExpression(node) &&
		isPropertyAccess(node.AsCallExpression().Expression, objectName, propertyName)
}

func isMemberCallOnObject(node *ast.Node, objectName string) bool {
	return node != nil &&
		ast.IsCallExpression(node) &&
		isPropertyAccessOnObject(node.AsCallExpression().Expression, objectName)
}

func firstCallArgument(node *ast.Node) *ast.Node {
	if !ast.IsCallExpression(node) {
		return nil
	}
	args := node.AsCallExpression().Arguments
	if args == nil || len(args.Nodes) == 0 {
		return nil
	}
	return args.Nodes[0]
}

func hasMemberCallArgumentOnObject(node *ast.Node, objectName string) bool {
	if !ast.IsCallExpression(node) {
		return false
	}
	args := node.AsCallExpression().Arguments
	if args == nil {
		return false
	}
	for _, arg := range args.Nodes {
		if isMemberCallOnObject(arg, objectName) {
			return true
		}
	}
	return false
}

func firstArgumentIsGeneratorFunction(node *ast.Node) bool {
	arg := firstCallArgument(node)
	return arg != nil && ast.IsFunctionExpression(arg) && arg.AsFunctionExpression().AsteriskToken != nil
}

func isConstVariableDeclaration(node *ast.Node) bool {
	return ast.IsVariableDeclaration(node) &&
		ast.IsVariableDeclarationList(node.Parent) &&
		node.Parent.Flags&ast.NodeFlagsConst != 0
}

func nodeText(node *ast.Node) string {
	if node == nil {
		return ""
	}
	return scanner.GetTextOfNode(node)
}

func textMatches(node *ast.Node, pattern string) bool {
	matched, err := regexp.MatchString(pattern, nodeText(node))
	return err == nil && matched
}

func sourceTextMatches(ctx rule.RuleContext, pattern string) bool {
	matched, err := regexp.MatchString(pattern, ctx.SourceFile.Text())
	return err == nil && matched
}

func stringsContainsNodeText(node *ast.Node, needle string) bool {
	return strings.Contains(nodeText(node), needle)
}

func unwrapParens(node *ast.Node) *ast.Node {
	for node != nil && ast.IsParenthesizedExpression(node) {
		node = node.AsParenthesizedExpression().Expression
	}
	return node
}

func firstDescendant(node *ast.Node, predicate func(*ast.Node) bool) *ast.Node {
	if node == nil {
		return nil
	}

	var visit func(*ast.Node) *ast.Node
	visit = func(current *ast.Node) *ast.Node {
		if current == nil {
			return nil
		}
		if predicate(current) {
			return current
		}
		var result *ast.Node
		current.ForEachChild(func(child *ast.Node) bool {
			result = visit(child)
			return result != nil
		})
		return result
	}

	var result *ast.Node
	node.ForEachChild(func(child *ast.Node) bool {
		result = visit(child)
		return result != nil
	})
	return result
}

func anyDescendant(node *ast.Node, predicate func(*ast.Node) bool) bool {
	return firstDescendant(node, predicate) != nil
}

func topLevelReturnExpression(block *ast.Node) *ast.Node {
	block = unwrapParens(block)
	if block == nil || !ast.IsBlock(block) || block.AsBlock().Statements == nil {
		return nil
	}
	for _, stmt := range block.AsBlock().Statements.Nodes {
		if ast.IsReturnStatement(stmt) {
			return stmt.AsReturnStatement().Expression
		}
	}
	return nil
}

func hasAncestor(node *ast.Node, predicate func(*ast.Node) bool) bool {
	for parent := node.Parent; parent != nil; parent = parent.Parent {
		if predicate(parent) {
			return true
		}
	}
	return false
}

func lastCallArgument(node *ast.Node) *ast.Node {
	if !ast.IsCallExpression(node) {
		return nil
	}
	args := node.AsCallExpression().Arguments
	if args == nil || len(args.Nodes) == 0 {
		return nil
	}
	return args.Nodes[len(args.Nodes)-1]
}

func isEffectCall(node *ast.Node) bool {
	return isMemberCallOnObject(unwrapParens(node), "Effect")
}

func isDisallowedEffectSucceedArgument(node *ast.Node) bool {
	if node == nil {
		return true
	}
	return node.Kind == ast.KindObjectLiteralExpression ||
		node.Kind == ast.KindArrayLiteralExpression ||
		node.Kind == ast.KindCallExpression ||
		node.Kind == ast.KindConditionalExpression
}

func isInlineFunctionCallee(node *ast.Node) bool {
	if !ast.IsCallExpression(node) {
		return false
	}
	callee := unwrapParens(node.AsCallExpression().Expression)
	if ast.IsArrowFunction(callee) {
		return true
	}
	return ast.IsFunctionLike(callee) && strings.HasPrefix(strings.TrimSpace(nodeText(callee)), "function")
}

func isPipeCall(node *ast.Node) bool {
	if node == nil || !ast.IsCallExpression(node) {
		return false
	}
	callee := unwrapParens(node.AsCallExpression().Expression)
	if ast.IsIdentifier(callee) {
		return callee.Text() == "pipe"
	}
	return ast.IsPropertyAccessExpression(callee) && callee.AsPropertyAccessExpression().Name().Text() == "pipe"
}

func isMethodPipeCall(node *ast.Node) bool {
	if node == nil || !ast.IsCallExpression(node) {
		return false
	}
	callee := unwrapParens(node.AsCallExpression().Expression)
	return ast.IsPropertyAccessExpression(callee) && callee.AsPropertyAccessExpression().Name().Text() == "pipe"
}

func isConsoleCall(node *ast.Node) bool {
	if !ast.IsCallExpression(node) {
		return false
	}
	callee := unwrapParens(node.AsCallExpression().Expression)
	return ast.IsPropertyAccessExpression(callee) &&
		isIdentifierNamed(callee.AsPropertyAccessExpression().Expression, "console")
}

func isEffectSyncSideEffectWrapper(node *ast.Node) bool {
	if !isMemberCall(node, "Effect", "sync") {
		return false
	}
	arg := firstCallArgument(node)
	if arg == nil || !ast.IsArrowFunction(arg) {
		return false
	}
	body := arg.AsArrowFunction().Body
	return body != nil && ast.IsCallExpression(body) && !isConsoleCall(body)
}

func nestedArrowIife(node *ast.Node) *ast.Node {
	if !ast.IsCallExpression(node) {
		return nil
	}
	callee := unwrapParens(node.AsCallExpression().Expression)
	if !ast.IsArrowFunction(callee) {
		return nil
	}
	body := callee.AsArrowFunction().Body
	if ast.IsCallExpression(body) && ast.IsArrowFunction(unwrapParens(body.AsCallExpression().Expression)) {
		return body
	}
	return firstDescendant(body, func(child *ast.Node) bool {
		if !ast.IsCallExpression(child) {
			return false
		}
		return ast.IsArrowFunction(unwrapParens(child.AsCallExpression().Expression))
	})
}

func hasDeepEffectCall(node *ast.Node) bool {
	node = unwrapParens(node)
	if !isEffectCall(node) {
		return false
	}
	inner := unwrapParens(firstCallArgument(node))
	if !isEffectCall(inner) {
		return false
	}
	return isEffectCall(unwrapParens(firstCallArgument(inner)))
}

func containsSideEffectWrapperContent(node *ast.Node) bool {
	return textMatches(node, `\b(?:setState|invalidate)\s*\(`) ||
		textMatches(node, `\bAtom\.set\s*\(`) ||
		textMatches(node, `\bEffect\.log[\w$]*\s*\(`) ||
		textMatches(node, `\bconsole\.[A-Za-z_$][\w$]*\s*\(`)
}

func isEffectSideEffectWrapper(node *ast.Node) bool {
	if !isMemberCall(node, "Effect", "as") && !isMemberCall(node, "Effect", "zipRight") {
		return false
	}
	return containsSideEffectWrapperContent(unwrapParens(firstCallArgument(node)))
}

func isPipeCallWithEffectSource(node *ast.Node) bool {
	node = unwrapParens(node)
	if !isPipeCall(node) {
		return false
	}
	return isEffectCall(unwrapParens(firstCallArgument(node)))
}

func returnsEffectWrapperAlias(body *ast.Node) bool {
	body = unwrapParens(body)
	if body == nil {
		return false
	}
	if isPipeCallWithEffectSource(body) || isEffectCall(body) {
		return true
	}
	returnExpr := unwrapParens(topLevelReturnExpression(body))
	return isPipeCallWithEffectSource(returnExpr) || isEffectCall(returnExpr)
}

func isEffectWrapperAliasVariable(node *ast.Node) bool {
	if !isConstVariableDeclaration(node) {
		return false
	}
	init := unwrapParens(node.AsVariableDeclaration().Initializer)
	if init == nil {
		return false
	}
	if isPipeCallWithEffectSource(init) {
		return true
	}
	return ast.IsArrowFunction(init) && returnsEffectWrapperAlias(init.AsArrowFunction().Body)
}

func isEffectWrapperAliasFunction(node *ast.Node) bool {
	return ast.IsFunctionDeclaration(node) &&
		node.AsFunctionDeclaration().Body != nil &&
		returnsEffectWrapperAlias(node.AsFunctionDeclaration().Body)
}

func isInlineRuntimeProvideCall(node *ast.Node) bool {
	if !isMemberCall(node, "Effect", "provide") {
		return false
	}
	args := node.AsCallExpression().Arguments
	if args == nil || len(args.Nodes) != 1 {
		return false
	}
	return hasAncestor(node, func(parent *ast.Node) bool {
		return ast.IsYieldExpression(parent) && parent.AsYieldExpression().AsteriskToken != nil
	}) && hasAncestor(node, isMethodPipeCall)
}

func callbackBody(node *ast.Node) *ast.Node {
	node = unwrapParens(node)
	switch {
	case ast.IsArrowFunction(node):
		return node.AsArrowFunction().Body
	case ast.IsFunctionExpression(node):
		return node.AsFunctionExpression().Body
	default:
		return nil
	}
}

func containsBranchSequencing(node *ast.Node) bool {
	return textMatches(node, `\bEffect\.(?:flatMap|map|andThen|tap|zipRight)\s*\(`) ||
		textMatches(node, `(?:^|[^A-Za-z0-9_$])pipe\s*\(`) ||
		textMatches(node, `\.pipe\s*\(`) ||
		textMatches(node, `\bStream\.[A-Za-z_$][\w$]*\s*\(`)
}

func isMatchEffectBranchCall(node *ast.Node) bool {
	node = unwrapParens(node)
	if isMethodPipeCall(node) {
		callee := unwrapParens(node.AsCallExpression().Expression)
		if ast.IsPropertyAccessExpression(callee) &&
			isMemberCall(unwrapParens(callee.AsPropertyAccessExpression().Expression), "Match", "value") {
			args := node.AsCallExpression().Arguments
			if args == nil {
				return false
			}
			for _, arg := range args.Nodes {
				branch := unwrapParens(arg)
				if !isMemberCall(branch, "Match", "when") && !isMemberCall(branch, "Match", "orElse") {
					continue
				}
				body := callbackBody(lastCallArgument(branch))
				if body != nil && containsBranchSequencing(body) {
					return true
				}
			}
		}
	}

	if isMemberCall(node, "Option", "match") {
		args := node.AsCallExpression().Arguments
		if args == nil || len(args.Nodes) < 2 {
			return false
		}
		return anyDescendant(args.Nodes[1], func(child *ast.Node) bool {
			body := callbackBody(child)
			return body != nil && containsBranchSequencing(body)
		})
	}

	return false
}

func isSchemaFilterCall(node *ast.Node) bool {
	return isMemberCall(node, "S", "filter") || isMemberCall(node, "Schema", "filter")
}

func firstReturnInArrowCallbackArgs(node *ast.Node) *ast.Node {
	if !ast.IsCallExpression(node) || isSchemaFilterCall(node) {
		return nil
	}
	args := node.AsCallExpression().Arguments
	if args == nil {
		return nil
	}
	for _, arg := range args.Nodes {
		callback := unwrapParens(arg)
		if !ast.IsArrowFunction(callback) {
			continue
		}
		body := callback.AsArrowFunction().Body
		if ast.IsBlock(body) {
			if ret := firstDescendant(body, ast.IsReturnStatement); ret != nil {
				return ret
			}
		}
	}
	return nil
}

func firstReturnInFunctionCallbackArgs(node *ast.Node) *ast.Node {
	if !ast.IsCallExpression(node) {
		return nil
	}
	args := node.AsCallExpression().Arguments
	if args == nil {
		return nil
	}
	for _, arg := range args.Nodes {
		callback := unwrapParens(arg)
		if !ast.IsFunctionExpression(callback) || callback.AsFunctionExpression().Body == nil {
			continue
		}
		if ret := firstDescendant(callback.AsFunctionExpression().Body, ast.IsReturnStatement); ret != nil {
			return ret
		}
	}
	return nil
}

func isTypeofBooleanCheck(node *ast.Node) bool {
	if !ast.IsBinaryExpression(node) {
		return false
	}
	return ast.IsTypeOfExpression(unwrapParens(node.AsBinaryExpression().Left)) &&
		nodeText(node.AsBinaryExpression().OperatorToken) == "===" &&
		(nodeText(unwrapParens(node.AsBinaryExpression().Right)) == `"boolean"` ||
			nodeText(unwrapParens(node.AsBinaryExpression().Right)) == `'boolean'`)
}

func hasNestedPipeArgument(node *ast.Node) bool {
	if !ast.IsCallExpression(node) {
		return false
	}
	args := node.AsCallExpression().Arguments
	if args == nil {
		return false
	}
	for _, arg := range args.Nodes {
		if textMatches(arg, `\bpipe\s*\(|\.pipe\s*\(`) {
			return true
		}
	}
	return false
}

func isReactHookCall(node *ast.Node) bool {
	if !ast.IsCallExpression(node) {
		return false
	}

	callee := node.AsCallExpression().Expression
	if ast.IsIdentifier(callee) {
		_, ok := reactHookNames[callee.Text()]
		return ok
	}

	if ast.IsPropertyAccessExpression(callee) {
		_, ok := reactHookNames[callee.AsPropertyAccessExpression().Name().Text()]
		return ok
	}

	return false
}
