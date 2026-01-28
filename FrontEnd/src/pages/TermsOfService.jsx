import { LegalPageLayout } from "../components/legal/LegalPageLayout";

const lastUpdated = "January 27, 2025";

export const TermsOfService = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={lastUpdated}>
      <p>
        Welcome to DeepLink. These Terms of Service ("Terms") govern your access to and use of our website, APIs, SDKs, and related services (collectively, the "Services"). By using our Services, you agree to these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using DeepLink, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use our Services.
      </p>

      <h2>2. Description of Services</h2>
      <p>
        DeepLink provides deep linking, attribution, and related infrastructure to help you route users to the right destination across web and mobile. We offer various plans, including free and paid tiers, as described on our pricing page.
      </p>

      <h2>3. Your Account and Responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and promptly update us if it changes. You agree not to:
      </p>
      <ul>
        <li>Use the Services for any illegal or unauthorized purpose</li>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on the intellectual property or other rights of others</li>
        <li>Transmit malware, spam, or harmful content</li>
        <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
        <li>Use the Services in a manner that could harm, disable, or overburden our infrastructure</li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>
        You must use our Services in accordance with our Acceptable Use Policy. We reserve the right to suspend or terminate accounts that violate these terms or pose a risk to our platform or other users.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        We grant you a limited, non-exclusive, non-transferable license to use our Services in accordance with these Terms. DeepLink and its licensors retain all rights in the Services, including trademarks, logos, and software. You retain ownership of your data and content that you provide to us.
      </p>

      <h2>6. Payment and Billing</h2>
      <p>
        Paid plans are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law or as explicitly stated in our refund policy. We may change pricing with reasonable notice; continued use after changes constitutes acceptance.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DeepLink shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from your use of the Services. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless DeepLink, its affiliates, and their respective officers, directors, and employees from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
      </p>

      <h2>9. Termination</h2>
      <p>
        You may cancel your account at any time. We may suspend or terminate your access for breach of these Terms, non-payment, or at our discretion with notice. Upon termination, your right to use the Services ceases immediately.
      </p>

      <h2>10. Changes to the Terms</h2>
      <p>
        We may modify these Terms from time to time. We will notify you of material changes via email or through the Services. Your continued use after the effective date constitutes acceptance. If you do not agree, you must stop using our Services.
      </p>

      <h2>11. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which DeepLink operates. Any disputes shall be resolved in the courts of that jurisdiction, unless otherwise required by applicable law.
      </p>

      <h2>12. Contact</h2>
      <p>
        For questions about these Terms of Service, contact us at{" "}
        <a href="mailto:legal@deeplinq.io">legal@deeplinq.io</a>.
      </p>
    </LegalPageLayout>
  );
};

export default TermsOfService;
