###############################################################################
# Makefile.base: Core automation macros for the AIReady hub-and-spoke system
###############################################################################

# Resolve version bump target from TYPE
# Usage: $(call bump_target_for_type,$(TYPE))
define bump_target_for_type
$(if $(filter $(1),patch),version-patch,$(if $(filter $(1),minor),version-minor,$(if $(filter $(1),major),version-major,)))
endef

# Validate version TYPE (shell-level)
# Usage: @$(call validate_type)
define validate_type
	if [ -z "$(TYPE)" ]; then \
		$(call log_error,TYPE required: make $@ TYPE=patch|minor|major); \
		exit 1; \
	fi; \
	if [ "$(TYPE)" != "patch" ] && [ "$(TYPE)" != "minor" ] && [ "$(TYPE)" != "major" ]; then \
		$(call log_error,Invalid TYPE '$(TYPE)'. Expected patch|minor|major); \
		exit 1; \
	fi
endef

# Conditionally run a shell command based on a flag value (1=run, 0=skip).
# Usage: $(call run_if_enabled,$(FLAG),command,label)
define run_if_enabled
	if [ "$(strip $(1))" = "1" ]; then \
		$(2); \
	else \
		$(call log_info,Skipping $(3)); \
	fi
endef

# Determine if a bump is needed for a component based on last tag and release type.
# Usage: $(call maybe_bump_version,dir,display_name,type,tag_prefix)
define maybe_bump_version
	$(call log_step,Checking $(2) version ($(3))...); \
	last_ver=$$( $(ROOT_DIR)/tooling/makefiles/scripts/get-last-tag.sh $(4) ); \
	action=$$( node $(ROOT_DIR)/tooling/makefiles/scripts/get-next-version.cjs $(1) $$last_ver $(3) ); \
	if [ "$$action" = "BUMP" ]; then \
		$(call log_step,Bumping $(2) version ($(3))...); \
		npm --prefix $(1) version $(3) --no-git-tag-version; \
	else \
		$(call log_info,$(2) version $$action already sufficient for $(3) (last tag: $$last_ver)); \
	fi; \
	$(call log_success,$(2) version is $$(node -p "require('$(1)/package.json').version"))
endef

# Commit package.json changes and create an annotated tag.
# Usage: $(call commit_and_tag,dir,display_name,tag_prefix)
define commit_and_tag
	version=$$(node -p "require('$(1)/package.json').version"); \
	$(call log_step,Committing $(2) v$$version...); \
	cd $(ROOT_DIR) && git add . ; \
	if git diff --staged --quiet; then \
		$(call log_info,No changes to commit for $(2)); \
	else \
		cd $(ROOT_DIR) && git commit -m "chore(release): $(2) v$$version"; \
	fi; \
	tag_name="$(3)-v$$version"; \
	$(call log_step,Tagging $$tag_name...); \
	cd $(ROOT_DIR) && git tag -a "$$tag_name" -m "Release $(2) v$$version" || true; \
	$(call log_success,Committed and tagged $$tag_name)
endef

# Sync a subdirectory to a standalone GitHub repository using subtree split.
# Usage: $(call sync_to_github,dir,repo_name,owner,branch,tag_prefix[,cleanup_cmd])
define sync_to_github
	@$(call log_step,Syncing $(1) to GitHub ($(2))...); \
	url="https://github.com/$(3)/$(2).git"; \
	remote="$(2)"; \
	branch="publish-$(notdir $(1))"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	git branch -D "$$branch" >/dev/null 2>&1 || true; \
	$(call log_info,Creating subtree split for $(1)...); \
	git subtree split --prefix="$(1)" -b "$$branch" >/dev/null; \
	$(if $(strip $(6)), \
		$(call log_info,Running cleanup for split branch...); \
		git checkout "$$branch" 2>/dev/null; \
		$(6); \
		if ! git diff --cached --quiet 2>/dev/null; then \
			git commit -m "chore: cleanup sensitive files for standalone repo" >/dev/null 2>&1; \
		fi; \
		git checkout $(TARGET_BRANCH) 2>/dev/null; \
	) \
	split_commit=$$(git rev-parse "$$branch"); \
	git push --no-verify -f "$$remote" "$$branch":$(4); \
	$(call log_success,Synced $(1) to GitHub repo ($(4))); \
	version=$$(node -p "require('$(ROOT_DIR)/$(1)/package.json').version"); \
	tag_name="$(5)-v$$version"; \
	$(call log_step,Tagging remote commit $$split_commit as $$tag_name...); \
	if git ls-remote --tags "$$remote" "$$tag_name" | grep -q "$$tag_name"; then \
		$(call log_info,Remote tag $$tag_name already exists; skipping); \
	else \
		git tag -a "$$tag_name" "$$split_commit" -m "Release $(1) v$$version" || true; \
		git push --no-verify "$$remote" "$$tag_name"; \
		$(call log_success,Remote tag pushed: $$tag_name); \
	fi
endef

# Generic app release macro
# Usage: $(call release_app,dir,name,display,tag_prefix,stage,deploy_target[,verify_target,publish_target,e2e_target])
define release_app
	@$(validate_type)
	@$(call maybe_bump_version,$(1),$(3),$(TYPE),$(4))
	@$(call commit_and_tag,$(1),$(3),$(4))
	@$(call run_if_enabled,$(RELEASE_PRECHECKS),$(MAKE) -C $(ROOT_DIR) release-checks-$(2),$(3) checks)
	@$(call run_if_enabled,$(RELEASE_BUILD),cd $(1) && pnpm build,$(3) build)
	@$(call run_if_enabled,$(RELEASE_DEPLOY),$(MAKE) -C $(ROOT_DIR) $(6),$(3) $(5) deploy)
	@$(if $(7),$(call run_if_enabled,$(RELEASE_VERIFY),$(MAKE) -C $(ROOT_DIR) $(7),$(3) verify))
	@$(if $(9),$(call run_if_enabled,$(RELEASE_E2E),$(MAKE) -C $(ROOT_DIR) $(9),$(3) E2E))
	@$(if $(8),$(call run_if_enabled,$(RELEASE_PUBLISH),$(MAKE) -C $(ROOT_DIR) $(8),publish $(3)))
	@$(call run_if_enabled,$(RELEASE_PUSH),$(MAKE) sync,sync and push)
	@$(call log_success,$(5) release finished for $(3))
endef

# Generic SST deploy macro
# Usage: $(call deploy_sst_app,dir,name,stage[,cloudflare_flags])
define deploy_sst_app
	@$(call log_step,Deploying $(2) to AWS (stage: $(or $(3),dev)))
	@echo "$(CYAN)Using AWS Profile: $(AWS_PROFILE)$(NC)"
	@echo "$(CYAN)Using AWS Region: $(AWS_REGION)$(NC)"
	@cd $(1) && \
		set -a && [ -f .env ] && . ./.env || true && \
		[ -f .env.$(3) ] && . ./.env.$(3) || true && set +a && \
		export AWS_PROFILE=$${AWS_PROFILE:-$(AWS_PROFILE)} && \
		export AWS_REGION=$${AWS_REGION:-$(AWS_REGION)} && \
		$(if $(4),export CLOUDFLARE_API_TOKEN="$${CLOUDFLARE_API_TOKEN}" && export CLOUDFLARE_ACCOUNT_ID="$${CLOUDFLARE_ACCOUNT_ID}" &&) \
		sst deploy $(if $(3),--stage $(3)) --yes
	@$(call log_success,$(2) deployed$(if $(3), to stage: $(3)))
endef
