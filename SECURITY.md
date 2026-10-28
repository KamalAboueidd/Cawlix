# Security Policy & Vulnerability Disclosure

**Cawlix Institutional Price Intelligence & Forensic Markdown Telemetry**

This document outlines the security architecture, data integrity protocols, and vulnerability reporting procedures governing the Cawlix platform, telemetry probes, API interfaces, and database infrastructure.

---

## 1. Supported Versions

Security patches and defensive integrity updates are actively backported to supported releases:

- **v2.x (Current Production):** Supported • Active Realtime Engine (React 18 + Supabase RLS) • Critical Patch SLA: < 24 Hours.
- **v1.x (LTS Maintenance):** Supported • Telemetry Engine & Micro-Scraper Adapters • Patch SLA: < 72 Hours.
- **< v1.0 (Legacy):** Unsupported • Deprecated experimental prototypes.

---

## 2. Infrastructure Security Matrix

Cawlix operates with strict zero-trust principles across all public and internal service boundaries:

### A. PostgreSQL Row-Level Security (RLS)
- All Supabase database tables enforce strict tenant isolation via PostgreSQL Row-Level Security policies.
- Authenticated JWT claims strictly bound all `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries to `auth.uid() = user_id`.
- Users and automated probes cannot read, mutate, or enumerate another tenant's tracked SKUs, alerts, or audit records.

### B. Cryptographic Ingestion & Baseline Verification
- Every retail price data point captured by domestic storefront probes is timestamped and verified against 90-day cryptographic hash baselines.
- Before an anomaly or ghost-discount alert is dispatched, multiple independent node samples must confirm price divergence within a 45-second sliding window to neutralize synthetic retailer glitch signals.

### C. Webhook & Alert Payload Signatures (HMAC-SHA256)
- Programmatic webhook transmissions and trader alert payloads are cryptographically signed using per-client private secret keys (`X-Cawlix-Signature: sha256=...`).
- Prevents Man-in-the-Middle (MITM) tampering, replay attacks, and unauthorized payload forgery.

### D. Probe Egress & Scraper Isolation
- Ingestion scraper adapters execute within isolated, ephemeral micro-workers with zero persistent disk access and strictly outbound-only egress network policies.
- Anti-bot counter-defenses adhere strictly to non-invasive public shelf reading without session hijacking or unauthorized private credential penetration.

### E. Encryption at Rest & in Transit
- **In Transit:** Enforced TLS 1.3 with HSTS (HTTP Strict Transport Security) preloading and Perfect Forward Secrecy across all endpoints.
- **At Rest:** Database volumes, backup snapshots, and encrypted secret vaults utilize AES-256-GCM.

---

## 3. Reporting a Vulnerability

We deeply appreciate and encourage responsible disclosure from security researchers, penetration testers, and the open-source community.

### Vulnerability Reporting Channels
If you identify a security defect, privilege escalation, RLS leak, authentication bypass, or data leakage flaw, please **do not open a public GitHub issue**.

Coordinate directly with our security lead via encrypted communication:

- **Primary Security Email:** [`security@cawlix.com`](mailto:security@cawlix.com)
- **Lead Engineer:** [`kamalaboueidd@gmail.com`](mailto:kamalaboueidd@gmail.com)
- **Subject Format:** `[SECURITY DISCLOSURE] - <Brief Vulnerability Description>`

### Please Include in Your Report:
1. **Target Component:** Specific endpoint, database table, scraper adapter, or UI route.
2. **Severity Assessment:** Your assessment of CVSS / impact (Low, Medium, High, Critical).
3. **Reproducible Steps:** Step-by-step reproduction instructions or a harmless Proof of Concept (PoC).
4. **Impact Analysis:** Detailed explanation of what an attacker could achieve.

---

## 4. Response Timeline & SLA Commitments

- **Initial Acknowledgment:** Within **24 hours** of submission receipt.
- **Triage & Reproducibility Assessment:** Within **48 hours** with severity scoring.
- **Hotfix & Patch Deployment:** Critical hotfixes deployed within **5 business days**; routine security patches within 14 days.
- **Public Advisory Coordination:** 90-day standard responsible disclosure window prior to any public release.

---

## 5. Responsible Disclosure Safe Harbor

Cawlix commits not to pursue legal action against security researchers who conduct security research under the following safe harbor terms:

- **Good Faith Intent:** Your research is conducted strictly for discovery and remediation, not personal enrichment or extortion.
- **Non-Destructive Testing:** You do not modify or destroy user data, cause service degradation, or execute Denial of Service (DoS/DDoS) attacks.
- **Privacy Preservation:** You do not access, extract, or retain private user credentials, personal identification records, or financial information.
- **Direct Coordination:** You give us reasonable time to remediate the defect before disclosing it publicly or to third parties.

---

## 6. Regulatory & Compliance Governance

- **Egyptian Consumer Protection Law (CPA Law No. 181/2018):** Anti-fraud baseline storage integrity complies with statutory digital retail transparency mandates.
- **Data Minimization:** No payment card data (PCI) is stored on Cawlix servers; authentication is handled through cryptographically secured Supabase Auth and Google OAuth 2.0 PKCE.

---

<div align="center">
  <sub>© 2026 Cawlix Inc. · Architecture & Security Lead: <a href="https://kamalaboueidd.site">Kamal Abou Eid</a></sub>
</div>
