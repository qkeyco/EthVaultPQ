# NPM Account Setup for EthVaultPQ

## Create NPM Account

1. **Go to NPM website**: https://www.npmjs.com/signup

2. **Sign up with**:
   - Username: Choose a username (e.g., `jamestagg` or `ethvaultpq`)
   - Email: Your email address
   - Password: Strong password

3. **Verify email**: Check your inbox and click verification link

## Login via CLI

Once account is created:

```bash
npm login
```

Enter your credentials when prompted:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

Verify login:
```bash
npm whoami
# Should print your username
```

## Create Organization (Optional but Recommended)

For `@ethvaultpq` scoped package:

1. Go to: https://www.npmjs.com/org/create
2. Organization name: `ethvaultpq`
3. Choose plan (free is fine for public packages)
4. Click "Create"

**Or** publish without organization:
- Change package name from `@qkey/ethvaultpq-snap` to `ethvaultpq-snap` in `package.json`

## Alternative: Publish Without Organization

If you don't want to create an organization, update `package.json`:

```json
{
  "name": "ethvaultpq-snap",  // Instead of @qkey/ethvaultpq-snap
  ...
}
```

Then users will install with:
```
npm:ethvaultpq-snap
```

## Security Best Practices

1. **Enable 2FA** (recommended):
   - Go to: https://www.npmjs.com/settings/[username]/tfa
   - Enable two-factor authentication
   - Save recovery codes

2. **Create Automation Token** (for CI/CD later):
   - Go to: https://www.npmjs.com/settings/[username]/tokens
   - Click "Generate New Token"
   - Select "Automation"
   - Copy token (save it securely!)

## Troubleshooting

### "Package name already taken"
- Choose different name: `ethvaultpq-snap-js`, `ethvault-pq`, etc.
- Or create organization and use scoped name

### "Unauthorized" error
- Make sure you're logged in: `npm whoami`
- Re-login: `npm logout && npm login`

### Can't create organization
- It's optional! Just use unscoped package name instead

## Next Steps After Account Setup

1. Login: `npm login`
2. Verify: `npm whoami`
3. Publish: `cd metamask-snap && npm run publish:snap`

