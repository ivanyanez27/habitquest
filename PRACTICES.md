# Engineering Practices

> A living document of programming and design principles. Stack-agnostic. Each section explains _why_, not just _what_ — because a rule you don't understand is a rule you'll break the moment it's inconvenient.

---

## How to read this document

These are **principles**, not commandments. They have weight because they're earned — most come from a specific failure mode they prevent. When a principle here conflicts with the right thing to do for your situation, do the right thing and write down why.

The single thread running through everything below: **optimize for the reader, not the writer.** Code is read 10× more than it's written. Designs are used by people who didn't sit in the meeting. Choices that save you 30 seconds today often cost someone else (or future-you) hours later.

---

## Part 1 — Code

### 1.1 Naming

**Names are the smallest unit of documentation.** Most code has no comments; the names _are_ the explanation.

#### Be specific over clever

`getUserActiveSubscription()` beats `fetch()`. The former tells you what comes back; the latter forces the reader to open the function. Cleverness imposes a tax on every future reader.

#### Name by what, not how

`sortedByRecency` describes the result. `bubbleSortedItems` leaks the implementation. The implementation will change; the contract should not.

#### Length should match scope

A loop counter `i` is fine inside a 5-line block. A module-level export named `i` is hostile. **Variable name length should grow with the size of the scope it's used in.** Tiny scope, tiny name; large scope, descriptive name.

#### Avoid negation in booleans

`isVisible` reads cleanly. `isNotHidden` forces a double-negative read every time it's used. If you find yourself writing `if (!isNotHidden)`, the name has betrayed you.

#### Reserve `data`, `info`, `value`, `item`, `obj`

These tell the reader nothing. If `data` is the only word that fits, the variable is doing too many things and needs splitting.

---

### 1.2 Structure

#### Functions should do one thing at one level of abstraction

A function that opens a database connection, parses JSON, validates user input, _and_ sends an email is four functions wearing a trenchcoat. Each is testable alone; the combination is not.

The mixing of abstraction levels is the more subtle failure: if one line is `users.forEach(...)` and the next is `buffer[i++] = b & 0xff`, the reader has to context-switch inside the same function.

#### Keep functions small, but don't fetishize line counts

"≤10 lines" is a heuristic, not a law. A 40-line function with a single coherent purpose is fine. A 9-line function that does three unrelated things is not. Cohesion matters more than length.

#### Push side effects to the edges

Pure logic in the core, I/O at the boundary. A function that takes inputs and returns outputs — no network, no disk, no globals — is trivially testable, trivially reasoned about, trivially reused. The moment it reaches out into the world, all of that gets harder.

This is the most leveraged structural rule in software. Architectures that obey it (functional cores with imperative shells, hexagonal architecture, the Elm pattern) all win for the same reason.

#### Prefer composition over inheritance

Inheritance couples the child class to the parent's _internals_. Six months later, when the parent changes, the children break in ways nobody predicted. Composition — passing collaborators in — has a clear, narrow contract.

Use inheritance only when the relationship is genuinely "is-a" and stable. Use composition for everything else.

#### Group by feature, not by type

A folder structure of `controllers/`, `models/`, `views/` looks tidy until you ship a feature that touches all three and have to edit files in eight directories. Group code that changes together. Feature-folders make the codebase navigable by _intent_.

---

### 1.3 Types

#### Make illegal states unrepresentable

If your `User` type has `email: string` and `isEmailVerified: boolean`, you've created four states — two of which (`email: ""` + `isEmailVerified: true`) are nonsensical. Refactor to a discriminated union (`Unverified` | `Verified`) so the bad state simply cannot exist.

The compiler is the cheapest, most thorough reviewer you'll ever have. Give it more to check.

#### Avoid `any` (or your language's equivalent)

`any` is a request to disable the type checker for that location. Every `any` is a future runtime crash with no stack trace pointing at the cause. If you genuinely need it (an external boundary, a truly dynamic shape), narrow it as soon as possible with a parsing/validation step and a comment explaining why.

#### Parse, don't validate

A validator returns a boolean. A parser returns a _narrower type_. If you call `validate(input)` and proceed using the same loose `unknown`, every downstream function still has to defensively re-check. If you call `parse(input)` and get back a `User` type, every downstream function can trust it.

This is the single biggest type-safety upgrade most codebases can make.

