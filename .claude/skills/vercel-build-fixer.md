# Vercel Build Fixer Skill

## Purpose
Automatically monitor Vercel deployments, check build logs for errors and warnings, and fix them.

## When to Use
- After pushing code to GitHub that triggers a Vercel deployment
- When user reports build errors or warnings in Vercel dashboard
- Proactively after making changes to TypeScript, configuration, or dependencies

## How It Works

### 1. Get Latest Deployment URL
Use the Vercel CLI to get the most recent deployment:

```bash
vercel ls --json | head -1
```

Or check specific project:
```bash
vercel ls <project-name> --json | head -1
```

### 2. Fetch Build Logs
Use the deployment URL to fetch logs:

```bash
vercel logs <deployment-url>
```

### 3. Parse for Errors and Warnings

Look for common patterns:
- `error TS####:` - TypeScript errors
- `Error:` - General errors
- `Warning:` - Build warnings
- `Failed to compile` - Compilation failures
- `Module not found` - Missing dependencies
- `Cannot find module` - Import errors

### 4. Categorize and Fix

#### TypeScript Errors

**Type mismatch errors** (`TS2322`, `TS2345`):
- Add type assertions (`as Type`)
- Update interface definitions
- Fix strict mode issues

**Missing type definitions** (`TS2307`, `TS7016`):
```bash
npm install --save-dev @types/<package>
```

**Return type errors** (`TS2322` on returns):
- Remove explicit return type
- Fix return statements pattern
- Add void returns where needed

#### Dependency Errors

**Missing packages**:
```bash
npm install <missing-package>
```

**Version conflicts**:
```bash
npm install <package>@<compatible-version>
```

#### Configuration Errors

**vercel.json issues**:
- Check runtime versions
- Validate function patterns
- Fix rewrites/redirects

**tsconfig.json issues**:
- Add missing types array entries
- Update module resolution
- Adjust strict settings

### 5. Test and Verify

After fixes:
1. Commit and push changes
2. Wait for new deployment
3. Re-check logs
4. Verify endpoints are working

## Common Fixes Reference

### TypeScript

```typescript
// Fix: Remove Promise<void> return type
// Before:
export default async function handler(): Promise<void> {
  return res.status(200).end();
}

// After:
export default async function handler() {
  res.status(200).end();
  return;
}
```

```typescript
// Fix: Add type assertions for tuples
// Before:
const proof = {
  a: [x, y],  // error: any[] not assignable to [string, string]
}

// After:
const proof = {
  a: [x, y] as [string, string],
}
```

### Package.json

```json
{
  "engines": {
    "node": "20.x"  // Pin version to avoid warnings
  },
  "devDependencies": {
    "@types/node": "^20.0.0",  // Always include for Node APIs
    "typescript": "^5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["node", "@vercel/node"],  // Include Node types
    "skipLibCheck": true,  // Skip lib checks for faster builds
    "strict": false,  // Disable if migrating legacy code
    "esModuleInterop": true,
    "moduleResolution": "Node"
  }
}
```

### vercel.json

```json
{
  "version": 2,
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
  // Don't specify functions runtime unless needed
  // Vercel auto-detects from package.json engines
}
```

## Automation Steps

1. **Monitor**: Check Vercel dashboard or use CLI to detect failed builds
2. **Fetch Logs**: Get complete build output
3. **Parse Errors**: Extract all errors and warnings with line numbers
4. **Fix Files**: Apply fixes based on error patterns
5. **Commit**: Push fixes to trigger rebuild
6. **Verify**: Ensure new build succeeds and endpoints work

## Example Usage

User: "Vercel build is failing with TypeScript errors"

Steps:
1. Fetch latest deployment logs
2. Identify all TS errors with file:line info
3. Read affected files
4. Apply appropriate fixes
5. Commit with descriptive message
6. Wait for rebuild
7. Confirm success

## Integration with TodoWrite

Track build fixes:
```
1. [in_progress] Fetch Vercel build logs
2. [pending] Fix TypeScript errors (5 files)
3. [pending] Update dependencies
4. [pending] Verify clean build
```

## Notes

- Always wait for deployment to complete before checking logs
- Use `sleep 60` or `sleep 120` to allow Vercel time to build
- Check both build logs AND runtime logs for serverless functions
- Test endpoints after successful build to ensure runtime works
- Keep a list of common error patterns for quick fixes
