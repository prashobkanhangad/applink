import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AppRoutes } from "./AppRoutes.jsx";

export function render(url) {
  const helmetContext = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ThemeProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </ThemeProvider>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  const head = helmet
    ? [helmet.title, helmet.meta, helmet.link, helmet.script]
        .map((part) => (part ? part.toString() : ""))
        .filter(Boolean)
        .join("\n")
    : "";

  return { html, head };
}