#### Types are documentation that can't go stale

Comments lie. Types don't compile if they lie. Prefer expressive types over comments that describe shape.

---

### 1.4 Error handling

#### Errors are values, not surprises

Treat errors as part of the function's contract. A function that "might throw, depending" is a function with an undocumented second return type. Either make failure explicit in the signature (`Result<T, E>`, `Either`, tagged unions) or document the throw behavior at the boundary.

#### Fail fast at the boundary, recover gracefully in the core

Reject bad input the moment it crosses into your system — at the API endpoint, the form handler, the queue consumer. By the time data is deep in your code, it should be valid by construction. Defensive checks scattered through internal functions are a sign that the boundary isn't doing its job.

#### Distinguish expected failures from bugs

A user typing a bad password is _expected_; you handle it and respond. A null reference deep in your billing code is a _bug_; you log it loudly, fail the request, and fix the cause. Conflating these is how you end up with `try { ... } catch (e) {}` swallowing real defects for years.

#### Never log and re-throw

Pick one. Log-and-throw produces duplicate stack traces in your monitoring and gives the impression two things went wrong when only one did.

#### Preserve the cause

When you catch and re-throw, attach the original error (`throw new MyError('context', { cause: e })` in JS, `raise X from e` in Python). Stripping the cause is throwing away the only useful debugging information.

---

### 1.5 Comments

#### Write comments for the _why_, not the _what_

`// increment i` is noise. `// Skip the first row — it's the header row from the legacy export format` is gold. Code says what; comments say why.

#### Delete commented-out code

Version control exists. Commented-out blocks rot, mislead, and never get cleaned up. If you might need it later, that's what `git log` is for.

#### Comments are a code smell when they're explaining unclear code

If you need a comment to explain what a function does, the function probably needs a better name or a refactor. Comments are not a substitute for clarity; they're a supplement to it.

---

## Part 2 — Design (UI/UX)

### 2.1 First principles

#### The user has a goal — your job is to remove friction from it

Every screen, every click, every form field is an obstacle between the user and what they came to do. Justify each one. The best feature is often the one you didn't add.

#### Defaults are decisions

90% of users never change a default. The default is, effectively, the only setting that matters. Choose them with the same care you'd choose a feature.

#### Make the common case fast and the rare case possible

Optimizing for an edge case at the cost of the common case is the most common UX mistake. A "power user" feature buried two clicks deep is fine. The same depth for the daily-use feature is a daily tax.

---

### 2.2 Visual hierarchy

#### One primary action per screen

If everything is bold, nothing is. The user's eye should land on _the_ thing you want them to do. Secondary actions de-emphasized; tertiary actions in a menu.

#### Group related things; separate unrelated things

Proximity is the strongest cue of relatedness — stronger than borders, stronger than color. Two fields close together read as a pair; two fields with whitespace between them read as separate concepts. Use this deliberately.

#### Whitespace is a feature

Cramped interfaces feel cheap and stressful. Generous spacing reads as confident and calm. Spacing is free, and yet it's the most under-used design tool.

#### Consistency lets users predict

If "destructive actions are red" everywhere, users learn the language. If 80% of the app follows it and 20% doesn't, you've taught them nothing — every screen is a fresh puzzle. Pick conventions and hold them.

---

### 2.3 Forms and input

#### Ask for the minimum

Every field is a friction point. If you don't need it for this step, don't ask for it in this step. "Set up your profile later" beats a 12-field signup wall.

#### Validate at the right time

Validating on every keystroke before the user has finished typing is hostile ("Email invalid" on the third character). Validating only on submit makes them re-find the broken field. The right answer: validate on _blur_ (when they leave the field), and re-validate on submit. Show success cues, not just errors.

#### Error messages should explain how to fix it

"Invalid input" is useless. "Password must contain at least one number" is actionable. Treat error copy as part of the design.

#### Preserve user input on error

There is a special place reserved for software that wipes a form on validation failure. Don't go there.

---

### 2.4 Feedback and state

#### Every action needs a response within 100ms

Not necessarily completion — a spinner, a button state change, _something_ that says "I heard you." Users interpret silence as a broken click. Below 100ms feels instant; up to 1s feels responsive; beyond that, you need a progress indicator.

#### Show four states for every async operation

