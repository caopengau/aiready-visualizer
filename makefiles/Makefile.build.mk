###############################################################################
# Makefile.build: Build-related targets
###############################################################################
include makefiles/Makefile.shared.mk

.PHONY: build build-core build-pattern-detect build-skills dev dev-core dev-pattern-detect dev-skills dev-landing dev-platform graph

build: ## Build all packages
	@$(call log_step,Building all packages...)
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run build $(SILENT_TURBO); \
	else \
		$(PNPM) run build $(SILENT_PNPM); \
	fi
	@$(call log_success,All packages built successfully)

build-skills: ## Build skills package (compiles AGENTS.md from rules)
	@$(call log_info,Building @aiready/skills...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/skills build
	@$(call log_success,Skills package built)

build-core: ## Build core package only
	@$(call log_info,Building @aiready/core...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/core build
	@$(call log_success,Core package built)

build-pattern-detect: ## Build pattern-detect package only
	@$(call log_info,Building @aiready/pattern-detect...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/pattern-detect build
	@$(call log_success,Pattern-detect package built)

dev: ## Start development mode (watch) for all packages (excludes platform — use make dev-platform separately)
	@$(call log_step,Starting development mode with watch...)
	@echo "$(CYAN)💡 To start the platform, run: $(GREEN)make dev-platform$(NC)"
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run dev --filter=!@aiready/platform; \
	else \
		$(PNPM) run dev; \
	fi

dev-core: ## Start development mode (watch) for core package
	@$(call log_info,Starting development mode for @aiready/core...)
	@$(PNPM) --filter @aiready/core dev

dev-pattern-detect: ## Start development mode (watch) for pattern-detect package
	@$(call log_info,Starting development mode for @aiready/pattern-detect...)
	@$(PNPM) --filter @aiready/pattern-detect dev

dev-skills: ## Build and validate skills rules
	@$(call log_info,Building and validating skills...)
	@$(PNPM) --filter @aiready/skills dev
	@$(call log_success,Skills validated)

landing: dev-landing ## Alias for dev-landing
dev-landing: ## Start landing page dev server at http://localhost:8887
	@$(call log_step,Starting landing page dev server...)
	@echo "$(CYAN)Landing page will be available at: $(GREEN)http://localhost:8887$(NC)"
	@$(PNPM) --filter @aiready/landing dev

platform: dev-platform ## Alias for dev-platform
dev-platform: ## Start platform dev server locally (SST dev --stage local)
	@$(call log_step,Starting platform dev server with SST...)
	@echo "$(CYAN)Using AWS profile: $(GREEN)aiready$(NC)"
	@echo "$(CYAN)Platform will be available at: $(GREEN)http://localhost:8888$(NC)"
	@cd platform && \
		[ -f .env.local ] && set -a && . ./.env.local && set +a || true && \
		AWS_PROFILE=aiready $(PNPM) dev

graph: ## Visualize project dependency graph (opens browser)
	@$(call log_step,Starting Nx graph visualization...)
	@echo "$(CYAN)Graph will be available at: $(GREEN)http://127.0.0.1:4211/projects$(NC)"
	@$(PNPM) run graph
