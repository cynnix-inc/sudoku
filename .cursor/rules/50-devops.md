# DevOps Rules

## CI/CD Pipeline
- **Automated Testing**: Run tests on every commit and PR
- **Quality Gates**: Lint, typecheck, and test must pass
- **Automated Deploy**: Deploy to staging/production on merge
- **Rollback Strategy**: Quick rollback capability for issues

## Build Process
- **Monorepo Builds**: Build all packages and apps
- **Dependency Management**: Use pnpm workspaces effectively
- **Build Caching**: Cache dependencies and build artifacts
- **Parallel Builds**: Build packages in parallel when possible

## Deployment Strategy
- **Environment Management**: Separate configs for dev/staging/prod
- **Feature Flags**: Use remote config for feature toggles
- **Blue-Green Deploy**: Zero-downtime deployments
- **Health Checks**: Monitor app health after deployment

## Infrastructure
- **Expo EAS**: Use Expo Application Services for builds
- **Supabase**: Database and backend services
- **CDN**: Use CDN for static assets
- **Monitoring**: Implement comprehensive monitoring

## Environment Configuration
- **Environment Variables**: Use .env files for local development
- **Secrets Management**: Secure storage for API keys and secrets
- **Configuration Validation**: Validate config on startup
- **Feature Flags**: Remote configuration for runtime changes

## Monitoring & Observability
- **Application Metrics**: Track performance and errors
- **User Analytics**: Monitor user behavior and app usage
- **Error Tracking**: Use Sentry for error monitoring
- **Performance Monitoring**: Track app performance metrics

## Release Management
- **Versioning**: Semantic versioning for releases
- **Changelog**: Maintain detailed changelog
- **Release Notes**: Clear communication of changes
- **Hotfixes**: Quick fixes for critical issues

## Quality Assurance
- **Code Quality**: ESLint, Prettier, and TypeScript checks
- **Test Coverage**: Maintain high test coverage
- **Performance Testing**: Regular performance audits
- **Security Scanning**: Regular security vulnerability scans

## Backup & Recovery
- **Database Backups**: Regular automated backups
- **Disaster Recovery**: Plan for worst-case scenarios
- **Data Retention**: Clear data retention policies
- **Recovery Testing**: Regular recovery procedure testing
