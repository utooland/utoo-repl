// @ts-ignore
import AppTsx from "!!raw-loader!./demo_raw/App.tsx";
// @ts-ignore
import AppLess from "!!raw-loader!./demo_raw/App.less";
// @ts-ignore
import IndexTsx from "!!raw-loader!./demo_raw/index.tsx";
// @ts-ignore
import PackageJson from "!!raw-loader!./demo_raw/package.json";
// @ts-ignore
import PackageLock from "!!raw-loader!./demo_raw/package-lock.json";
// @ts-ignore
import UtoopackJson from "!!raw-loader!./demo_raw/utoopack.json";
// @ts-ignore
import TailwindExamples from "!!raw-loader!./demo_raw/TailwindExamples.tsx";
// @ts-ignore
import PostCSSConfig from "!!raw-loader!./demo_raw/postcss.config.js";
// @ts-ignore
import TailwindConfig from "!!raw-loader!./demo_raw/tailwind.config.js";
// @ts-ignore
import IndexCss from "!!raw-loader!./demo_raw/index.css";

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
