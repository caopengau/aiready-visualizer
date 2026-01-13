###############################################################################
# Makefile.publish: Publishing spokes to GitHub and npm
#
# IMPORTANT: Always use 'pnpm publish' (not 'npm publish')
# - workspace:* protocol in package.json is pnpm-specific
# - pnpm publish auto-converts workspace:* to actual versions
# - npm publish fails with EUNSUPPORTEDPROTOCOL error
# See .github/copilot-instructions.md for details
###############################################################################
# Resolve this makefile's directory to allow absolute invocation
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(MAKEFILE_DIR)/Makefile.shared.mk
REPO_ROOT := $(abspath $(MAKEFILE_DIR)/..)

.PHONY: publish npm-publish npm-login npm-check npm-publish-all \
	version-patch version-minor version-major \
        publish-core publish-pattern-detect npm-publish-core npm-publish-pattern-detect \
        pull sync-from-spoke push-all deploy push

# Default owner for GitHub repos
OWNER ?= caopengau
# Default branch name to push to
TARGET_BRANCH ?= main

# Validate SPOKE parameter is provided
define require_spoke
	@if [ -z "$(SPOKE)" ]; then \
		$(call log_error,SPOKE parameter required. Usage: make $@ SPOKE=pattern-detect); \
		exit 1; \
	fi; \
	if [ ! -d "$(REPO_ROOT)/packages/$(SPOKE)" ]; then \
		$(call log_error,Package packages/$(SPOKE) not found); \
		exit 1; \
	fi
endef

npm-check: ## Check npm login status
	@$(call log_step,Checking npm authentication...)
	@npm whoami >/dev/null 2>&1 || { \
		$(call log_error,Not logged into npm. Run: make npm-login); \
		read -p "Would you like to login now? (y/N): " response; \
		case $$response in \
			[Yy]|[Yy][Ee][Ss]) \
				$(MAKE) npm-login && $(call log_success,Logged into npm as $$(npm whoami)) ;; \
			*) \
				$(call log_error,NPM login required for publishing. Run 'make npm-login' manually.); \
				exit 1 ;; \
		esac; \
	}
	@$(call log_success,Logged into npm as $$(npm whoami))

npm-login: ## Login to npm registry
	@$(call log_step,Logging into npm...)
	@npm login

# Generic version bumping (requires SPOKE parameter)
version-patch: ## Bump spoke patch version (0.1.0 -> 0.1.1). Usage: make version-patch SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) patch version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version patch --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-minor: ## Bump spoke minor version (0.1.0 -> 0.2.0). Usage: make version-minor SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) minor version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version minor --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-major: ## Bump spoke major version (0.1.0 -> 1.0.0). Usage: make version-major SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) major version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version major --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

# Generic npm publish (requires SPOKE parameter)
npm-publish: npm-check ## Publish spoke to npm. Usage: make npm-publish SPOKE=pattern-detect [OTP=123456]
	$(call require_spoke)
	@$(call log_step,Publishing @aiready/$(SPOKE) to npm...)
	@# CRITICAL: Use pnpm publish (not npm) to resolve workspace:* dependencies
	@OTP_FLAG=""; [ -n "$(OTP)" ] && OTP_FLAG="--otp $(OTP)"; \
	cd packages/$(SPOKE) && pnpm publish --access public --no-git-checks $$OTP_FLAG
	@$(call log_success,Published @aiready/$(SPOKE) to npm)

# Generic GitHub publish (requires SPOKE parameter)
publish: ## Publish spoke to GitHub. Usage: make publish SPOKE=pattern-detect [OWNER=username]
	$(call require_spoke)
	@$(call log_step,Publishing @aiready/$(SPOKE) to GitHub...)
	@url="https://github.com/$(OWNER)/aiready-$(SPOKE).git"; \
	remote="aiready-$(SPOKE)"; \
	branch="publish-$(SPOKE)"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Remote set: $$remote -> $$url); \
	git branch -D "$$branch" >/dev/null 2>&1 || true; \
	git subtree split --prefix=packages/$(SPOKE) -b "$$branch" >/dev/null; \
	$(call log_info,Subtree split complete: $$branch); \
	split_commit=$$(git rev-parse "$$branch"); \
	git push -f "$$remote" "$$branch":$(TARGET_BRANCH); \
	$(call log_success,Synced @aiready/$(SPOKE) to GitHub spoke repo ($(TARGET_BRANCH))); \
	version=$$(node -p "require('./packages/$(SPOKE)/package.json').version"); \
	spoke_tag="v$$version"; \
	$(call log_step,Tagging spoke repo commit $$split_commit as $$spoke_tag...); \
	if git ls-remote --tags "$$remote" "$$spoke_tag" | grep -q "$$spoke_tag"; then \
		$(call log_info,Spoke tag $$spoke_tag already exists on $$remote; skipping); \
	else \
		git tag -a "$$spoke_tag" "$$split_commit" -m "Release @aiready/$(SPOKE) $$version"; \
		git push "$$remote" "$$spoke_tag"; \
		$(call log_success,Spoke tag pushed: $$spoke_tag); \
	fi

