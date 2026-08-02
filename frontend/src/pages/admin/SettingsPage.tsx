import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  DEFAULT_RESTAURANT_NAME,
  useBranding,
  useUpdateBranding,
} from "@/features/branding/branding-queries";
import { ChefHat, RefreshCw, Save, Settings2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  restaurant_name: z
    .string()
    .trim()
    .min(1, "Enter a restaurant name.")
    .max(80, "Use 80 characters or fewer."),
});

type SettingsValues = z.infer<typeof schema>;

export function SettingsPage() {
  const branding = useBranding();
  const updateBranding = useUpdateBranding();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: { restaurant_name: DEFAULT_RESTAURANT_NAME },
  });

  useEffect(() => {
    if (branding.data) {
      reset({ restaurant_name: branding.data.restaurant_name });
    }
  }, [branding.data, reset]);

  if (branding.isLoading) {
    return <LoadingScreen label="Loading system settings…" />;
  }

  if (branding.isError && !branding.data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={<Settings2 className="size-6" />}
          title="Settings are unavailable"
          description="The current restaurant name could not be loaded. Check the connection and try again."
          action={
            <Button
              variant="secondary"
              icon={<RefreshCw className="size-4" />}
              onClick={() => branding.refetch()}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const previewName = watch("restaurant_name").trim() || "Restaurant name";
  const previewInitial = previewName.charAt(0).toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <Badge tone="amber">System settings</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          Restaurant identity
        </h1>
        <p className="mt-2 max-w-2xl text-stone-500">
          Change the main name once and it will update the login screen,
          navigation, browser title, and all new receipts.
        </p>
      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="bg-gigino-subtle text-gigino-tomato grid size-11 place-items-center rounded-[13px]">
              <Settings2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Main system name</h2>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                Only administrators can change this name. Worker accounts and
                passwords are not affected.
              </p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-5"
            onSubmit={handleSubmit((values) =>
              updateBranding.mutate(values, {
                onSuccess: (updated) =>
                  reset({ restaurant_name: updated.restaurant_name }),
              }),
            )}
          >
            <Input
              label="Restaurant / system name"
              placeholder="Example: Atlas Bistro"
              autoComplete="organization"
              maxLength={80}
              error={errors.restaurant_name?.message}
              {...register("restaurant_name")}
            />
            <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-stone-500">
                Existing receipts keep their original name; new receipts use the
                updated one.
              </p>
              <Button
                type="submit"
                icon={<Save className="size-4" />}
                disabled={!isDirty || updateBranding.isPending}
              >
                {updateBranding.isPending ? "Saving…" : "Save name"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden bg-[#1c1917] p-0 text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-bold tracking-[0.14em] text-stone-400 uppercase">
              Live preview
            </p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="bg-gigino-tomato grid size-12 place-items-center rounded-[14px] text-lg font-black">
                {previewInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-black">{previewName}</p>
                <p className="text-xs font-semibold text-stone-400">
                  Restaurant POS
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <ChefHat className="text-gigino-tomato size-5" />
              <p className="mt-3 text-sm font-bold">Shown across the system</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">
                Staff will see this identity the next time the interface
                refreshes.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
