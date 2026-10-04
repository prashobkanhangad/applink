import { Header, Footer } from "./landing";

/** Shared chrome for marketing pages other than the homepage. */
export function MarketingShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">{children}</main>
      <Footer />
    </div>
  );
}
