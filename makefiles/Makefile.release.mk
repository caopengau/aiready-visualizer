###############################################################################
# Makefile.release: One-command release orchestrator
#
# Automates per-spoke release steps:
# - Version bump (patch/minor/major)
# - Commit package.json change
# - Create annotated git tag
# - Build + publish to npm (pnpm)
# - Sync GitHub spoke repo via subtree split
# - Push monorepo branch and tags
#
# Usage examples:
#   make release-one SPOKE=pattern-detect TYPE=minor [OTP=123456]
#   make release-one SPOKE=core TYPE=patch [OTP=123456]
#   make release-all TYPE=minor [OTP=123456]
#   make release-status
#
# Notes:
# - Always uses pnpm for publish to resolve workspace:* dependencies
# - Tags use the form: <spoke>-v<version> (e.g., pattern-detect-v0.3.0)
# - Requires npm login for publish; uses optional OTP if 2FA enabled
###############################################################################

# Resolve this makefile's directory to allow absolute invocation
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
ROOT_DIR := $(abspath $(MAKEFILE_DIR)/..)
include $(MAKEFILE_DIR)/Makefile.shared.mk
include $(MAKEFILE_DIR)/Makefile.publish.mk

.PHONY: check-changes check-dependency-updates check-dependency-updates release-one release-all release-status help

# Default owner and branch (can be overridden)
OWNER ?= caopengau
TARGET_BRANCH ?= main

# Internal helper: resolve version bump target name from TYPE
define bump_target_for_type
$(if $(filter $(1),patch),version-patch,$(if $(filter $(1),minor),version-minor,$(if $(filter $(1),major),version-major,)))
endef

# Internal: commit + tag for a spoke after version bump
define commit_and_tag
	version=$$(node -p "require('$(ROOT_DIR)/packages/$(SPOKE)/package.json').version"); \
	$(call log_step,Committing @aiready/$(SPOKE) v$$version...); \
	cd $(ROOT_DIR) && git add packages/$(SPOKE)/package.json; \
	cd $(ROOT_DIR) && git commit -m "chore(release): @aiready/$(SPOKE) v$$version"; \
	tag_name="$(SPOKE)-v$$version"; \
	$(call log_step,Tagging $$tag_name...); \
	cd $(ROOT_DIR) && git tag -a "$$tag_name" -m "Release @aiready/$(SPOKE) v$$version"; \
	$(call log_success,Committed and tagged $$tag_name)
endef

# Check if a spoke has changes since its last release tag
check-changes: ## Check if SPOKE has changes since last release tag (returns: has_changes/no_changes)
	$(call require_spoke)
	@last_tag=$$(git for-each-ref 'refs/tags/$(SPOKE)-v*' --sort=-creatordate --format '%(refname:short)' | head -n1); \
	if [ -z "$$last_tag" ]; then \
		$(call log_info,No previous release tag found for @aiready/$(SPOKE)); \
		echo "has_changes"; \
		exit 0; \
	fi; \
	$(call log_step,Checking changes in packages/$(SPOKE) since $$last_tag...); \
	if git diff --quiet "$$last_tag" -- packages/$(SPOKE); then \
		$(call log_info,No code changes detected in packages/$(SPOKE) since $$last_tag); \
		$(call log_step,Checking for outdated dependencies...); \
		if $(MAKE) -s check-dependency-updates SPOKE=$(SPOKE) | grep -q "has_outdated_deps"; then \
			$(call log_info,Outdated dependencies detected, changes needed); \
			echo "has_changes"; \
			exit 0; \
		else \
			$(call log_info,No changes detected in packages/$(SPOKE) since $$last_tag); \
			echo "no_changes"; \
			exit 1; \
		fi; \
	else \
		$(call log_info,Code changes detected in packages/$(SPOKE) since $$last_tag); \
		echo "has_changes"; \
		exit 0; \
	fi

# Check if a spoke's published dependencies are outdated
check-dependency-updates: ## Check if SPOKE's published dependencies have newer versions
	$(call require_spoke)
	@./makefiles/scripts/check-dependency-updates.sh $(SPOKE)

