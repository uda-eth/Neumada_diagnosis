# Branch Structure and Workflows

This document provides detailed information about the branch structure, workflows, and development processes for the Maly social networking platform.

## Branch Structure

### Core Branches

| Branch Name   | Purpose                                          | Protection Level |
|---------------|--------------------------------------------------|------------------|
| `main`        | Production-ready code                            | Protected        |
| `staging`     | Pre-production testing and QA                    | Protected        |
| `development` | Active development branch                        | Semi-protected   |

### Feature Branches

Feature branches should be created from the `development` branch with the naming convention:
```
feature/feature-name
```

Example: `feature/user-authentication`, `feature/event-creation`

### Bugfix Branches

Bugfix branches should be created with the naming convention:
```
bugfix/bug-name
```

Example: `bugfix/login-error`, `bugfix/profile-image-upload`

### Hotfix Branches

For urgent fixes to production, create a hotfix branch from `main`:
```
hotfix/issue-name
```

Example: `hotfix/security-vulnerability`, `hotfix/payment-processing`

## Git Workflow

1. **Pull the latest changes** from the appropriate base branch:
   ```
   git checkout development
   git pull origin development
   ```

2. **Create a new branch** for your feature or bugfix:
   ```
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them with descriptive messages:
   ```
   git add .
   git commit -m "Add user authentication system"
   ```

4. **Push your branch** to the remote repository:
   ```
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** to merge your changes into the appropriate branch

6. After the pull request is reviewed and approved, **merge your changes**

## Replit Workflows

The project has several configured workflows to streamline development and deployment:

### Start Application Workflow

- **Name**: Start application
- **Command**: `npm run dev`
- **Purpose**: Start the development server for local development
- **Usage**: Run this workflow to start both the frontend and backend in development mode

### Project Workflow

- **Name**: Project
- **Mode**: Parallel
- **Tasks**:
  - Start application
- **Purpose**: Main project workflow that runs the application

### Run Workflow

- **Name**: Run
- **Mode**: Sequential
- **Tasks**:
  - Execute `npm run dev`
- **Purpose**: Alternative workflow to start the development server

### Npm Install/Run/Start Workflow

- **Name**: Npm install/run/start
- **Mode**: Sequential
- **Tasks**:
  - Execute `npm install`
  - Execute `npm run build`
  - Execute `npm start`
- **Purpose**: Complete workflow for setting up and starting the application in production mode

## Development Process

### Local Development

1. Start the development server using the "Start application" workflow
2. Make your changes to the codebase
3. Test your changes locally
4. Commit and push your changes to your feature/bugfix branch
5. Create a pull request

### Database Updates

When making changes to the database schema:

1. Update the schema definition in `db/schema.ts`
2. Run `npm run db:push` to apply the changes to your local database
3. Test the changes thoroughly
4. Document the schema changes in your pull request

### Deployment Process

1. Ensure all changes are committed and pushed
2. Create a pull request to merge your changes into `staging`
3. After testing in the staging environment, create a pull request to merge into `main`
4. Deploy to production using the Replit Deployments feature

## Quality Assurance

### Code Reviews

All pull requests must be reviewed by at least one team member before merging. Reviewers should check for:

- Code quality and adherence to coding standards
- Adequate test coverage
- Documentation for new features
- Proper error handling
- Security considerations

### Testing

- Write unit tests for new features
- Manually test functionality in the development environment
- Perform integration testing in the staging environment before deploying to production

## Continuous Integration/Continuous Deployment (CI/CD)

The project uses Replit's built-in deployment capabilities:

1. Changes merged to `main` trigger a deployment build
2. The build process runs `npm run build`
3. The deployment runs `npm run start`
4. Replit Deployments handle hosting, TLS/SSL, and health checks

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check that the DATABASE_URL environment variable is correctly set
   - Verify PostgreSQL is running and accessible

2. **Build failures**:
   - Check the console for TypeScript or compilation errors
   - Ensure all dependencies are correctly installed

3. **Runtime errors**:
   - Check server logs for detailed error messages
   - Verify all required environment variables are set

### Support

For additional support:

1. Check the project documentation
2. Consult with the development team
3. Open an issue for tracking and resolution