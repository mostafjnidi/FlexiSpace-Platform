# Council Transcript — FlexiSpace Typography Token Reference
**Date:** 2026-05-17  
**Question:** Is this Typography Token Reference a good, complete, and internally consistent design system?

---

## The Question (Framed)

FlexiSpace is a dark premium SaaS workspace booking platform (React 19 + Vite + Tailwind CSS). The team has written a Typography Token Reference covering font families, header bar, sidebar, page titles, section headings, KPI cards, tables, badges, forms, buttons, mobile nav, and drawers. 25 violations were confirmed across 4 of 20+ pages. Should the team adopt it, fix it, or rebuild it?

---

## Advisor Responses

### The Contrarian

The font-fraunces rule is a ticking time bomb. "Public H1 only" — but the Page Title Block H1 uses font-inter. The spec contradicts itself by never defining a public-page H1 token inside the dashboard context. Drift within weeks.

The mono font at text-[11px] everywhere is a visual monotony trap. Every label, badge, timestamp, eyebrow, sidebar group, table header, and mobile nav item renders identically. Zero hierarchy within the mono layer. When everything screams the same thing, nothing communicates.

The close button is w-8 h-8 (32px). Every other interactive element is 44px. WCAG 2.5.5 failure sitting right in the document.

Color token vocabulary is dangerously thin. ink and ink-2 have no documented contrast ratios. ink-2 on bg-2 in table cells — not verified to pass AA.

Danger button text-[12px] vs primary CTA text-[13px] — one pixel, no rationale, will get inconsistently implemented.

No disabled state token. No focus-visible ring spec. No loading/skeleton state. These cover ~30% of real SaaS dashboard interaction states.

Forbidden patterns list bans without explaining why — enforcement becomes tribal knowledge.

---

### The First Principles Thinker

This is solving developer consistency, not typography. Meaningful goal, but dressed up as a design system — the conflation creates hidden fragility.

**What it gets right:** The three-role font split has genuine semantic logic. Mono = machine-generated data. Inter = human-readable prose. Fraunces = brand moment. Defensible information hierarchy, not arbitrary taste.

**Where it breaks down:** The spec is enumerative rather than principled. It lists every surface instead of stating the rule once. Every new component requires a human judgment call followed by a doc update. The system does not scale — it just documents what already exists.

**Unanswered questions:**
- What is the contrast ratio floor for text-neutral on dark backgrounds?
- Why text-[30px] for both H1 and stat numbers with no differentiation rationale?
- What governs new components? No decision rule, only a lookup table.
- font-mono for mobile nav — mono = data precision, nav = wayfinding. Applied too broadly.

**Real verdict:** This is a well-maintained style inventory, not a type system. An inventory breaks when you add the 21st page. A system generates its own answers. Write three governing rules that produce the table — rather than the table itself.

---

### The Executor

The system is implementable. Well-suited for mechanical fixes.

**Hour 1 — Audit first, touch nothing:**
```bash
grep -rn "font-inter" --include="*.jsx" -l          # files needing label/badge/TH audit
grep -rn "font-fraunces" --include="*.jsx" -l        # illegal admin usage
grep -rn 'text-\[10px\]' --include="*.jsx"           # forbidden size
grep -rn 'text-\[22px\]\|text-\[24px\]\|text-\[18px\]' --include="*.jsx"  # H2 violations
```

**Hour 2-3 — Batch by violation type, not by page.** Fix all TH violations across every file before moving to stat labels. Seven categories, seven focused passes.

**Hour 4 — The one hard call:** font-fraunces in admin Global Command panel is gone. Spec is absolute.

What makes this fast: every fix is binary. Wrong class out, right class in. No design decisions. Junior dev can do passes 1-6. Only fraunces audit needs senior eye.

**Risk:** H2 size fixes — confirm text-[16px] font-semibold doesn't visually break hierarchy before committing.

---

## Chairman Synthesis

### Where the Council Agrees

The spec is implementable but fundamentally incomplete. All three advisors independently reached the same structural diagnosis: the document is a **style inventory masquerading as a system**. It catalogues decisions without encoding the rules that produced them. The 25 confirmed violations across only 4 files — with 16+ pages unscanned — prove enforcement is already failing.

