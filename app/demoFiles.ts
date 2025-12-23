// @ts-expect-error

// @ts-expect-error
import AppLess from "!!raw-loader!./demo_raw/App.less";
import AppTsx from "!!raw-loader!./demo_raw/App.tsx";
// @ts-expect-error
import IndexCss from "!!raw-loader!./demo_raw/index.css";
// @ts-expect-error
import IndexTsx from "!!raw-loader!./demo_raw/index.tsx";
// @ts-expect-error
import PackageJson from "!!raw-loader!./demo_raw/package.json";
// @ts-expect-error
import PackageLock from "!!raw-loader!./demo_raw/package-lock.json";
// @ts-expect-error
import PostCSSConfig from "!!raw-loader!./demo_raw/postcss.config.js";
// @ts-expect-error
import TailwindExamples from "!!raw-loader!./demo_raw/TailwindExamples.tsx";
// @ts-expect-error
import TailwindConfig from "!!raw-loader!./demo_raw/tailwind.config.js";
// @ts-expect-error
import UtoopackJson from "!!raw-loader!./demo_raw/utoopack.json";

export const demoFiles: Record<string, string> = {
  "src/index.tsx": IndexTsx,
  "src/App.tsx": AppTsx,
  "src/App.less": AppLess,
  "src/index.css": IndexCss,
  "src/TailwindExamples.tsx": TailwindExamples,
  "package.json": PackageJson,
  "package-lock.json": PackageLock,
  "utoopack.json": UtoopackJson,
  "postcss.config.js": PostCSSConfig,
  "tailwind.config.js": TailwindConfig,
};