# Convenience aliases for specific spokes
publish-core: ## Publish @aiready/core to GitHub (shortcut for: make publish SPOKE=core)
	@$(MAKE) publish SPOKE=core OWNER=$(OWNER)

publish-pattern-detect: ## Publish @aiready/pattern-detect to GitHub (shortcut for: make publish SPOKE=pattern-detect)
	@$(MAKE) publish SPOKE=pattern-detect OWNER=$(OWNER)

publish-context-analyzer: ## Publish @aiready/context-analyzer to GitHub (shortcut for: make publish SPOKE=context-analyzer)
	@$(MAKE) publish SPOKE=context-analyzer OWNER=$(OWNER)

publish-cli: ## Publish @aiready/cli to GitHub (shortcut for: make publish SPOKE=cli)
	@$(MAKE) publish SPOKE=cli OWNER=$(OWNER)

npm-publish-core: ## Publish @aiready/core to npm (shortcut for: make npm-publish SPOKE=core)
	@$(MAKE) npm-publish SPOKE=core OTP=$(OTP)

npm-publish-pattern-detect: ## Publish @aiready/pattern-detect to npm (shortcut for: make npm-publish SPOKE=pattern-detect)
	@$(MAKE) npm-publish SPOKE=pattern-detect OTP=$(OTP)

npm-publish-context-analyzer: ## Publish @aiready/context-analyzer to npm (shortcut for: make npm-publish SPOKE=context-analyzer)
	@$(MAKE) npm-publish SPOKE=context-analyzer OTP=$(OTP)

npm-publish-cli: ## Publish @aiready/cli to npm (shortcut for: make npm-publish SPOKE=cli)
	@$(MAKE) npm-publish SPOKE=cli OTP=$(OTP)

npm-publish-all: build npm-publish-core npm-publish-pattern-detect npm-publish-context-analyzer npm-publish-cli

# Sync changes from spoke repos back to monorepo (for external contributions)
sync-from-spoke: ## Sync changes from spoke repo back to monorepo. Usage: make sync-from-spoke SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Syncing changes from aiready-$(SPOKE) back to monorepo...)
	@url="https://github.com/$(OWNER)/aiready-$(SPOKE).git"; \
	remote="aiready-$(SPOKE)"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Fetching latest from $$remote...); \
	git fetch "$$remote" $(TARGET_BRANCH); \
	$(call log_info,Pulling changes into packages/$(SPOKE)...); \
	git subtree pull --prefix=packages/$(SPOKE) "$$remote" $(TARGET_BRANCH) --squash -m "chore: sync $(SPOKE) from public repo"; \
	$(call log_success,Synced changes from aiready-$(SPOKE))

pull: ## Alias for sync-from-spoke. Usage: make pull SPOKE=pattern-detect
	@$(MAKE) sync-from-spoke SPOKE=$(SPOKE)

# alias for push-all
push: push-all ## Alias for push-all
sync: push-all ## Alias for push-all (sync monorepo + all spoke repos)

# Push to monorepo and all spoke repos
push-all: ## Push monorepo to origin and sync all spokes to their public repos
	@$(call log_step,Pushing to monorepo...)
	@git push origin $(TARGET_BRANCH)
	@$(call log_success,Pushed to monorepo)
	@$(call log_step,Syncing all spoke repositories...)
	@for spoke in $(ALL_SPOKES); do \
		if [ -f "$(REPO_ROOT)/packages/$$spoke/package.json" ]; then \
			$(call log_info,Syncing $$spoke...); \
			$(MAKE) publish SPOKE=$$spoke OWNER=$(OWNER) 2>&1 | grep -E '(SUCCESS|ERROR)' || true; \
		fi; \
	done
	@$(call log_success,All spokes synced to GitHub)

deploy: push-all ## Alias for push-all (push monorepo + publish all spokes)
	@:-pattern-detect ## Build and publish all packages to npm
	@$(call log_success,All packages published to npm)
