# API Documentation

Reference material for people integrating against your API.

Reference is a **lookup surface, not a narrative.** The reader arrives with a specific question,
mid-task, often mid-bug. Optimize for finding one fact fast, not for reading.

---

## What separates useful API docs from a schema dump

A generated schema tells you the shape. It does not tell you what happens when things go wrong, what
the constraints mean, or which of six causes produced the 422 you are staring at.

Three things carry most of the value, and none are generated:

1. **Every error, with its cause and what to do about it**
2. **Realistic examples**, not type placeholders
3. **Behavioral notes** — idempotency, rate limits, ordering, eventual consistency

Everything else can come from a schema. These cannot.

---

## Per endpoint

````markdown
### POST /api/exports

Creates an export job. Returns immediately; the export runs asynchronously.

**Auth**: Bearer token. Requires `exports:write` on the target workspace.
**Idempotent**: Yes, via `Idempotency-Key`. Replays return the original response.
**Rate limit**: 10/minute per workspace.

#### Parameters
| Name | In | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| `workspace_id` | body | string | yes | — | Must be a workspace you can access |
| `format` | body | enum | no | `csv` | `csv` \| `json` \| `parquet` |
| `filters` | body | object | no | `{}` | See Filters |
| `Idempotency-Key` | header | string | no | — | Recommended. 24h retention |

#### Request
```json
{
  "workspace_id": "ws_8fk20alz",
  "format": "csv",
  "filters": { "created_after": "2026-01-01T00:00:00Z" }
}
```

#### Response — 202 Accepted
```json
{
  "id": "exp_3jd8skq2",
  "status": "queued",
  "created_at": "2026-07-30T14:22:01Z",
  "estimated_rows": 14203
}
```

#### Errors
| Status | Code | Cause | Client should |
|---|---|---|---|
| 400 | `INVALID_FORMAT` | `format` is not a supported value | Fix the value; do not retry as-is |
| 401 | `UNAUTHENTICATED` | Missing or expired token | Refresh and retry once |
| 403 | `MISSING_SCOPE` | Token lacks `exports:write` | Re-authorize with the scope |
| 404 | `WORKSPACE_NOT_FOUND` | Workspace does not exist, or you cannot access it | Verify the ID |
| 409 | `IDEMPOTENCY_CONFLICT` | Same key, different payload | Use a new key |
| 422 | `FILTER_TOO_BROAD` | Estimated rows exceed 5,000,000 | Narrow the filters |
| 429 | `RATE_LIMITED` | Over 10/minute | Back off per `Retry-After` |
````

---

## The error table

The section people open your documentation for. Two rules make it useful.

**Distinguish causes that share a status.** A 422 with six possible causes needs six rows. "422:
validation failed" sends the reader to your source code, which is the failure this document exists
to prevent.

**Say what the client should do**, not just what happened. Retry, fix and retry, do not retry,
re-authorize, back off. That column is what turns a reference into something a client integration
can be built against.

**Note the 404-for-403 case explicitly** when you do it. A reader debugging a 404 on a record they
know exists will lose an hour otherwise. One line: *"Returns 404 rather than 403 for workspaces you
cannot access, so responses do not confirm existence."*

---

## Examples

**Realistic values, always.** `"name": "string"` teaches nothing. `"name": "Acme Corp"` shows shape,
plausible length, and character set.

Use IDs shaped like real IDs. `"id": "exp_3jd8skq2"` tells the reader they are opaque strings with a
type prefix, not integers — which prevents a whole class of client bugs.

Show a **complete** request and response, not fragments. A reader copying a fragment has to guess at
the envelope, and they will guess wrong.

Include one **error response body**, so the shape of failures is known:

```json
{
  "error": {
    "code": "FILTER_TOO_BROAD",
    "message": "This export would include 8,204,111 rows. The limit is 5,000,000.",
    "details": { "estimated_rows": 8204111, "limit": 5000000 }
  }
}
```

State the contract explicitly: **`code` is stable and safe to branch on; `message` is for humans and
may change.** Clients that parse `message` break on a copy edit, and they will blame you.

---

## Behavioral notes

The things a schema cannot express, and the things integrations actually break on.

| Note | Why it matters |
|---|---|
| **Idempotency** | Which methods, what key, what retention, what happens on a key collision with a different payload |
| **Rate limits** | The number, the window, the scope (per token? per workspace?), and which headers report remaining quota |
| **Pagination** | Cursor or offset, default and max page size, whether the cursor is stable across writes |
| **Ordering** | Guaranteed, or arbitrary? An unstated ordering will be depended on |
| **Consistency** | Does a write appear immediately in a subsequent read? Say so if not |
| **Async behavior** | 202 means queued, not done. How does the client learn it finished — poll, webhook? |
| **Deprecation** | What is going away, when, and what replaces it |

**Eventual consistency is the most commonly omitted and most expensive.** A client that writes then
immediately reads, and gets stale data, will file a bug against you and build a retry loop. One
sentence prevents both.

---

## Versioning and deprecation

State what counts as breaking, so clients know what they can rely on:

> **Additive changes are not breaking.** New optional fields, new endpoints, and new enum values may
> appear without a version change. Clients must ignore unknown fields.
>
> **Breaking:** removing a field, narrowing a type, adding a required parameter, changing an error
> code, changing a default.

That first paragraph is doing work — it tells clients to write tolerant parsers, which is what makes
additive evolution possible at all.

For deprecations: what is deprecated, the removal date, what replaces it, and a migration example.
A deprecation notice without a migration path generates support load proportional to your user count.

---

## Generated versus written

Generate what changes with the code; write what does not.

| Generate | Write |
|---|---|
| Parameter names, types, required flags | Error causes and remedies |
| Response schemas | Behavioral notes |
| Endpoint inventory | Realistic examples |
| Enum values | Conceptual overview |

Generated reference cannot drift, which is its whole value. But a purely generated reference is a
schema dump — the hand-written parts are where the usefulness is. Keep them in a form that survives
regeneration, not in comments the generator overwrites.

---

## Anti-patterns

- **"422: validation failed."** Six causes, one row. The reader opens your source.
- **No "client should" column.** Describes the past, not what to do.
- **`"name": "string"` as an example.** Teaches nothing about shape or size.
- **Fragments instead of complete request/response.** The reader guesses the envelope wrong.
- **No error response body shown.** The failure shape is unknown until production.
- **Not stating that `message` is unstable.** Clients parse it and break on a copy edit.
- **Undocumented eventual consistency.** A bug report and a retry loop.
- **Unstated ordering.** It will be depended on.
- **A deprecation with no migration path.** Support load proportional to user count.
- **A purely generated reference.** A schema dump with a table of contents.
- **Hand-written notes in generator-owned comments.** Overwritten on the next build.