Idle, loading, success, error. Most bugs in UI come from a developer building only the happy path and the loading state, then production reveals the other two. Design all four up front.

#### Optimistic updates where you can afford them

If the operation almost always succeeds (liking a post, marking a habit done), update the UI immediately and reconcile if the server disagrees. Waiting for a round-trip on every click makes the app feel sluggish for no reason.

#### Empty states are real screens

A list with zero items is a screen the user _will_ see — on first use, after deleting everything, when filters match nothing. "No results" is a wasted opportunity; "No tasks yet — here's how to add one" is onboarding for free.

---

### 2.5 Accessibility

Accessibility is not a "nice to have." It's a baseline for shipping software that doesn't exclude people. It also tends to make the product better for everyone — captioned videos help in noisy rooms, high contrast helps in sunlight, keyboard navigation helps power users.

#### Semantic markup first

Use `<button>` for buttons, `<a href>` for links, `<h1>`–`<h6>` for headings. Screen readers, keyboard users, and search engines all rely on this. A `<div onClick>` looks identical visually and is broken for everyone using assistive tech.

#### Color is never the only signal

If the only thing distinguishing "error" from "success" is red vs. green, ~8% of men can't tell them apart. Add an icon, a label, a shape — something visible without color.

#### Contrast ratios matter

WCAG AA requires 4.5:1 for normal text, 3:1 for large text. "Looks fine on my MacBook in a dark room" is not a contrast test. Use a contrast checker; design for outdoor sunlight, not your monitor.

#### Tap targets ≥ 44×44 points

Smaller and you're punishing users with imprecise input — which is most users on phones, all users on cold days, anyone with a tremor.

#### Everything reachable by keyboard

Can you complete every primary task using only Tab, Enter, and arrow keys? If not, you've built something a portion of your users physically can't operate.

#### Respect user preferences

`prefers-reduced-motion`, `prefers-color-scheme`, system font size — the OS already knows what the user wants. Honor it instead of overriding it.

---

### 2.6 Component patterns

#### A component should have one job

If a component is named `<UserCardWithMenuAndModalAndAnalyticsTracker />`, it's four components. Split until each name is honest.

#### Make components controlled when possible

A component that owns its own state is convenient — until you need to lift the state up, sync it with another component, or test it. Controlled components (state passed in, changes emitted out) compose; uncontrolled ones don't. Default to controlled.

#### Props are an API; treat them like one

Adding a prop is easy. Removing one is a breaking change. Every prop you add now is a future migration. Be miserly about adding configuration options; ask whether two components would be clearer than one component with a `variant` prop.

#### Avoid prop drilling past 2–3 levels

If a prop is being threaded through multiple components that don't use it, lift it into context, a store, or a query — whichever fits. Drilling makes refactors painful and signals a structural problem.

---

## Part 3 — Security

> Security is not a feature to add at the end. It's a property of how the system is built. The biggest wins come from boring, foundational practices — not clever cryptography.

### 3.1 Secrets

#### Secrets never live in code

Not in source files, not in commit history, not in client bundles, not in error messages, not in logs. **Once a secret hits a Git history, treat it as compromised** — `git rm` doesn't remove it from clones, forks, or CI caches. Rotate, don't paper over.

#### Use environment variables for configuration, secret managers for secrets

Env vars are convenient but get leaked through `printenv`, crash dumps, error pages, and accidental log statements. For high-value secrets (production database passwords, signing keys), use a secrets manager (AWS Secrets Manager, GCP Secret Manager, Vault, Doppler).

#### Distinguish public from secret keys

Most APIs have both. The public key (e.g. a Supabase anon key, a Stripe publishable key) is _meant_ to ship to clients and is protected by other mechanisms (RLS, restricted scopes). The secret key (service role, secret key) must never reach the client. Mixing them up is one of the most common breaches.

#### Rotate on a schedule, and on every suspected exposure

If a secret might have leaked — laptop stolen, contractor offboarded, repo briefly public — rotate. Don't debate. The cost of rotating is hours; the cost of not rotating is unbounded.

---

### 3.2 Authentication

#### Never roll your own auth

Authentication looks simple and is not. Session fixation, timing attacks on password comparison, token replay, CSRF, secure cookie flags, password storage — there are dozens of footguns and you will hit some. Use a battle-tested library or hosted provider (Auth.js, Clerk, Supabase Auth, Auth0, Cognito).

