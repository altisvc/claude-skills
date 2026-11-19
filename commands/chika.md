# /chika

Run the enforced design loop: nine steps, up to three rounds, across your composition doctrine, design advisor, craft reviewer, and framework skills.

## Usage

```
/chika <slug> <surface>          start a loop
/chika status [<slug>]           where it stands and what the next step demands
/chika resume <slug>             pick up a loop from an earlier session
```

## Examples

```
/chika research-coverage http://localhost:3000/research
/chika pricing-card site/pricing.html
/chika sector-matrix https://staging.example.com/research
/chika status research-coverage
```

## The nine steps

1. **Frame** — surface, output system, what it must prove, inventory the real components
2. **Composition plan** — spec before any code
3. **Advisor direction consult** — on the spec, pre-build; editorial findings are blockers
4. **Build** — you execute, framework skills for implementation
5. **Capture** — live screenshots at branch HEAD, desktop and mobile, plus a passing render lint
6. **Advisor review** — the renders, both viewports
7. **Composition review** — against the live surface, not the screenshots alone
8. **Craft polish** — on-token chrome pass plus the deterministic detector
9. **Verify & gate** — re-capture and re-lint after the fixes, confirm the step-6 findings are resolved

Steps 6, 7 and 8 run in parallel in one message. A `fix` verdict rotates to step 4 for another round. Three rounds is the cap; past that it escalates to a human.

The surface is something a browser can open: the URL of the running page, or a static HTML file. For a framework page, pass the URL, not the source file.

## Behavior

Invokes the `chika` skill. Each step boundary goes through `scripts/chika-loop.mjs`, which checks the evidence against the filesystem before unlocking the next step: findings files must exist and be non-empty, screenshots must be real PNGs at the declared viewport, and step 9's captures must postdate step 5's so a fix cannot be "verified" with the renders that showed the defect.

The loop cannot be skipped silently. It can still be skipped loudly, by saying so — which is the point.