### Where the Council Clashes

The Executor says "fix it mechanically." The First Principles Thinker says "rename it and write governing rules." The Contrarian says the foundation has load-bearing cracks. All three are right at different time horizons:
- **This week:** Executor is correct
- **Month 3:** First Principles is correct  
- **Month 6:** Contrarian is correct

### Blind Spots the Council Caught

- Close button at w-8 h-8 (32px) fails WCAG 2.5.5 — audit liability
- No disabled state, no focus-visible ring, no skeleton token — covers ~30% of real interaction states
- font-fraunces "public H1 only" is self-contradicting with no definition of "public" inside dashboard context
- Mono layer has zero internal hierarchy — 11px everywhere creates noise parity, not information hierarchy

### The Recommendation

**Fix it, then formalize it.** The three-role font split (mono=machine data, inter=human prose, fraunces=brand moment) is semantically defensible. Do not rebuild. Do not adopt as-is — 25 violations in 4 files proves the system is already losing. Fix mechanical violations now, then write three governing rules that replace the lookup table.

### The One Thing To Do First

Run the Executor's four greps across all remaining pages before touching a single line of code. You do not know your actual violation count. Scan everything first. The mechanical fixes take hours. The audit saves you from fixing the wrong things twice.

---

## Confirmed Violations (25 across 4 files scanned)

| Severity | File | Line | Violation | Fix |
|----------|------|------|-----------|-----|
| 🔴 Critical | OwnerDashboard.jsx | 626 | font-fraunces in admin H2 | font-inter text-[16px] font-semibold |
| 🔴 High | OwnerDashboard.jsx | 541,557,573,589 | 4× KPI labels font-inter | font-mono text-[11px] uppercase tracking-[.14em] text-neutral |
| 🔴 High | BookingsCommandCenter.jsx | 929,950,970,984 | 4× KPI labels font-inter | font-mono text-[11px] uppercase tracking-[.14em] text-neutral |
| 🔴 High | BookingsCommandCenter.jsx | 1079-1084 | 5× TH font-inter | font-mono text-[11px] uppercase tracking-[.14em] text-neutral |
| 🟠 Medium | OwnerDashboard.jsx | 604 | H2 text-2xl/text-3xl | font-inter text-[16px] font-semibold |
| 🟠 Medium | CommandCenter.jsx | 774,795 | 2× H2 text-[22px] font-bold | font-inter text-[16px] font-semibold |
| 🟠 Medium | CommandCenter.jsx | 831,843 | 2× H2 text-[18px] font-bold | font-inter text-[16px] font-semibold |
| 🟠 Medium | NodeManager.jsx | 1012 | H2 text-[24px] | font-inter text-[16px] font-semibold |
| 🟠 Medium | CommandCenter.jsx | 465 | H3 text-[16px] | font-inter text-[13px] font-semibold |
| 🟠 Medium | NodeManager.jsx | 640 | H3 text-[15px] | font-inter text-[13px] font-semibold |
| 🟡 Low | BookingsCommandCenter.jsx | 462 | PaymentBadge font-inter | font-mono text-[11px] uppercase tracking-[.14em] |
| 🟡 Low | CommandCenter.jsx | 852 | font-mono text-[13px] | font-mono text-[11px] |
| 🟡 Low | NodeManager.jsx | 966 | text-neutral-2 on metric label | text-neutral |

**16+ pages not yet scanned.**

---

## Recommended Next Steps

1. **Run full audit** (4 grep commands above) across all 20+ pages
2. **Fix Critical first:** Remove font-fraunces from OwnerDashboard.jsx:626
3. **Batch High:** Fix all KPI stat labels and TH headers across all files
4. **Batch Medium:** Fix H2/H3 sizes — visually verify before committing
5. **Batch Low:** Badge font-family fixes, mono size fixes
6. **Then formalize:** Write 3 governing rules + add WCAG contrast floors to the spec
7. **Add missing tokens:** disabled state, focus-visible ring, loading/skeleton

---

*LLM Council methodology by Andrej Karpathy. Claude Code adaptation. 2026-05-17*