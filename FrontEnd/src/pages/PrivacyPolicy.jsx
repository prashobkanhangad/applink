import { LegalPageLayout } from "../components/legal/LegalPageLayout";

const lastUpdated = "January 27, 2025";

export const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={lastUpdated}>
      <p>
        DeepLink ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our deep linking platform and related services.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information that you provide directly to us, that we obtain automatically when you use our services, and that we receive from third parties.
      </p>
      <h3>1.1 Information You Provide</h3>
      <ul>
        <li>Account information (name, email address, password when you sign up)</li>
        <li>Profile details and preferences</li>
        <li>Payment and billing information</li>
        <li>Communications you send to us (support requests, feedback)</li>
      </ul>
      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>Log data (IP address, browser type, device information, access times)</li>
        <li>Usage data (features used, links created, click-through rates)</li>
        <li>Cookies and similar technologies (see our Cookie Policy)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our services; to process transactions; to send you technical notices and support messages; to respond to your requests; and to comply with legal obligations.
      </p>
      <ul>
        <li>Deliver and personalize our deep linking and attribution services</li>
        <li>Process payments and prevent fraud</li>
        <li>Send administrative information and updates</li>
        <li>Analyze usage patterns to improve our platform</li>
        <li>Comply with applicable laws and enforce our Terms of Service</li>
      </ul>

      <h2>3. Information Sharing and Disclosure</h2>
      <p>
        We do not sell your personal information. We may share your information only in the following circumstances:
      </p>
      <ul>
        <li>With service providers who assist our operations (hosting, analytics, payment processing) under strict confidentiality agreements</li>
        <li>When required by law, court order, or governmental authority</li>
        <li>In connection with a merger, acquisition, or sale of assets (with notice to you)</li>
        <li>With your explicit consent</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your information for as long as your account is active or as needed to provide you services. We may retain certain data to comply with legal obligations, resolve disputes, and enforce our agreements.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or port your personal data, or to object to or restrict certain processing. Contact us at privacy@deeplinq.io to exercise these rights.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For questions about this Privacy Policy or our privacy practices, contact us at{" "}
        <a href="mailto:privacy@deeplinq.io">privacy@deeplinq.io</a>.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
