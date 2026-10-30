# Atlassian MCP Usage Guidelines

## Overview
This document defines the policy for interacting with Atlassian services (Jira, Confluence) through the Model Context Protocol (MCP).

## Core Principles

### Read-Only by Default
- **ONLY fetch and read** tickets, issues, and documentation
- **DO NOT post comments** without explicit user approval
- **DO NOT update status** or modify ticket fields
- **DO NOT create** new tickets or issues without permission

### Allowed Operations
The following read operations are permitted without approval:
- Fetch ticket details
- Search for issues
- Read ticket descriptions and comments
- Query ticket status and metadata
- List projects and boards
- Read Confluence pages

### Restricted Operations
The following operations **REQUIRE EXPLICIT USER APPROVAL**:
- Posting comments on tickets
- Updating ticket status
- Modifying ticket fields (assignee, priority, labels, etc.)
- Creating new tickets
- Deleting or archiving tickets
- Adding watchers or notifications
- Creating or modifying Confluence pages

## Workflow Pattern

### 1. Fetching Information
When asked to interact with Jira/Confluence:
```
✅ Fetch the ticket information
✅ Display relevant details to user
✅ Provide analysis or insights
```

### 2. Making Changes
When changes are needed:
```
1. ❌ DO NOT make changes automatically
2. ✅ Propose the specific changes
3. ✅ Ask for explicit approval
4. ✅ Wait for user confirmation
5. ✅ Execute only after approval
```

## Examples

### ✅ Correct Usage
```
User: "Check the status of PROJ-123"
Agent: [Fetches ticket] The ticket PROJ-123 is currently in "In Progress" 
      status, assigned to John Doe...
```

```
User: "What are the open P1 bugs?"
Agent: [Searches issues] I found 5 P1 bugs: PROJ-101, PROJ-105...
```

### ❌ Incorrect Usage (Without Approval)
```
User: "Check PROJ-123"
Agent: [Fetches ticket, then posts comment] ❌ WRONG
```

```
User: "Look at the high priority tickets"
Agent: [Searches and updates status] ❌ WRONG
```

### ✅ Correct Usage (With Approval)
```
User: "Add a comment to PROJ-123 about the fix"
Agent: I can add this comment: "Fix deployed to staging environment."
       Should I post this comment to PROJ-123?
User: "Yes"
Agent: [Posts comment] Comment added successfully.
```

## Best Practices

1. **Always confirm** before making any write operations
2. **Be specific** about what changes will be made
3. **Show the content** of comments/updates before posting
4. **Respect user control** over all modifications
5. **Default to read-only** mode unless explicitly instructed otherwise

## Exception Handling

If a user request implies a write operation:
1. Acknowledge the request
2. Explain what would be changed
3. Ask for explicit confirmation
4. Proceed only after approval

## Summary

**Read freely, write carefully.** Always maintain user control over any modifications to Atlassian services.
