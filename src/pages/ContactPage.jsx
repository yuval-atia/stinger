function ContactPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Contact</h1>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
          <section>
            <p>
              Have a question, suggestion, or found a bug? We'd love to hear from you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Email</h2>
            <p>
              Reach us at{' '}
              <a href="mailto:yodaatia123@gmail.com" className="text-[var(--accent-color)] underline">yodaatia123@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">GitHub</h2>
            <p>
              You can also open an issue or start a discussion on our{' '}
              <a href="https://github.com/yuval-atia/stinger" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] underline">GitHub repository</a>.
              This is the best place for bug reports and feature requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contributing</h2>
            <p>
              Stingr.dev is open source. If you'd like to contribute, feel free to fork the repository and submit a pull request.
              All contributions are welcome!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
