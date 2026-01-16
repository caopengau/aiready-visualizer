###############################################################################
# Makefile.shared: Common macros, variables, and environment config for all spokes
###############################################################################

# Dynamically discover all packages in packages/ directory
ALL_SPOKES := $(notdir $(wildcard packages/*))
# Smart release order: core first, cli last, others alphabetical
RELEASE_ORDER := core $(filter-out core cli, $(sort $(ALL_SPOKES))) cli
# Legacy static list (deprecated - use ALL_SPOKES)
PACKAGES := core pattern-detect
.ONESHELL:

# AWS Configuration
# Override with: export AWS_PROFILE=your-profile
AWS_PROFILE ?= aiready
AWS_REGION ?= ap-southeast-2
# Notifications (defaults for solo founder)
SES_TO_EMAIL ?= caopengau@gmail.com
SLACK_WEBHOOK_URL ?=

# Color definitions
RED        := $(shell printf '\033[0;31m')    # color: #FF0000
GREEN      := $(shell printf '\033[0;32m')    # color: #00FF00
YELLOW     := $(shell printf '\033[0;33m')    # color: #FFFF00
BLUE       := $(shell printf '\033[0;34m')    # color: #0000FF
LIGHTBLUE  := $(shell printf '\033[1;34m')    # color: #1E90FF
CYAN       := $(shell printf '\033[0;36m')    # color: #00FFFF
MAGENTA    := $(shell printf '\033[0;35m')    # color: #FF00FF
WHITE      := $(shell printf '\033[0;37m')    # color: #FFFFFF
NC         := $(shell printf '\033[0m')       # alias for RESET_COLOR (no color)

BOLD       := $(shell printf '\033[1m')       # style: bold
UNDERLINE  := $(shell printf '\033[4m')       # style: underline

# Background colors
BG_RED     := $(shell printf '\033[41m')      # bg: #FF0000
BG_GREEN   := $(shell printf '\033[42m')      # bg: #00FF00
BG_YELLOW  := $(shell printf '\033[43m')      # bg: #FFFF00
BG_BLUE    := $(shell printf '\033[44m')      # bg: #0000FF

RESET_COLOR         := $(shell printf '\033[0m')    # reset (same as NC)
# Literal backslash-escaped clear sequence. Expand at runtime with printf '%b'.
INDENT_CLEAR       := \r\033[K

# Logging macros
# Usage: $(call log_info,Message)
define log_info
	printf '$(INDENT_CLEAR)[INFO] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_success
	printf '$(GREEN)$(INDENT_CLEAR)[SUCCESS] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_warning
	printf '$(YELLOW)$(INDENT_CLEAR)[WARNING] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_error
	printf '$(RED)$(INDENT_CLEAR)[ERROR] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_step
	printf '$(LIGHTBLUE)$(INDENT_CLEAR)[STEP] %s$(RESET_COLOR)\n' "$(1)"
endef

define log_debug
	printf '$(MAGENTA)$(INDENT_CLEAR)[DEBUG] %s$(RESET_COLOR)\n' "$(1)"
endef

# separator: print separator line with optional color
# Usage: $(call separator,COLOR)
define separator
	printf '%s$(BOLD)$(INDENT_CLEAR)============================================$(RESET_COLOR)\n' "$(1)"
endef

# Controlled parallelism: detect CPU count and only pass -j to sub-makes
# when the parent make was not already started with -j (avoids jobserver warnings).
PARALLELISM ?= $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
ifneq ($(filter -j% -j,$(MAKEFLAGS)),)
	MAKE_PARALLEL :=
else
	MAKE_PARALLEL := -j$(PARALLELISM)
endif

# Default pnpm silent flag (can be overridden by caller)
SILENT_PNPM ?= --silent

# Purpose: Time the execution of a target command
# Usage: $(call track_time,command,label)
define track_time
	start=$$(date +%s); \
	eval $(1); \
	status=$$?; \
	end=$$(date +%s); \
	elapsed=$$((end - start)); \
	if [ $$status -eq 0 ]; then \
		printf '$(GREEN)\r\033[K✅ %s completed in %ss$(RESET_COLOR)\n' "$(2)" "$$elapsed"; \
	else \
		printf '$(RED)\r\033[K❌ %s failed after %ss$(RESET_COLOR)\n' "$(2)" "$$elapsed"; \
	fi; \
	exit $$status
endef

# Usage: $(call is_ci_environment)
define is_ci_environment
	$(shell [ -n "$$CI" ] || [ -n "$$GITHUB_ACTIONS" ] || [ -n "$$GITLAB_CI" ] || [ -n "$$CIRCLECI" ] || [ -n "$$JENKINS_URL" ] && echo "true" || echo "false")
endef

# Default silent targets for multi-line recipes that produce controlled output
.SILENT: test test-core test-pattern-detect
