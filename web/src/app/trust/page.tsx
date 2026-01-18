"use client";

import Link from "next/link";

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="border-b border-blue-100 bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Trust & <span className="text-blue-600">Safety</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Your privacy, security, and wellbeing are at the heart of everything we do.
          </p>
        </div>
      </section>

      {/* Privacy-First Design */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 sm:p-12">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Privacy-First Anonymity</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-blue-900">In NeuroKind's community, anonymity isn't hiding — it's healing.</h3>
                <p className="text-gray-700">
                  We understand that families need a safe space to share their experiences without fear of judgment or public exposure. Our anonymity features are designed with compassion and security at their core.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-gray-900">How We Protect Your Privacy:</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Anonymous posting in community without requiring personal identifiers</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Optional profile — share only what you're comfortable with</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>End-to-end encryption for private conversations and medical records</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>No selling of data to third parties — ever</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Account deletion removes all personal data permanently</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Minimization */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-blue-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Data Minimization Principles</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">What We Collect</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Email address (encrypted)</li>
                <li>• Age range (not exact DOB)</li>
                <li>• Relationship to autistic individual</li>
                <li>• Geographic region (optional)</li>
                <li>• Communication preferences</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">What We Don't Collect</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Full names in community posts</li>
                <li>• Precise location data</li>
                <li>• Behavioral tracking</li>
                <li>• Health data we don't need</li>
                <li>• Financial information (unless you opt-in)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Security Architecture</h2>
          <div className="space-y-6">
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-green-900">Role-Based Access Control (RBAC)</h3>
              <p className="mb-3 text-gray-700">
                Every team member has specific permissions based on their role. A community moderator cannot access medical records. Our engineers cannot see family names. This separation minimizes risk.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Parents/Caregivers:</strong> Access their own data and community participation</li>
                <li>• <strong>Moderators:</strong> Can manage community but not access private medical info</li>
                <li>• <strong>Support Staff:</strong> Limited access only for helping with account issues</li>
                <li>• <strong>Engineers:</strong> Access only to technical systems, not personal data</li>
              </ul>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-900">Audit Logs & Accountability</h3>
              <p className="mb-3 text-gray-700">
                Every access to sensitive information is logged with timestamp and reason. Families can view their own audit logs to see who accessed their data.
              </p>
              <p className="text-sm text-gray-700">
                Our "Data Transparency" feature lets you see exactly who looked at your profile and why — because your data belongs to you.
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-purple-900">Multi-Factor Authentication (MFA)</h3>
              <p className="text-gray-700">
                Protect your account with optional MFA via email or authenticator app. For sensitive actions like changing recovery methods, MFA is required.
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-rose-900">Encryption Standards</h3>
              <p className="text-gray-700">
                All data in transit uses TLS 1.3. Sensitive data at rest uses AES-256 encryption. Private messages use end-to-end encryption, meaning even we cannot read them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Safety */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-blue-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">AI Safety & Limitations</h2>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-8">
            <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-600 rounded">
              <p className="font-semibold text-orange-900">
                ⚠️ Important: NeuroKind's AI Assistant provides educational support, not medical advice.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">What Our AI Can Help With:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Educational information about autism and neurodiversity</li>
                  <li>✓ Resource recommendations and navigation assistance</li>
                  <li>✓ General wellness and self-care suggestions</li>
                  <li>✓ Questions about NeuroKind features and community guidelines</li>
                  <li>✓ Connecting you with appropriate professionals when needed</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">What Our AI Cannot Do:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✗ Diagnose or provide medical advice</li>
                  <li>✗ Replace consultation with healthcare professionals</li>
                  <li>✗ Prescribe medications or treatments</li>
                  <li>✗ Emergency crisis intervention (we provide crisis hotline numbers instead)</li>
                  <li>✗ Make decisions for your family</li>
                </ul>
              </div>

              <p className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-700">
                <strong>Always consult qualified healthcare professionals, therapists, and specialists for medical and mental health decisions.</strong> NeuroKind's AI augments professional care, it does not replace it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Standards */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Community Standards & Moderation</h2>
          <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-8 sm:p-12">
            <p className="mb-6 text-gray-700">
              Our community thrives on kindness, respect, and mutual support. We maintain a safe environment through clear guidelines and compassionate moderation.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-green-900">We Welcome:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Authentic experiences and emotions</li>
                  <li>✓ Questions and curiosity</li>
                  <li>✓ Sharing resources and advice</li>
                  <li>✓ Supporting fellow families</li>
                  <li>✓ Diverse perspectives</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-green-900">We Don't Allow:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✗ Harassment or discrimination</li>
                  <li>✗ Medical misinformation</li>
                  <li>✗ Unsolicited advice or judgment</li>
                  <li>✗ Spam or self-promotion</li>
                  <li>✗ Hate speech or bigotry</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
              <h4 className="mb-3 font-semibold text-gray-900">Moderation Process:</h4>
              <ol className="space-y-2 text-sm text-gray-700">
                <li><strong>1. Report:</strong> Community members can report concerns. All reports are reviewed with care.</li>
                <li><strong>2. Review:</strong> Our moderation team investigates with compassion and context.</li>
                <li><strong>3. Resolution:</strong> We may educate, remove content, or restrict access — depending on severity.</li>
                <li><strong>4. Appeal:</strong> Users can appeal moderation decisions through our fair process.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Data Rights */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-blue-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Your Data Rights</h2>
          <div className="grid gap-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Access Your Data</h3>
              <p className="text-sm text-gray-700">
                Request a complete copy of your data in a readable format. You can see everything we store about you.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Correct or Delete</h3>
              <p className="text-sm text-gray-700">
                Update inaccurate information anytime. Delete your account and all associated data with one click.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Data Portability</h3>
              <p className="text-sm text-gray-700">
                Export your data in a standard format and take it with you to another service if you wish.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Withdraw Consent</h3>
              <p className="text-sm text-gray-700">
                You can withdraw permission for data use at any time without penalty. We respect your autonomy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Have Questions About Your Privacy?</h2>
          <p className="mb-8 text-gray-700">
            We're committed to transparency. Contact our privacy team at <span className="font-semibold">privacy@neurokind.care</span>
          </p>
          <Link
            href="/about"
            className="inline-block rounded-lg border border-blue-600 px-6 py-2 font-medium text-blue-600 transition-all hover:bg-blue-50"
          >
            Learn More About NeuroKind
          </Link>
        </div>
      </section>
    </div>
  );
}
