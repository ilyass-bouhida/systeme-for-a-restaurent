export function LoadingScreen({
  label = "Loading workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="text-gigino-muted grid justify-items-center gap-3 text-sm font-semibold">
        <span className="border-gigino-line border-t-gigino-tomato size-9 animate-spin rounded-full border-4" />
        {label}
      </div>
    </div>
  );
}
