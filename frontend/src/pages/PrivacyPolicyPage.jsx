import { useEffect } from "react";

import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const sectionHeading =
  "mt-12 text-2xl font-bold text-foreground sm:text-3xl";
const subHeading = "mt-8 text-xl font-semibold text-foreground";
const paragraph = "mt-4 text-base leading-relaxed text-muted";
const listClass = "mt-4 list-disc space-y-2 pl-6 text-base text-muted";
const tableWrapper =
  "mt-6 overflow-x-auto rounded-xl border border-border/60 bg-card";
const tableClass = "w-full text-left text-sm";
const thClass =
  "border-b border-border/60 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground";
const tdClass =
  "border-b border-border/40 px-4 py-3 align-top text-muted last:border-b-0";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="-mt-16 pt-16">
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <header className="border-b border-border/60 pb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Legal
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-muted">
              GDPR Compliant · inTouch — Connection is the best medicine
            </p>
            <p className="mt-2 text-sm text-muted">
              Last updated: May 24, 2026
            </p>
          </header>

          <h2 className={sectionHeading}>1. Introduction</h2>
          <p className={paragraph}>
            inTouch (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a
            care-coordination platform that helps families and caregivers
            manage the health of elderly loved ones — including medication
            schedules, wellness records, and care event logs. We are committed
            to protecting the personal data of all users and the seniors they
            care for, in accordance with the General Data Protection Regulation
            (EU) 2016/679 (&ldquo;GDPR&rdquo;).
          </p>
          <p className={paragraph}>
            This Privacy Policy explains what personal data we collect, why we
            collect it, how we process it, and what rights you have as a data
            subject.
          </p>

          <h2 className={sectionHeading}>2. Data Controller</h2>
          <p className={paragraph}>
            The data controller responsible for your personal data is the
            organization or individual operating the inTouch instance you are
            using. If you are using inTouch as deployed at a hackathon or pilot
            context, requests regarding your data can be directed to the
            project maintainers via the contact information provided at
            registration.
          </p>

          <h2 className={sectionHeading}>3. Personal Data We Collect</h2>

          <h3 className={subHeading}>3.1 Caregiver (User) Data</h3>
          <p className={paragraph}>
            When you register and use inTouch, we collect:
          </p>
          <ul className={listClass}>
            <li>
              <strong className="text-foreground">Identity data:</strong> full
              name, email address
            </li>
            <li>
              <strong className="text-foreground">Authentication data:</strong>{" "}
              hashed password (bcrypt), Google OAuth ID token (if you use
              Google Sign-In), two-factor verification codes (transient, not
              stored after use)
            </li>
            <li>
              <strong className="text-foreground">Session data:</strong> signed
              JWT tokens stored client-side in your browser&apos;s localStorage
            </li>
            <li>
              <strong className="text-foreground">Account metadata:</strong>{" "}
              account creation timestamp, role (caregiver or admin)
            </li>
          </ul>

          <h3 className={subHeading}>3.2 Senior Profile Data</h3>
          <p className={paragraph}>
            When you create and manage senior profiles, we collect:
          </p>
          <ul className={listClass}>
            <li>
              Name, age, diagnoses, and contact information relating to the
              senior
            </li>
            <li>
              This data is entered by you as a caregiver and is linked to your
              account
            </li>
          </ul>

          <h3 className={subHeading}>3.3 Medication Data</h3>
          <ul className={listClass}>
            <li>Medication names, schedules, and dosing times</li>
            <li>Daily adherence status (&ldquo;taken today&rdquo; flag)</li>
            <li>Timestamps of medication records</li>
          </ul>

          <h3 className={subHeading}>3.4 Care Ledger Data</h3>
          <ul className={listClass}>
            <li>
              Care event records (e.g., medication administered, diagnoses
              updated)
            </li>
            <li>Timestamps and caregiver identity attached to each event</li>
            <li>
              SHA-256 hash chain values linking ledger entries (for integrity
              verification)
            </li>
          </ul>
          <p className={`${paragraph} rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3`}>
            <strong className="text-foreground">Important:</strong> The Care
            Ledger is append-only and tamper-evident by design. Once an entry
            is written, it cannot be silently edited or deleted — this is a
            core feature, not a limitation. Any deletion request for ledger
            entries will be assessed in accordance with Article 17 GDPR and the
            applicable legal basis for processing (see Section 5).
          </p>

          <h3 className={subHeading}>3.5 Call Log Data</h3>
          <ul className={listClass}>
            <li>AI-generated summaries of wellness calls</li>
            <li>Health flags extracted from calls</li>
          </ul>

          <h3 className={subHeading}>3.6 Technical Data</h3>
          <ul className={listClass}>
            <li>
              IP addresses and browser/device metadata collected incidentally
              through standard HTTP requests
            </li>
            <li>
              No cookies beyond those necessary for session management are set
            </li>
          </ul>

          <h2 className={sectionHeading}>4. Special Category Data</h2>
          <p className={paragraph}>
            Health-related information about seniors (diagnoses, medication
            records, call health flags) constitutes{" "}
            <strong className="text-foreground">special category data</strong>{" "}
            under Article 9 GDPR. We process this data on the basis of{" "}
            <strong className="text-foreground">explicit consent</strong>{" "}
            provided by the caregiver acting on behalf of the senior, and/or on
            the basis of{" "}
            <strong className="text-foreground">vital interests</strong>{" "}
            (Article 9(2)(c)) where health management is the direct purpose of
            the platform.
          </p>
          <p className={paragraph}>
            You are responsible for ensuring that the seniors whose data you
            enter have given appropriate consent or that you have a legitimate
            legal basis to enter and manage their data on their behalf.
          </p>

          <h2 className={sectionHeading}>5. Legal Basis for Processing</h2>
          <div className={tableWrapper}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Data Type</th>
                  <th className={thClass}>Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdClass}>
                    Account registration &amp; authentication
                  </td>
                  <td className={tdClass}>
                    Article 6(1)(b) — performance of a contract
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>
                    Senior profile &amp; medication data
                  </td>
                  <td className={tdClass}>
                    Article 6(1)(a) — consent; Article 9(2)(a) — explicit
                    consent for health data
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>Care Ledger entries</td>
                  <td className={tdClass}>
                    Article 6(1)(f) — legitimate interests (integrity,
                    accountability, care continuity)
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>
                    AI call summaries &amp; health flags
                  </td>
                  <td className={tdClass}>Article 6(1)(a) — consent</td>
                </tr>
                <tr>
                  <td className={tdClass}>Technical/session data</td>
                  <td className={tdClass}>
                    Article 6(1)(b) — necessary to provide the service
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>Admin user management</td>
                  <td className={tdClass}>
                    Article 6(1)(c) — compliance with legal obligations
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className={sectionHeading}>6. How We Use Your Data</h2>
          <p className={paragraph}>
            We use the personal data we collect exclusively to:
          </p>
          <ul className={listClass}>
            <li>
              Provide you with access to the inTouch platform and its features
            </li>
            <li>
              Display care dashboards, medication schedules, and senior
              profiles
            </li>
            <li>Maintain the tamper-evident Care Ledger</li>
            <li>Authenticate your identity and protect your account</li>
            <li>
              Enable administrators to manage user accounts and pricing plans
            </li>
            <li>Improve the reliability and security of the platform</li>
          </ul>
          <p className={paragraph}>
            We do not sell, rent, or share your personal data with third
            parties for marketing purposes.
          </p>

          <h2 className={sectionHeading}>
            7. Data Sharing and Third Parties
          </h2>

          <h3 className={subHeading}>7.1 Google OAuth</h3>
          <p className={paragraph}>
            If you choose to sign in with Google, your Google ID token is sent
            to Google&apos;s verification servers (
            <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-foreground ring-1 ring-border/60">
              google.oauth2.id_token.verify_oauth2_token
            </code>
            ). Google&apos;s privacy policy applies to that interaction. We
            store only the resulting user identity (name, email) — not your
            Google credentials.
          </p>

          <h3 className={subHeading}>7.2 Database Hosting</h3>
          <p className={paragraph}>
            Application data is stored in a PostgreSQL database. If a managed
            cloud provider (e.g., Neon) is used, that provider acts as a{" "}
            <strong className="text-foreground">data processor</strong> under a
            Data Processing Agreement. Data may be stored in the European
            Economic Area or in third countries with adequate safeguards (e.g.,
            Standard Contractual Clauses).
          </p>

          <h3 className={subHeading}>7.3 No Other Third-Party Sharing</h3>
          <p className={paragraph}>
            We do not share personal data with analytics providers,
            advertisers, or any other third parties beyond those strictly
            necessary to operate the platform.
          </p>

          <h2 className={sectionHeading}>8. Data Retention</h2>
          <div className={tableWrapper}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdClass}>Caregiver account data</td>
                  <td className={tdClass}>
                    Until account deletion is requested
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>
                    Senior profile &amp; medication data
                  </td>
                  <td className={tdClass}>
                    Until deleted by the caregiver or account closure
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>Care Ledger entries</td>
                  <td className={tdClass}>
                    Retained for the lifetime of the associated account;
                    deletion requests assessed under Article 17
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>Session tokens (JWT)</td>
                  <td className={tdClass}>Expire after 60 minutes</td>
                </tr>
                <tr>
                  <td className={tdClass}>Two-factor codes</td>
                  <td className={tdClass}>Not stored; transient use only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={paragraph}>
            Care Ledger entries may be retained beyond a deletion request where
            we have a legitimate interest in maintaining the integrity of the
            chain or where retention is required by applicable law.
          </p>

          <h2 className={sectionHeading}>9. Data Security</h2>
          <p className={paragraph}>
            We implement appropriate technical and organisational measures to
            protect your personal data, including:
          </p>
          <ul className={listClass}>
            <li>
              <strong className="text-foreground">Passwords</strong> are hashed
              using bcrypt and never stored in plaintext
            </li>
            <li>
              <strong className="text-foreground">Session tokens</strong> are
              signed JWTs with a minimum 32-character secret key and a 60-minute
              expiry
            </li>
            <li>
              <strong className="text-foreground">Transport security:</strong>{" "}
              all data in transit is protected via HTTPS/TLS
            </li>
            <li>
              <strong className="text-foreground">
                Care Ledger integrity:
              </strong>{" "}
              SHA-256 hash chaining makes any tampering with historical records
              immediately detectable
            </li>
            <li>
              <strong className="text-foreground">Access control:</strong>{" "}
              dashboard data is protected behind authentication; admin routes
              require explicit role verification
            </li>
          </ul>
          <p className={paragraph}>
            Despite these measures, no system is completely secure. In the
            event of a data breach affecting your rights and freedoms, we will
            notify the relevant supervisory authority within 72 hours and
            inform affected users as required by Article 33–34 GDPR.
          </p>

          <h2 className={sectionHeading}>10. Your Rights Under GDPR</h2>
          <p className={paragraph}>
            As a data subject, you have the following rights:
          </p>
          <dl className="mt-6 space-y-5">
            {[
              {
                title: "Right of access (Art. 15)",
                body: "You may request a copy of all personal data we hold about you.",
              },
              {
                title: "Right to rectification (Art. 16)",
                body: "You may request correction of inaccurate or incomplete personal data.",
              },
              {
                title: "Right to erasure (Art. 17)",
                body: "You may request deletion of your personal data. Note that Care Ledger entries may be exempt where their retention serves a legitimate interest in care accountability.",
              },
              {
                title: "Right to restriction of processing (Art. 18)",
                body: "You may request that we limit how we process your data in certain circumstances.",
              },
              {
                title: "Right to data portability (Art. 20)",
                body: "You may request your data in a structured, commonly used, machine-readable format.",
              },
              {
                title: "Right to object (Art. 21)",
                body: "You may object to processing based on legitimate interests.",
              },
              {
                title: "Right to withdraw consent (Art. 7(3))",
                body: "Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.",
              },
              {
                title:
                  "Right not to be subject to automated decision-making (Art. 22)",
                body: "We do not make automated decisions with legal or similarly significant effects based on your personal data.",
              },
            ].map((right) => (
              <div key={right.title}>
                <dt className="text-base font-semibold text-foreground">
                  {right.title}
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-muted">
                  {right.body}
                </dd>
              </div>
            ))}
          </dl>
          <p className={paragraph}>
            To exercise any of these rights, contact us using the details in
            Section 12. We will respond within 30 days.
          </p>

          <h2 className={sectionHeading}>11. Children&apos;s Data</h2>
          <p className={paragraph}>
            inTouch is not directed at children under the age of 16. We do not
            knowingly collect personal data from children. If you believe a
            child has provided data through our platform, please contact us
            immediately.
          </p>

          <h2 className={sectionHeading}>12. Contact and Complaints</h2>
          <p className={paragraph}>
            To exercise your rights, ask questions about this policy, or report
            a concern, contact:
          </p>
          <div className="mt-4 rounded-xl border border-border/60 bg-card p-5">
            <p className="text-base font-semibold text-foreground">
              inTouch Data Team
            </p>
            <p className="mt-1 text-base text-muted">
              Email:{" "}
              <a
                href="mailto:privacy@intouch.example"
                className="font-medium text-primary hover:underline"
              >
                privacy@intouch.example
              </a>
            </p>
          </div>
          <p className={paragraph}>
            If you are unsatisfied with our response, you have the right to
            lodge a complaint with your local supervisory authority. In
            Romania, the relevant authority is:
          </p>
          <div className="mt-4 rounded-xl border border-border/60 bg-card p-5">
            <p className="text-base font-semibold text-foreground">
              Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
              Caracter Personal (ANSPDCP)
            </p>
            <p className="mt-1 text-base text-muted">
              Website:{" "}
              <a
                href="https://www.dataprotection.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                www.dataprotection.ro
              </a>
            </p>
          </div>

          <h2 className={sectionHeading}>13. Changes to This Policy</h2>
          <p className={paragraph}>
            We may update this Privacy Policy from time to time. We will notify
            registered users of material changes via email or an in-app notice.
            Continued use of inTouch after the effective date of any changes
            constitutes acceptance of the updated policy.
          </p>

          <hr className="mt-14 border-border/60" />
          <p className="mt-6 text-sm italic text-muted">
            This document was generated based on the technical architecture of
            inTouch as described in the project documentation (ClujHackathon
            2026).
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
