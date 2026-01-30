import { Link } from "react-router-dom";
import { LegalPageLayout } from "../../components/legal/LegalPageLayout";
import { PageMeta } from "../../components/PageMeta";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";

const META = {
  title: "How to Implement Deep Linking in Android & iOS (Step-by-Step)",
  description: "Learn how to implement deep linking for Android App Links and iOS Universal Links. Common challenges, best practices, and how Deeplink simplifies cross-platform support.",
  keywords: "implement deep linking, Android App Links, iOS Universal Links, deep linking implementation, AASA",
};

export const HowToImplementDeepLinking = () => {
  return (
    <LegalPageLayout title="How to Implement Deep Linking in Android & iOS (Step-by-Step)" backHref="/blog" backLabel="Back to Blog">
      <PageMeta title={META.title} description={META.description} keywords={META.keywords} path="/blog/how-to-implement-deep-linking-android-ios" />

      <p>
        Implementing deep linking correctly ensures users land on the right content every time. However, Android and iOS handle deep links differently, making cross-platform support challenging.
      </p>

      <h2>Deep Linking in Android</h2>
      <p>Android uses App Links:</p>
      <ul>
        <li>Verified domains</li>
        <li>Intent filters</li>
        <li>Automatic app opening</li>
      </ul>

      <h2>Deep Linking in iOS</h2>
      <p>iOS uses Universal Links:</p>
      <ul>
        <li>Apple App Site Association (AASA)</li>
        <li>HTTPS only</li>
        <li>Better security and reliability</li>
      </ul>

      <h2>Common Implementation Challenges</h2>
      <ul>
        <li>Platform inconsistencies</li>
        <li>Broken fallback behavior</li>
        <li>App not installed scenarios</li>
        <li>Attribution loss</li>
      </ul>

      <h2>How Deeplink Simplifies Implementation</h2>
      <p>
        <Link to="/deep-linking-platform">Deeplink</Link> provides:
      </p>
      <ul>
        <li>One unified link</li>
        <li>Automatic platform detection</li>
        <li><Link to="/deferred-deep-linking">Deferred deep linking</Link> support</li>
        <li>Web fallback handling</li>
      </ul>

      <h2>Best Practices</h2>
      <ul>
        <li>Always include fallback URLs</li>
        <li>Test across devices</li>
        <li>Monitor link analytics</li>
        <li>Avoid hardcoded logic</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Using a dedicated deep linking platform saves time, reduces bugs, and ensures scalability.</p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Simplify your deep linking implementation</p>
        <Link to="/signup">
          <Button variant="hero" size="lg" className="group">
            Get Started with Deeplink
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </LegalPageLayout>
  );
};