# Release a single spoke end-to-end
release-one: ## Release one spoke: TYPE=patch|minor|major, SPOKE=core|pattern-detect [OTP=123456]
	$(call require_spoke)
	@if [ -z "$(TYPE)" ]; then \
		$(call log_error,TYPE parameter required. Usage: make $@ SPOKE=pattern-detect TYPE=minor); \
		exit 1; \
	fi
	@# Skip if no changes since last tag unless FORCE=1
	@if [ "$(FORCE)" != "1" ]; then \
		if ! $(MAKE) -s check-changes SPOKE=$(SPOKE) >/dev/null 2>&1; then \
			$(call log_success,Skipping release for @aiready/$(SPOKE)); \
			exit 0; \
		fi; \
	fi; \
	bump_target="$(call bump_target_for_type,$(TYPE))"; \
	if [ -z "$$bump_target" ]; then \
		$(call log_error,Invalid TYPE '$(TYPE)'. Expected patch|minor|major); \
		exit 1; \
	fi; \
	$(call log_step,Bumping version for @aiready/$(SPOKE) ($(TYPE))...); \
	$(MAKE) -C $(ROOT_DIR) $$bump_target SPOKE=$(SPOKE); \
	$(call log_success,Version bump complete for @aiready/$(SPOKE)); \
	$(call commit_and_tag); \
	$(call log_step,Building workspace...); \
	$(MAKE) -C $(ROOT_DIR) build; \
	$(call log_success,Build complete); \
	$(call log_step,Publishing @aiready/$(SPOKE) to npm...); \
	if ! $(MAKE) -C $(ROOT_DIR) npm-publish SPOKE=$(SPOKE) OTP=$(OTP); then \
		$(call log_error,NPM publish failed for @aiready/$(SPOKE). Aborting release.); \
		exit 1; \
	fi; \
	$(call log_step,Syncing GitHub spoke for @aiready/$(SPOKE)...); \
	$(MAKE) -C $(ROOT_DIR) publish SPOKE=$(SPOKE) OWNER=$(OWNER); \
	$(call log_step,Pushing monorepo branch and tags...); \
	cd $(ROOT_DIR) && git push origin $(TARGET_BRANCH) --follow-tags; \
	$(call log_success,Release finished for @aiready/$(SPOKE))

# Release all spokes with the same bump type
release-all: ## Release all spokes: TYPE=patch|minor|major [OTP=123456] [FORCE=1]
	@if [ -z "$(TYPE)" ]; then \
		$(call log_error,TYPE parameter required. Example: make $@ TYPE=minor); \
		exit 1; \
	fi
	@for spoke in $(RELEASE_ORDER); do \
		$(call log_info,Releasing @aiready/$$spoke ($(TYPE))); \
		$(MAKE) -f $(MAKEFILE_DIR)/Makefile.release.mk release-one SPOKE=$$spoke TYPE=$(TYPE) OTP=$(OTP) FORCE=$(FORCE) || exit 1; \
	done
	@$(call log_success,All spokes released)

# Status overview: local vs published versions
release-status: ## Show local and npm registry versions for all spokes
	@$(call log_step,Reading local and npm registry versions...)
	@echo ""; \
	printf "%-30s %-15s %-15s %-10s\n" "Package" "Local" "npm" "Status"; \
	printf "%-30s %-15s %-15s %-10s\n" "-------" "-----" "---" "------"; \
	for spoke in $(ALL_SPOKES); do \
		if [ -f "$(ROOT_DIR)/packages/$$spoke/package.json" ]; then \
			local_ver=$$(node -p "require('$(ROOT_DIR)/packages/$$spoke/package.json').version" 2>/dev/null || echo "n/a"); \
			npm_ver=$$(npm view @aiready/$$spoke version 2>/dev/null || echo "n/a"); \
			if [ "$$local_ver" = "$$npm_ver" ]; then \
				status="$(GREEN)✓$(RESET_COLOR)"; \
			elif [ "$$npm_ver" = "n/a" ]; then \
				status="$(YELLOW)new$(RESET_COLOR)"; \
			else \
				status="$(CYAN)ahead$(RESET_COLOR)"; \
			fi; \
			printf "%-30s %-15s %-15s %-10b\n" "@aiready/$$spoke" "$$local_ver" "$$npm_ver" "$$status"; \
		fi; \
	done; \
	echo ""; \
	$(call log_success,Status collected)

release-help: ## Show release help
	@echo "Available targets:"; \
	echo "  check-changes            - Check if SPOKE has changes since last release"; \
	echo "  check-dependency-updates - Check if SPOKE has outdated dependencies"; \
	echo "  release-one              - Release one spoke (TYPE, SPOKE, [OTP], [FORCE])"; \
	echo "  release-all              - Release all spokes (TYPE, [OTP], [FORCE])"; \
	echo "  release-status           - Show local vs npm versions"; \
	echo ""; \
	echo "Examples:"; \
	echo "  make check-changes SPOKE=cli"; \
	echo "  make check-dependency-updates SPOKE=cli"; \
	echo "  make release-one SPOKE=pattern-detect TYPE=minor"; \
	echo "  make release-all TYPE=minor"; \
	echo "  make release-status";
