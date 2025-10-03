<!--
Sync Impact Report:
- Version change: none → 1.0.0 (initial constitution)
- Modified principles: N/A (initial creation)
- Added sections: All sections (initial creation)
- Removed sections: N/A
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (updated constitution version reference and check gates)
  ✅ .specify/templates/spec-template.md (no changes needed)
  ✅ .specify/templates/tasks-template.md (no changes needed)
- Follow-up TODOs: None
-->

# Ersa Training Platform Constitution

## Core Principles

### I. Bilingual-First Development
All features MUST support both Arabic and English from day one. RTL (right-to-left) layout 
support is mandatory for Arabic content. Translation keys MUST be synchronized between 
locales. User interfaces MUST provide seamless language switching without data loss.

**Rationale**: Ersa serves Arabic and English-speaking markets equally, making bilingual 
support a core business requirement, not an afterthought.

### II. Security & Authentication (NON-NEGOTIABLE)
JWT-based authentication is mandatory for all protected resources. Role-based access control 
(User, Admin, SuperAdmin) MUST be enforced at both API and UI levels. All sensitive operations 
MUST require proper authorization. Security headers and CORS policies MUST be configured.

**Rationale**: Educational platforms handle sensitive user data and require robust security 
to maintain trust and comply with privacy regulations.

### III. Test-Driven Development (NON-NEGOTIABLE)
Tests MUST be written before implementation. The Red-Green-Refactor cycle is strictly enforced:
- Red: Write failing test
- Green: Implement minimal code to pass
- Refactor: Improve code while keeping tests green

Contract tests are required for all API endpoints. Integration tests are mandatory for 
user workflows involving multiple components.

**Rationale**: TDD ensures code quality, prevents regressions, and provides living 
documentation of system behavior.

### IV. Responsive & Accessible Design
All UI components MUST be mobile-first responsive. ARIA labels and semantic HTML are required 
for accessibility. Color contrast MUST meet WCAG 2.1 AA standards. Keyboard navigation MUST 
be supported throughout the application.

**Rationale**: Educational content must be accessible to users with varying abilities and 
on different devices to maximize reach and inclusivity.

### V. Performance & Observability
Page load times MUST be under 3 seconds on 3G connections. API responses MUST be under 500ms 
for standard operations. Structured logging with correlation IDs is required. Performance 
metrics MUST be tracked and monitored.

**Rationale**: Educational platforms require fast, reliable performance to maintain user 
engagement and support effective learning experiences.

## Technology Standards

**Frontend Stack**: Next.js 15+ with TypeScript, Tailwind CSS, next-intl for localization
**Backend Stack**: ASP.NET Core 8+ with Entity Framework Core, JWT authentication
**Database**: SQLite (development), SQL Server (production)
**Testing**: Jest/React Testing Library (frontend), xUnit/.NET Test SDK (backend)
**CI/CD**: Automated testing required before deployment

Technology changes MUST be documented and approved through the amendment process.

## Development Workflow

**Feature Development**: Follow specification → plan → tasks → implementation workflow
**Code Review**: All changes require peer review and automated test passage
**Branch Strategy**: Feature branches from main, squash merge after approval
**Documentation**: README, API docs, and user guides MUST be updated for user-facing changes
**Quality Gates**: TypeScript compilation, linting, testing, and security scans must pass

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests 
and code reviews MUST verify constitutional compliance. Complexity that violates principles 
MUST be justified in writing or the approach simplified.

**Amendment Process**: 
1. Propose changes via documented RFC process
2. Evaluate impact on existing codebase and templates
3. Update version following semantic versioning
4. Propagate changes to all dependent templates and documentation

**Compliance Review**: Constitutional adherence is reviewed during:
- Feature planning (constitution check required)
- Code review (principles verification)
- Release preparation (comprehensive audit)

**Version**: 1.0.0 | **Ratified**: 2025-09-26 | **Last Amended**: 2025-09-26