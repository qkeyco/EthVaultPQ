#!/bin/bash

# EthVaultPQ Status Line
input=$(cat)

# Extract values from JSON
model=$(echo "$input" | jq -r '.model.display_name // "Unknown"')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // "~"')

# Token usage (input_tokens + output_tokens)
input_tokens=$(echo "$input" | jq -r '.usage.input_tokens // 0')
output_tokens=$(echo "$input" | jq -r '.usage.output_tokens // 0')
total_tokens=$((input_tokens + output_tokens))
token_limit=200000
tokens_left=$((token_limit - total_tokens))

# Format tokens in K for readability
tokens_used_k=$((total_tokens / 1000))
tokens_left_k=$((tokens_left / 1000))

# Color code based on usage (80%, 90%, 95% thresholds)
if [ $total_tokens -gt 190000 ]; then
    token_status=" [${tokens_used_k}K/200K 🔴]"
elif [ $total_tokens -gt 180000 ]; then
    token_status=" [${tokens_used_k}K/200K ⚠️]"
elif [ $total_tokens -gt 160000 ]; then
    token_status=" [${tokens_used_k}K/200K ⚡]"
else
    token_status=" [${tokens_used_k}K/200K]"
fi

# Active stash context (check symlink)
stash_context=""
if [ -L "$cwd/.claude/CURRENT_WORK.md" ]; then
    context_file=$(readlink "$cwd/.claude/CURRENT_WORK.md" 2>/dev/null)
    if [ -n "$context_file" ]; then
        context_name=$(basename "$context_file" .md)

        # Calculate tokens since last stash
        token_file="$HOME/.claude/tokens-${context_name}.txt"
        last_stash_tokens=0

        if [ -f "$token_file" ]; then
            last_stash_tokens=$(cat "$token_file" 2>/dev/null || echo 0)
        fi

        tokens_since_stash=$((total_tokens - last_stash_tokens))
        tokens_since_k=$((tokens_since_stash / 1000))

        # Show context with tokens since last stash
        if [ $tokens_since_stash -gt 0 ]; then
            stash_context=" [ctx:$context_name +${tokens_since_k}K]"
        else
            stash_context=" [ctx:$context_name]"
        fi
    fi
elif [ -f "$cwd/.claude/CURRENT_WORK.md" ]; then
    # Fallback: not a symlink but file exists
    stash_context=" [ctx:default]"
fi

# Git branch
git_branch=""
if [ -d "$cwd/.git" ]; then
    git_branch=$(cd "$cwd" && git -c core.useBuiltinFSMonitor=false rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ -n "$git_branch" ]; then
        git_branch=" [git:$git_branch]"
    fi
fi

# Node version (should be 18.x for EthVaultPQ)
node_version=$(node --version 2>/dev/null | sed 's/v//')
node_status=""
if [ -n "$node_version" ]; then
    major_version=$(echo "$node_version" | cut -d. -f1)
    if [ "$major_version" = "18" ]; then
        node_status=" [node:$node_version ✓]"
    else
        node_status=" [node:$node_version ⚠️]"
    fi
fi

# Dashboard status (port 5175 for EthVaultPQ)
dashboard_status=""
if lsof -i :5175 -sTCP:LISTEN -t >/dev/null 2>&1; then
    dashboard_status=" [dashboard:5175 ✓]"
fi

# Network context - EthVaultPQ specific
network_context=""
if echo "$cwd" | grep -q "contracts"; then
    network_context=" [Contracts]"
elif echo "$cwd" | grep -q "dashboard"; then
    network_context=" [Dashboard]"
elif echo "$cwd" | grep -q "metamask-snap"; then
    network_context=" [Snap]"
fi

# Deployment target
deployment_target=" [→Tenderly]"

# Build final status line
printf "${model}${stash_context}${token_status}${git_branch}${node_status}${dashboard_status}${network_context}${deployment_target}"
