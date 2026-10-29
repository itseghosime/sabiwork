# Image dependency licence review

Sourcery flagged the following npm licence metadata in PR #13. These are licence-policy findings, not CVE reports. The packages are transitive dependencies of the standard Next.js/Sharp image stack. The required Repository checks job passes; review-thread resolution is a separate merge requirement.

| Package | Locked version | Declared licence |
| --- | --- | --- |
| @img/sharp-libvips-darwin-arm64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-darwin-x64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-arm | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-arm64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-ppc64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-riscv64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-s390x | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-x64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linuxmusl-arm64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-libvips-linuxmusl-x64 | 1.3.4 | LGPL-3.0-or-later |
| @img/sharp-wasm32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| @img/sharp-win32-arm64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later |
| @img/sharp-win32-ia32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later |
| @img/sharp-win32-x64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later |

## Evidence and scope

The installed `@img/sharp-libvips-darwin-arm64` package declares LGPL-3.0-or-later and ships a README inventorying its bundled library licences. [Upstream packaging source](https://github.com/lovell/sharp-libvips) describes the precompiled shared libraries. [Sourcery’s scanner documentation](https://docs.sourcery.ai/security/findings/) distinguishes licence/policy findings from scanner status and records owner review decisions.

This PR does not modify, vendor or commit those binaries. npm installs the pinned upstream packages from the lockfile, retaining their supplied notices. This inventory does not declare a false positive, choose a licence for SabiWork or claim that every future distribution complies with all dependency obligations.

## Decision needed from the project owner

Review whether retaining the standard unmodified image dependencies is acceptable for this project and preserve applicable notices/source information when packaging or distributing it. If accepted, the 14 related review threads can be marked reviewed/resolved; the optional Sourcery check may remain red until its licence finding is triaged in Sourcery. No repository protections or security scanner rules were weakened by this code fix. If not accepted, select an alternative dependency/build approach before merging rather than editing away lockfile entries.

The code findings are addressed independently. Only Abdulrahman makes the licence acceptance and merge decision.

## Owner decision — 29 October 2026

Abdulrahman explicitly approved retaining the packages and resolving the 14 licence-review threads after reviewing this inventory. No security scanner policy, required check or branch protection was disabled. Applicable upstream notices remain part of installed packages. This records the owner’s project decision; it does not claim blanket compliance for future distributions.
