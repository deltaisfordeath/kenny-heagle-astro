# Remark42 on the Mac mini (native, no Docker)

Runs Remark42 as a single Go binary under launchd, exposed at
`https://comments.kennyheagle.com` through the existing cloudflared tunnel.
Idle footprint is ~30–50MB RAM. Data lives in an embedded BoltDB file — no
database server needed.

## 1. Install the binary

```sh
mkdir -p ~/remark42/{var,logs}
cd ~/remark42
```

Check https://github.com/umputun/remark42/releases/latest for a
`darwin-arm64` asset. If present:

```sh
curl -LO https://github.com/umputun/remark42/releases/latest/download/remark42.darwin-arm64.tar.gz
tar xzf remark42.darwin-arm64.tar.gz && mv remark42.darwin-arm64 remark42
xattr -d com.apple.quarantine remark42   # clear Gatekeeper quarantine
```

If there's no darwin-arm64 release, build from source (one-time, ~2 min):

```sh
brew install go
git clone --depth 1 https://github.com/umputun/remark42.git /tmp/remark42-src
cd /tmp/remark42-src/backend && go build -o ~/remark42/remark42 ./app
```

## 2. Configure

Edit `com.kennyheagle.remark42.plist` in this folder:

- Replace the `SECRET` value with output of `openssl rand -hex 32`
- Adjust paths if your username/home dir differs

## 3. Install the launchd service

```sh
cp com.kennyheagle.remark42.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.kennyheagle.remark42.plist
```

Verify: `curl http://localhost:8080/ping` → `pong`. Logs are in `~/remark42/logs/`.

To restart after config changes:

```sh
launchctl kickstart -k gui/$(id -u)/com.kennyheagle.remark42
```

## 4. Expose via cloudflared

Add a hostname to the existing tunnel's ingress (before the catch-all rule):

```yaml
  - hostname: comments.kennyheagle.com
    service: http://localhost:8080
```

Then route DNS and restart cloudflared:

```sh
cloudflared tunnel route dns <tunnel-name> comments.kennyheagle.com
```

(If the tunnel is dashboard-managed, add the public hostname in
Zero Trust → Networks → Tunnels instead.)

Verify: `curl https://comments.kennyheagle.com/ping` → `pong`.

## 5. Frontend

`src/components/Comments.astro` already points at
`https://comments.kennyheagle.com` with `site_id: kennyheagle`. Nothing else
to do — deploy the site and comments appear on every post page.

## 6. Admin access (moderation, blocking)

Anonymous auth alone is a bad way to grant admin (anon identities are just
nicknames — someone could impersonate you). Enable GitHub auth for yourself:

1. Create an OAuth app at https://github.com/settings/developers
   - Homepage URL: `https://comments.kennyheagle.com`
   - Callback URL: `https://comments.kennyheagle.com/auth/github/callback`
2. Uncomment and fill `AUTH_GITHUB_CID` / `AUTH_GITHUB_CSEC` in the plist
3. Restart, log in on any post via GitHub, click your avatar in the comment
   widget, and copy your user ID (`github_...`)
4. Uncomment `ADMIN_SHARED_ID` in the plist, paste the ID, restart

As admin you can delete comments, block users (permanently or timed), and
enable moderation-first mode per site if spam becomes a problem. Remark42
keeps only what it needs to display comments — anonymous users are tracked
by ID, not raw IP, which keeps you clear of most GDPR concerns.

## Backups

Remark42 auto-exports nightly to `~/remark42/var/backup` (kept 7 days by
default). The whole state is `~/remark42/var` — include it in whatever backs
up the mini.
