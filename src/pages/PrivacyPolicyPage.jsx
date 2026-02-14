function PrivacyPolicyPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: February 15, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
          <section>
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p>
              Stingr.dev ("we", "our", "the site") is a free, open-source developer toolkit that runs entirely in your browser.
              We are committed to protecting your privacy. This policy explains what data we collect and how we handle it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data Processing</h2>
            <p>
              All data you enter into our tools (JSON, text, passwords, hashes, etc.) is processed locally in your browser.
              <strong> No user input is ever sent to our servers or any third party.</strong> Your data stays on your device at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data We Collect</h2>
            <p>
              We do not collect, store, or transmit any personal data. We do not use cookies for tracking purposes.
              The only data stored locally on your device is your theme preference (dark/light mode), which is saved in your browser's localStorage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Analytics</h2>
            <p>
              We may use privacy-friendly analytics to understand general usage patterns (e.g., page views).
              These analytics do not collect personally identifiable information and do not use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Third-Party Services</h2>
            <p>
              The site is hosted on GitHub Pages. GitHub may collect basic server logs (such as IP addresses) as part of their hosting service.
              Please refer to <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] underline">GitHub's Privacy Statement</a> for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Children's Privacy</h2>
            <p>
              Our site does not knowingly collect any personal information from anyone, including children under the age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href="mailto:yodaatia123@gmail.com" className="text-[var(--accent-color)] underline">yodaatia123@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
