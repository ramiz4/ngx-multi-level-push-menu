# Security policy

## Supported versions

Security fixes are provided for the latest release in the current major line.

| Version          | Security support                             |
| ---------------- | -------------------------------------------- |
| Latest `20.x`    | Supported                                    |
| `19.x`           | Legacy; not supported after `20.x` publishes |
| `18.x` and older | Not supported                                |

Angular 19 consumers cannot install the supported `20.x` line. They should upgrade Angular to version 20 or newer for supported security fixes. If a vulnerability also affects an older line, maintainers may publish an exceptional backport, but consumers should not rely on one.

## Reporting a vulnerability

Do not open a public issue, discussion, or pull request for a suspected vulnerability.

Prefer [GitHub private vulnerability reporting](https://github.com/ramiz4/ngx-multi-level-push-menu/security/advisories/new). If that channel is unavailable, email [me@ramizloki.com](mailto:me@ramizloki.com) with the subject `SECURITY: ngx-multi-level-push-menu`.

Include as much of the following as possible:

- Affected package version and Angular version
- Vulnerability class and expected impact
- Minimal reproduction or proof of concept
- Required user interaction or configuration
- Browser, server-rendering, and zoneless context where relevant
- Whether the issue is already public or has a disclosure deadline
- A suggested remediation, if known

Do not send real credentials, private production data, or an active exploit against systems you do not own.

## What to expect

Maintainers will try to acknowledge a complete report within seven days. This is a target, not a service-level guarantee. The report will be assessed privately, and the reporter may be asked for clarification or validation of a candidate fix.

When a report is accepted, maintainers will coordinate a remediation and disclosure plan appropriate to the severity. Credit is offered when desired, unless legal, privacy, or safety considerations prevent it. Please keep details confidential until a fixed release and advisory are available.

## Security boundaries

Reports are especially useful for:

- Script or markup execution through icon data
- Unsafe URL or external-link behavior introduced by the library
- Server-side rendering exposure of request or document data
- Cross-instance command or state leakage with a concrete security impact
- Dependency vulnerabilities reachable through the published runtime package
- Denial of service from realistically sized untrusted menu data

General bugs, accessibility defects without a security impact, unsupported-version problems, and application-specific authorization mistakes belong in public GitHub Issues.

## Safe use

- Treat menu labels, URLs, IDs, and consumer `data` as application input and enforce authorization in the application/router, not in navigation visibility alone.
- The inline icon renderer intentionally accepts only a strict SVG/path subset and never uses arbitrary consumer markup as `innerHTML`. Do not bypass it with DOM injection.
- Keep Angular, RxJS, this package, and the browser/server runtime on supported patched versions.
- Review links that deliberately override the default `_blank` relationship.

See [MAINTENANCE.md](MAINTENANCE.md) for the maintainer response and release process.
