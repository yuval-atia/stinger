function TermsOfUsePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Terms of Use</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: February 15, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
          <section>
            <h2 className="text-lg font-semibold mb-2">Acceptance of Terms</h2>
            <p>
              By accessing and using Stingr.dev ("the site"), you agree to be bound by these Terms of Use.
              If you do not agree with any part of these terms, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Description of Service</h2>
            <p>
              Stingr.dev is a free, open-source collection of browser-based developer tools. All tools run entirely
              in your browser — no data is sent to any server. The service is provided "as is" without any guarantees
              of availability, accuracy, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Use of the Service</h2>
            <p>You agree to use the site only for lawful purposes. You may not:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Use the site in any way that violates applicable laws or regulations</li>
              <li>Attempt to interfere with or disrupt the site's infrastructure</li>
              <li>Use automated tools to scrape or overload the site</li>
              <li>Redistribute the site under a different name while claiming original authorship</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Intellectual Property</h2>
            <p>
              Stingr.dev is open-source software. The source code is available on GitHub and is subject to its
              respective license. The Stingr name and logo are the property of their respective owner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Disclaimer of Warranties</h2>
            <p>
              The site and its tools are provided on an "as is" and "as available" basis without warranties of any kind,
              either express or implied. We do not guarantee that the tools will produce accurate results for all inputs,
              or that the service will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Limitation of Liability</h2>
            <p>
              In no event shall Stingr.dev, its creator, or contributors be liable for any direct, indirect, incidental,
              special, or consequential damages arising from your use of, or inability to use, the site or its tools.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Changes to These Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated
              revision date. Continued use of the site after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>
              If you have any questions about these terms, please contact us at{' '}
              <a href="mailto:yodaatia123@gmail.com" className="text-[var(--accent-color)] underline">yodaatia123@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUsePage;
