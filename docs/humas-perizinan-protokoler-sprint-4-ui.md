# HUMAS Perizinan & Protokoler — Sprint 4 UI Integration

## Implemented

### Authenticated API
- \`permit-workspace\` now returns operational KPI summary.
- Permit list/detail projections include priority and SLA fields.
- Permit detail returns private internal notes and communication records through the authenticated server API only.
- \`permit-service-level\` updates priority, first-response deadline, resolution deadline, and SLA pause/resume state.
- \`permit-internal-notes\` supports authenticated read and staff-only append.
- \`permit-communications\` supports authenticated read and staff-only append.
- \`permit-operational-summary\` exposes the operational KPI summary to HUMAS readers.

### Workspace UI
- Operational KPI cards: open, unassigned, urgent/high priority, overdue response, overdue resolution, follow-ups due, and overdue protocol tasks.
- Permit detail: priority, response/resolution SLA state, pause state and pause reason.
- Staff-only forms for SLA management, private notes, and communication logs.
- Communication log supports channel, direction, contact, subject, summary, contact time and follow-up time.
- Protocol agenda detail includes readiness percentage, completed checklist count, overdue tasks, unassigned tasks, and guest confirmation/attendance count.
- UI follows existing HUMAS glass styles and responsive breakpoints.

## Access and privacy

- Read endpoints require an authenticated HUMAS read role.
- Write operations require active staff HUMAS authorization; database RPCs independently enforce the same role.
- Internal notes and communication logs are never queried by public permit tracking endpoints.
- Public permit response shapes remain unchanged.
- No browser role receives direct table grants for internal activity tables.

## Validation

- JavaScript syntax checks passed for HUMAS API, workspace UI, and both updated test files.
- Static assertions cover Sprint 4 API operations, privacy boundary, UI controls, SLA, internal notes, communications and agenda readiness.
- Production migration 017 is already applied.
- Full Node test execution and live authenticated UI smoke testing still require CI/runtime execution and a real HUMAS account session.

## Deployment constraints

- Existing Vercel cron configuration is unchanged.
- No new scheduled job was introduced.
- Existing public permit application and tracking pages are unchanged.
