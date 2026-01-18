# Testing API Endpoints: Windows PowerShell Guide

## ⚠️ The curl Alias Problem on Windows PowerShell

In **Windows PowerShell**, `curl` is not the Unix curl utility—it's an **alias** for `Invoke-WebRequest`. They have completely different parameters, which breaks commands like:

```powershell
# ❌ This FAILS:
curl -s http://localhost:3000/api/posts?limit=5
# Error: The argument is not recognized as the name of a cmdlet, function, script file, or operable program.
```

**Why?** PowerShell treats `-s` as a parameter to `Invoke-WebRequest`, which doesn't support that flag.

---

## ✅ Solutions

### Option 1: Invoke-RestMethod (Recommended)

**Best for:** Clean JSON output, no extra parsing needed

```powershell
# Basic usage
Invoke-RestMethod "http://localhost:3000/api/health"

# With nice JSON formatting
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=new" | ConvertTo-Json

# With custom headers
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
    "Content-Type"  = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/posts" -Headers $headers | ConvertTo-Json
```

### Option 2: iwr (Invoke-WebRequest Alias)

**Best for:** Lower-level control, response inspection

```powershell
# Simple GET request
iwr "http://localhost:3000/api/health" | Select-Object -ExpandProperty Content

# Pretty print JSON
$response = iwr "http://localhost:3000/api/posts?limit=5"
$response.Content | ConvertFrom-Json | ConvertTo-Json

# With authentication
$headers = @{ Authorization = "Bearer YOUR_TOKEN" }
iwr -Uri "http://localhost:3000/api/posts" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Option 3: npm Scripts (Easiest)

**Best for:** One-command testing, no syntax memorization needed

```powershell
# Health check
npm run api:health

# List posts
npm run api:posts

# Full API test
npm run test:windows
```

---

## Common API Endpoint Tests

### Health & Connectivity

```powershell
# Is the server running?
Invoke-RestMethod "http://localhost:3000/api/health"

# Expected output:
# status   : healthy
# database : connected
# timestamp: 2026-01-17T...
```

### Posts (Feed)

```powershell
# Get latest posts
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=new"

# Get hottest posts
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=hot"

# Get top-rated posts
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=top"

# Search posts
Invoke-RestMethod "http://localhost:3000/api/posts?search=mental+health&limit=5"

# Filter by category (requires category UUID)
Invoke-RestMethod "http://localhost:3000/api/posts?categoryId=<category-uuid>&limit=5"

# Paginate
Invoke-RestMethod "http://localhost:3000/api/posts?limit=10&page=2"
```

### Specific Post

```powershell
# Get post by ID
Invoke-RestMethod "http://localhost:3000/api/posts/[POST_ID]"

# Example (replace with real ID):
Invoke-RestMethod "http://localhost:3000/api/posts/clk123abc456def789xyz000"
```

### Comments

```powershell
# Get comments for a post
Invoke-RestMethod "http://localhost:3000/api/posts/[POST_ID]/comments"

# Example:
Invoke-RestMethod "http://localhost:3000/api/posts/clk123abc456def789xyz000/comments"
```

### Authentication

```powershell
# Check current session (if logged in)
$response = iwr -Uri "http://localhost:3000/api/auth/session" -UseBasicParsing
$response.Content | ConvertFrom-Json

# Expected output (if logged in):
# {
#   "user": { "id": "...", "email": "...", "name": "..." },
#   "expires": "..."
# }

# Expected output (if logged out):
# null
```

---

## Save Time: Use PowerShell Functions

Create a reusable function in your PowerShell profile:

```powershell
# Add to $PROFILE (edit it: notepad $PROFILE)

function Get-NeuroKindAPI {
    param(
        [string]$endpoint = "health",
        [string]$query = ""
    )
    $url = "http://localhost:3000/api/$endpoint"
    if ($query) { $url += "?$query" }
    Invoke-RestMethod $url | ConvertTo-Json
}

# Usage:
# Get-NeuroKindAPI "health"
# Get-NeuroKindAPI "posts" "limit=5&sort=new"
# Get-NeuroKindAPI "posts/clk123/comments"
```

---

## Alternative: Use Git Bash or WSL

If you frequently use Unix commands, consider using **Git Bash** or **WSL (Windows Subsystem for Linux)**:

### Git Bash

```bash
# Traditional curl works as expected
curl http://localhost:3000/api/health

# Pretty print JSON
curl http://localhost:3000/api/posts?limit=5 | jq

# With custom headers
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/posts
```

### WSL (Windows Subsystem for Linux)

```bash
# Same as Linux/Mac
curl http://localhost:3000/api/health

# Install jq if not present
sudo apt install jq

# Pretty print
curl http://localhost:3000/api/posts?limit=5 | jq
```

---

## Troubleshooting

### Error: "The underlying connection was closed"

```
Error: Invoke-RestMethod : The underlying connection was closed: An unexpected error occurred on a send.
```

**Solutions:**

1. Check if dev server is running: `npm run dev`
2. Verify localhost:3000 is accessible: `ping localhost`
3. Check firewall isn't blocking port 3000

### Error: "Unable to connect to the remote server"

```
Error: Unable to connect to the remote server
```

**Solutions:**

1. Dev server not running → `npm run dev`
2. Wrong port → Check if running on different port: `netstat -ano | findstr LISTENING`
3. Database not ready → Wait 5 seconds after `npm run dev`

### Error: "Invalid JSON"

```powershell
# Make sure to use ConvertTo-Json for readable output
Invoke-RestMethod "..." | ConvertTo-Json
```

---

## Quick Reference Card

```powershell
# Health check
Invoke-RestMethod "http://localhost:3000/api/health"

# List posts (5 latest)
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=new" | ConvertTo-Json

# List posts (5 hottest)
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=hot" | ConvertTo-Json

# Get post detail
Invoke-RestMethod "http://localhost:3000/api/posts/[ID]"

# Get comments
Invoke-RestMethod "http://localhost:3000/api/posts/[ID]/comments"

# Check login status
iwr "http://localhost:3000/api/auth/session" | Select-Object -ExpandProperty Content
```

---

## npm Scripts Reference

```bash
# API Testing
npm run api:health          # Check if server is up
npm run api:posts           # Get latest 5 posts
npm run test:windows        # Full API health test

# Database
npm run db:seed            # Populate sample data
npm run db:studio          # Open database GUI
npm run db:generate        # Regenerate Prisma client

# Development
npm run dev                # Start dev server
npm run build              # Production build
npm run lint               # Check for errors
```

---

**Need help?** Check QUICK_START.md for full setup instructions.
