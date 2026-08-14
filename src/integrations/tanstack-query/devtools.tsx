import { lazy, Suspense } from "react";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
);

export function QueryDevtools() {
  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools />
    </Suspense>
  );
}