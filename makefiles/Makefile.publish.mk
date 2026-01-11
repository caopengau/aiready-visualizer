###############################################################################
# Makefile.publish: Publishing spokes to GitHub and npm
###############################################################################
include makefiles/Makefile.shared.mk

.PHONY: publish npm-publish npm-login npm-check npm-publish-all \
        version-patch version-minor version-major release-patch release-minor \
        publish-core publish-pattern-detect npm-publish-core npm-publish-pattern-detect \
        pull sync-from-spoke

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
	if [ ! -d "packages/$(SPOKE)" ]; then \
		$(call log_error,Package packages/$(SPOKE) not found); \
		exit 1; \
	fi
endef

npm-check: ## Check npm login status
	@$(call log_step,Checking npm authentication...)
	@npm whoami >/dev/null 2>&1 || { $(call log_error,Not logged into npm. Run: make npm-login); exit 1; }
	@$(call log_success,Logged into npm as $$(npm whoami))

npm-login: ## Login to npm registry
	@$(call log_step,Logging into npm...)
	@npm login

# Generic version bumping (requires SPOKE parameter)
version-patch: ## Bump spoke patch version (0.1.0 -> 0.1.1). Usage: make version-patch SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) patch version...)
	@cd packages/$(SPOKE) && pnpm version patch --no-git-tag-version
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-minor: ## Bump spoke minor version (0.1.0 -> 0.2.0). Usage: make version-minor SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) minor version...)
	@cd packages/$(SPOKE) && pnpm version minor --no-git-tag-version
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-major: ## Bump spoke major version (0.1.0 -> 1.0.0). Usage: make version-major SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) major version...)
	@cd packages/$(SPOKE) && pnpm version major --no-git-tag-version
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

# Generic npm publish (requires SPOKE parameter)
npm-publish: npm-check ## Publish spoke to npm. Usage: make npm-publish SPOKE=pattern-detect [OTP=123456]
	$(call require_spoke)
	@$(call log_step,Publishing @aiready/$(SPOKE) to npm...)
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
	git push -f "$$remote" "$$branch":$(TARGET_BRANCH); \
	$(call log_success,Published @aiready/$(SPOKE) to $(TARGET_BRANCH))

# Generic release targets (version bump + build + publish)
release-patch: ## Release spoke patch version. Usage: make release-patch SPOKE=pattern-detect [OTP=123456]
	$(call require_spoke)
	@$(MAKE) version-patch SPOKE=$(SPOKE)
	@$(MAKE) build
	@$(MAKE) npm-publish SPOKE=$(SPOKE) OTP=$(OTP)
	@$(MAKE) publish SPOKE=$(SPOKE) OWNER=$(OWNER)
	@$(call log_success,Released new patch version of @aiready/$(SPOKE))

release-minor: ## Release spoke minor version. Usage: make release-minor SPOKE=pattern-detect [OTP=123456]
	$(call require_spoke)
	@$(MAKE) version-minor SPOKE=$(SPOKE)
	@$(MAKE) build
	@$(MAKE) npm-publish SPOKE=$(SPOKE) OTP=$(OTP)
	@$(MAKE) publish SPOKE=$(SPOKE) OWNER=$(OWNER)
	@$(call log_success,Released new minor version of @aiready/$(SPOKE))

# Convenience aliases for specific spokes
publish-core: ## Publish @aiready/core to GitHub (shortcut for: make publish SPOKE=core)
	@$(MAKE) publish SPOKE=core OWNER=$(OWNER)

publish-pattern-detect: ## Publish @aiready/pattern-detect to GitHub (shortcut for: make publish SPOKE=pattern-detect)
	@$(MAKE) publish SPOKE=pattern-detect OWNER=$(OWNER)

npm-publish-core: ## Publish @aiready/core to npm (shortcut for: make npm-publish SPOKE=core)
	@$(MAKE) npm-publish SPOKE=core OTP=$(OTP)

npm-publish-pattern-detect: ## Publish @aiready/pattern-detect to npm (shortcut for: make npm-publish SPOKE=pattern-detect)
	@$(MAKE) npm-publish SPOKE=pattern-detect OTP=$(OTP)

npm-publish-all: build npm-publish-core npm-publish

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
	@$(MAKE) sync-from-spoke SPOKE=$(SPOKE)-pattern-detect ## Build and publish all packages to npm
	@$(call log_success,All packages published to npm)
