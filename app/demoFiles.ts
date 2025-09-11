// @ts-ignore
import AppTsx from "!!raw-loader!./demo_raw/App.tsx";
// @ts-ignore
import IndexTsx from "!!raw-loader!./demo_raw/index.tsx";
// @ts-ignore
import PackageJson from "!!raw-loader!./demo_raw/package.json";
// @ts-ignore
import PackageLock from "!!raw-loader!./demo_raw/package-lock.json";
// @ts-ignore
import UtoopackJson from "!!raw-loader!./demo_raw/utoopack.json";

export const demoFiles: Record<string, any> = {
  "src/index.tsx": IndexTsx,
  "src/App.tsx": AppTsx,
  "package.json": PackageJson,
  "package-lock.json": PackageLock,
  "utoopack.json": UtoopackJson,
};


