package linteffect

import (
	"os"
	"strings"
	"testing"

	"github.com/typescript-eslint/tsgolint/internal/rule"
	"github.com/typescript-eslint/tsgolint/internal/rule_tester"
	"github.com/typescript-eslint/tsgolint/internal/rules/fixtures"
)

func TestMain(m *testing.M) {
	_ = os.Setenv("TSGOLINT_SNAPSHOT_CWD", "true")
	os.Exit(m.Run())
}

func runLintEffectRuleTester(
	t *testing.T,
	testedRule *rule.Rule,
	valid []rule_tester.ValidTestCase,
	invalid []rule_tester.InvalidTestCase,
) {
	t.Helper()
	t.Parallel()
	rule_tester.RunRuleTester(
		fixtures.GetRootDir(),
		"tsconfig.minimal.json",
		t,
		testedRule,
		valid,
		invalid,
	)
}

func validCase(code string) rule_tester.ValidTestCase {
	return rule_tester.ValidTestCase{Code: code}
}

func invalidCase(code string, messageID string) rule_tester.InvalidTestCase {
	return rule_tester.InvalidTestCase{
		Code: code,
		Errors: []rule_tester.InvalidTestCaseError{
			{MessageId: messageID},
		},
	}
}

func invalidRuleCase(code string, ruleName string) rule_tester.InvalidTestCase {
	return invalidCase(code, toRuleMessageID(ruleName))
}

func toRuleMessageID(ruleName string) string {
	parts := strings.Split(ruleName, "-")
	for i, part := range parts {
		if i == 0 || part == "" {
			continue
		}
		parts[i] = strings.ToUpper(part[:1]) + part[1:]
	}
	return strings.Join(parts, "")
}