#### Hash passwords with a slow, salted, modern algorithm

bcrypt, scrypt, or Argon2 — never MD5, SHA-1, or plain SHA-256. Speed is a _liability_ in password hashing; the slowness is what makes brute-forcing infeasible. If you're storing passwords yourself, you've already violated the previous principle.

#### Implement account lockout / rate limiting on auth endpoints

Without it, an attacker can try millions of passwords. With it, they get a handful before the account locks or the IP is throttled. This is one of the highest-leverage security controls you can add.

#### Multi-factor authentication for anything that matters

Passwords are guessable, phishable, and reused across sites. MFA — TOTP, passkeys, security keys — defeats the overwhelming majority of credential-stuffing attacks. Offer it; for admin accounts, require it.

#### Session tokens are bearer tokens — treat them accordingly

Whoever has the token is the user, until proven otherwise. Use HttpOnly + Secure + SameSite cookies for web sessions. Short expiry + refresh tokens for higher-value contexts. Invalidate on password change, on logout, on suspicious activity.

---

### 3.3 Authorization

#### Authentication ≠ authorization

Authentication answers "who are you?" Authorization answers "are you allowed to do this?" A logged-in user is not automatically permitted to view _every_ record in the database. Confusing the two is how mass data leaks happen.

#### Check authorization at every endpoint, not just in the UI

Hiding a button is not security; it's UX. The endpoint must independently check whether the requester is allowed to perform the action. Assume every API endpoint will be hit directly with crafted requests — because it will.

#### Default deny

Permission systems should start from "no access" and grant explicitly. The opposite — start from "all access" and revoke — leaks new resources by default whenever someone forgets to update the deny list.

#### Use row-level security or equivalent at the database

A bug in your application code can let User A request User B's data. A correctly-configured RLS policy makes that impossible at the database layer regardless of application bugs. Defense in depth: app-layer checks _and_ DB-layer enforcement.

---

### 3.4 Input handling

#### All input is hostile until proven otherwise

Form fields, URL parameters, headers, file uploads, webhook payloads, third-party API responses — _all_ of it. Validate shape, type, and bounds at the boundary. Never use raw input to construct queries, file paths, shell commands, or rendered HTML.

#### Use parameterized queries — always

String-concatenated SQL is how SQL injection happens. Every modern database driver supports parameterized queries. There is no situation where concatenation is the right answer.

#### Escape output by context

The escape rules for HTML, HTML attributes, JavaScript, CSS, and URLs are all different. Templating engines that auto-escape by context (React JSX, modern Jinja, etc.) handle this for you. If you're hand-building strings of HTML, you're going to get XSS eventually.

#### Validate file uploads aggressively

File extension is not file type. Content-Type header is user-controlled. Validate by magic bytes, cap size, scan for malware on anything user-facing, store outside the web root, serve through a handler that sets correct headers — not directly from disk.

#### Be paranoid about deserialization

Deserializing untrusted data into language objects (Java, Python pickle, PHP unserialize, .NET binary formatter) has a long history of remote code execution. Use data formats that can't execute code (JSON, MessagePack) and parse them into known schemas.

---

### 3.5 Transport and storage

#### HTTPS everywhere, no exceptions

