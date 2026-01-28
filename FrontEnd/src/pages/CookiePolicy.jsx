import { LegalPageLayout } from "../components/legal/LegalPageLayout";

const lastUpdated = "January 27, 2025";

export const CookiePolicy = () => {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated={lastUpdated}>
      <p>
        This Cookie Policy explains how DeepLink ("we," "us," or "our") uses cookies and similar technologies when you use our website and services. It should be read alongside our Privacy Policy.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences, keep you signed in, and understand how you use the service. We also use similar technologies such as local storage and pixels.
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the website to function. They enable core features like authentication, security, and load balancing. You cannot opt out of these without affecting site functionality.
      </p>
      <ul>
        <li>Session and authentication tokens</li>
        <li>Security and fraud prevention</li>
        <li>Load-balancing and availability</li>
      </ul>

      <h3>2.2 Functional Cookies</h3>
      <p>
        These cookies remember your preferences and choices (e.g., language, region) to provide a more personalized experience.
      </p>
      <ul>
        <li>Language and locale settings</li>
        <li>Theme or display preferences</li>
        <li>Onboarding and tutorial state</li>
      </ul>

      <h3>2.3 Analytics and Performance Cookies</h3>
      <p>
        We use these to understand how visitors use our site—which pages are viewed, how long they stay, and how they navigate—so we can improve our services.
      </p>
      <ul>
        <li>Usage and page views</li>
        <li>Referral sources and campaigns</li>
        <li>Error and performance monitoring</li>
      </ul>

      <h3>2.4 Marketing Cookies</h3>
      <p>
        These may be used to deliver relevant ads and measure the effectiveness of our marketing. They are typically set by our advertising partners.
      </p>

      <h2>3. How Long Do Cookies Last?</h2>
      <p>
        Session cookies are deleted when you close your browser. Persistent cookies remain for a set period (e.g., 30 days, 1 year) or until you delete them. Specific retention periods depend on the type of cookie and its purpose.
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        We may use third-party services (e.g., analytics, support, marketing) that set their own cookies. Their use is governed by their respective privacy and cookie policies.
      </p>

      <h2>5. Your Choices</h2>
      <p>
        You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking strictly necessary cookies may impact your ability to use our Services. You can also use our cookie preferences center (where available) to manage functional, analytics, and marketing cookies.
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our practices or applicable law. The "Last updated" date at the top indicates when this policy was last revised.
      </p>

      <h2>7. Contact</h2>
      <p>
        For questions about our use of cookies, contact us at{" "}
        <a href="mailto:privacy@deeplinq.io">privacy@deeplinq.io</a>.
      </p>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