There is no "internal" network in 2026. HTTP traffic is plaintext to anyone on the path. HSTS prevents downgrade. Modern certificates are free (Let's Encrypt). The only reason to serve HTTP is to redirect to HTTPS.

#### Encrypt sensitive data at rest

Database disk encryption, encrypted backups, encrypted secrets. The threat isn't always remote attackers — it's stolen laptops, decommissioned drives, snapshots accidentally made public.

#### Minimize what you store

You can't leak data you don't have. Every piece of PII you store is a future breach risk and (depending on jurisdiction) a regulatory liability. Ask whether you genuinely need each field, and for how long.

---

### 3.6 Operational security

#### Logs must not contain secrets or PII

Logs flow to many places — local files, log aggregators, third-party services, support tickets. Anything in them has a wide blast radius. Redact tokens, passwords, full credit card numbers, and PII at the log boundary.

#### Update dependencies; pin versions; audit periodically

The largest source of vulnerabilities in modern apps is outdated dependencies. Use `npm audit`, `pip-audit`, Dependabot, Renovate. Pin versions for reproducibility, but actually _review_ the renovate PRs — they're not noise.

#### Principle of least privilege

Every credential, every service account, every IAM role should have the minimum permissions needed. The CI runner doesn't need production database write access. The marketing dashboard doesn't need access to user passwords. Compromise is inevitable; blast radius is what you control.

#### Have an incident response plan before you need one

When something goes wrong, "what do we do" should not be a brainstorm. Document: who is on call, how to rotate credentials, how to revoke sessions, how to communicate with users, who has authority to take services offline. Practice it.

---

## Part 4 — Performance

> Performance is a feature. Slow software loses users, slow APIs lose customers, slow build pipelines lose engineering hours. The principles here are about _not paying for it later_.

### 4.1 First principles

#### Measure before optimizing

"I think this is slow" is wrong almost as often as it's right. Profile, benchmark, look at the actual data. Optimizing the wrong thing is worse than optimizing nothing — you've added complexity for no gain.

#### Optimize the hot path

90% of execution time happens in 10% of the code. Find that 10% (with a profiler, not a guess) and focus there. Micro-optimizing cold paths makes the code uglier with no measurable benefit.

#### The fastest operation is the one you don't do

Caching, memoization, batching, debouncing — these all win by _avoiding_ work, not doing it faster. Look for redundant work before looking for faster algorithms.

#### Performance budgets, not performance vibes

"It feels fast" varies by device, network, day. "Time-to-interactive ≤ 2s on a mid-range Android over 3G" is a target you can verify. Set budgets at the start of a project, enforce them in CI, and you avoid the slow drift toward bloat.

---

### 4.2 Algorithmic complexity

#### Big-O matters when N is big — and you don't always know when N gets big

That `O(n²)` algorithm runs fine on the 50 items you tested with. In production a customer hits it with 50,000 items and your service falls over. When N could grow unboundedly (user-submitted lists, log data, graph traversal), care about asymptotic complexity. When N is bounded and small (always 5 elements, always 2 sidebars), don't.

#### Hash maps and sets are usually the answer

If you find yourself scanning an array repeatedly to look something up, you've turned an `O(1)` operation into `O(n)`. Index it once into a map; pay constant time per lookup forever after. This single transformation accelerates more code than any other technique.

#### Don't sort if you only need the top K

A full sort is `O(n log n)`. Finding the top 10 items in a list of a million via a heap is `O(n log k)`. Match the algorithm to the actual question.

---

### 4.3 Memory and allocation

#### Allocations are not free

Every object allocated is work for the GC, cache pressure on the CPU, fragmentation in long-running processes. In hot loops, reuse buffers, pool objects, prefer primitives. In cold paths, don't bother — clarity wins.

#### Watch for accidental quadratic behavior in collections

Repeatedly concatenating strings in a loop, repeatedly inserting at the front of a list, repeatedly resizing an array — each operation looks innocent and is actually `O(n)`, making the loop `O(n²)`. Use a builder pattern, a deque, or pre-sized capacity.

#### Memory leaks in long-lived processes

Closures over large objects, event listeners that aren't removed, unbounded caches, growing arrays of metrics. In server processes and SPAs that live for days, these accumulate until the process dies. Cap caches, remove listeners on cleanup, watch heap profiles.

---

### 4.4 I/O — the largest performance lever

#### Most "slow code" is actually slow I/O

A poorly-written algorithm runs in microseconds. A network call takes hundreds of milliseconds. A disk seek takes tens. **Reducing I/O — fewer round trips, smaller payloads, parallelism — produces orders-of-magnitude wins that algorithmic tweaks cannot.**

#### Avoid the N+1 query pattern

Loading a list of 100 users and then loading each user's posts in a separate query = 101 queries. Eager-load with joins or batch IDs. This pattern is responsible for an enormous fraction of "the database is slow" complaints.

#### Batch and parallelize independent work

If you have 50 independent network calls, doing them sequentially is 50× slower than necessary. Use `Promise.all`, `asyncio.gather`, goroutines — whatever your stack offers. Just keep an eye on rate limits and downstream load.

#### Cache aggressively at the right layer

CDN for static assets, HTTP caching for unchanging API responses, in-memory caches for repeated computations, database query caches for expensive joins. The hardest part isn't adding caches; it's invalidating them — so cache only when you have a clear invalidation strategy.

---

### 4.5 Frontend performance

#### Initial load: ship less

The single biggest predictor of frontend performance is bundle size. Code-split routes, lazy-load heavy components, audit dependencies (one bloated package can dwarf all your application code). Server-rendered HTML for the initial paint, JS for interactivity after.

#### Images are usually the heaviest thing on the page

Serve appropriate sizes (`srcset`), modern formats (WebP, AVIF), lazy-load below the fold, set explicit width/height to prevent layout shift. An unoptimized hero image can be larger than the entire JS bundle.

#### Avoid re-renders that aren't producing different output

In component frameworks, a re-render that produces identical output is wasted work. Memoize where it matters (large lists, expensive computations) — but don't blanket-memoize, because the bookkeeping has its own cost.

#### Animation belongs on the GPU

Animate `transform` and `opacity`; avoid animating `width`, `height`, `top`, `left`, which trigger layout. The 60fps target is 16ms per frame — layout alone often blows that.

#### Interactivity > completeness

A page that's 80% loaded but responsive feels faster than a page that's 100% loaded but blocked behind a JS download. Ship the critical path first; let the rest stream in.

---

### 4.6 Backend and database performance

#### Indexes are usually the answer to "why is this query slow"

A full table scan over a million rows is slow. The same query against an indexed column is microseconds. Identify slow queries (every database has a tool for this), look at the query plan, add the index. Then _measure again_ — indexes have write costs and aren't always wins.

#### Connection pooling, not connection per request

Establishing a database connection is expensive. Connection pools (PgBouncer, built-in driver pools, serverless data APIs) reuse connections across requests. Without pooling, your database CPU spends most of its time on handshakes.

#### Async for I/O-bound work, threads/processes for CPU-bound work

Async (event loops) shines when you're waiting on the network or disk — you can hold thousands of pending operations cheaply. It does not help CPU-bound work; for that, use multiple threads or processes. Mixing them up — running CPU-heavy work in an async handler — blocks the event loop and tanks your throughput.

#### Pagination, always

Endpoints that return "all the things" work fine with 100 things and crash with 100,000. Paginate from day one — cursor-based for stable ordering, offset-based for simple cases. The migration is much harder later than the small upfront cost now.

---

### 4.7 Build and developer-loop performance

#### Slow feedback loops are the biggest productivity drain

A test suite that takes 10 minutes is run once per PR. A test suite that takes 30 seconds is run before every commit. The faster loop produces dramatically higher-quality code because the engineer is in the loop, not waiting on it. Treat developer iteration speed as a first-class engineering goal.

#### Cache CI aggressively

Every CI run that re-downloads dependencies, re-builds untouched modules, re-runs unaffected tests is wasted time multiplied by every PR every day. Layer caching, dependency caching, test-impact analysis — the savings compound.

#### Parallelize tests

Most test suites run sequentially out of the box and can be 4–8× faster with parallelization. Make sure tests are isolated (no shared global state, no shared database row IDs) and let the runner spread them across cores.

---

## Part 5 — Cross-cutting principles

A few rules that don't fit neatly into a category but apply everywhere.

#### Make the change easy, then make the easy change

If a change feels hard, the right move is often _not_ to power through. It's to first refactor the code into a state where the change is easy, then make it. Two small clean commits beat one large messy one.

#### Boring technology, by default

The shiny framework released last month has no Stack Overflow answers, no production track record, and no idea what its weak points are. Boring tech is boring because it works. Save your innovation budget for the parts of your system that genuinely need it; spend the rest on Postgres.

#### Optimize for change, because change is the only constant

Every system will be modified more times than you expect. The codebase that's easy to modify wins, even if the original version was uglier. Tight coupling, clever optimizations, and over-specific abstractions all penalize the future.

#### Write things down

Decisions, conventions, gotchas, post-mortems — anything that took thought to figure out. The brain that figured it out won't be available next year, or next week, or sometimes next morning. Documentation is a gift to future you, who has forgotten everything.

#### When in doubt, do the simpler thing

Every layer of abstraction, every configuration option, every "what if we need it later" feature has a permanent maintenance cost. The simpler version can always be made more complex; the more complex version is much harder to simplify back. Bias toward less.

---

_Document version 0.1. This file is meant to evolve — add what you learn, remove what stops being true._
