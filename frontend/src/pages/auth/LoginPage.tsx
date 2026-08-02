import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login } from "@/features/auth/auth-api";
import { useRestaurantName } from "@/features/branding/branding-queries";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { ChefHat, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof schema>;

const isDevelopment = import.meta.env.DEV;

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantName } = useRestaurantName();
  const restaurantInitial = restaurantName.charAt(0).toUpperCase() || "R";
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: isDevelopment ? "cashier@gigino.local" : "",
      password: isDevelopment ? "12345678" : "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token: newToken, user }) => {
      setSession(newToken, user);
      toast.success(`Welcome, ${user.name}`);
      const requestedPath =
        (location.state as { from?: string } | null)?.from ?? null;
      navigate(
        requestedPath ?? (user.roles.includes("admin") ? "/admin" : "/cashier"),
        { replace: true },
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (token) {
    const user = useAuthStore.getState().user;
    return (
      <Navigate
        to={user?.roles.includes("admin") ? "/admin" : "/cashier"}
        replace
      />
    );
  }

  const fillDemoCredentials = (role: "cashier" | "admin") => {
    setValue(
      "email",
      role === "admin" ? "admin@gigino.local" : "cashier@gigino.local",
    );
    setValue("password", "12345678");
  };

  return (
    <main className="bg-gigino-app grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="bg-gigino-ink relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="bg-gigino-tomato absolute inset-y-0 right-0 w-1" />
        <div className="absolute top-12 right-12 size-40 rounded-full border border-white/10" />
        <div className="absolute top-24 right-24 size-72 rounded-full border border-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="bg-gigino-tomato grid size-12 place-items-center rounded-[14px] text-white">
            <ChefHat className="size-7" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">
              {restaurantName}
            </p>
            <p className="text-sm text-stone-400">Restaurant command center</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-stone-300">
            <Sparkles className="text-gigino-tomato size-4" />
            The dinner shift, perfectly clear
          </div>
          <h1 className="text-5xl leading-[1.05] font-black tracking-[-0.04em] xl:text-6xl">
            Every table.
            <br />
            Every order.
            <br />
            Perfectly clear.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-stone-400">
            A focused workspace for {restaurantName}’s team—from the first order
            to the final receipt.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Clock3 className="mb-3 size-5 text-amber-400" />
            <p className="font-bold">Fast at the counter</p>
            <p className="mt-1 text-sm text-stone-400">
              Large, touch-ready controls
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <ShieldCheck className="mb-3 size-5 text-emerald-400" />
            <p className="font-bold">Secure by design</p>
            <p className="mt-1 text-sm text-stone-400">
              Role-based staff access
            </p>
          </div>
        </div>
      </section>

      <section className="grid place-items-center p-5 sm:p-10 xl:p-16">
        <div className="border-gigino-line w-full max-w-[440px] rounded-[24px] border bg-white p-6 shadow-[var(--gigino-shadow-floating)] sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="bg-gigino-tomato grid size-11 place-items-center rounded-[13px] text-white">
              <span className="text-lg font-black">{restaurantInitial}</span>
            </div>
            <span className="truncate text-2xl font-extrabold">
              {restaurantName}
            </span>
          </div>

          <p className="mb-2 text-sm font-bold tracking-[0.16em] text-stone-500 uppercase">
            Staff access
          </p>
          <h2 className="text-gigino-ink text-4xl font-extrabold tracking-[-0.035em]">
            Welcome back
          </h2>
          <p className="mt-3 text-stone-500">
            Sign in to open the restaurant workspace.
          </p>

          <form
            className="mt-8 grid gap-5"
            onSubmit={handleSubmit((values) =>
              mutation.mutate({ ...values, device_name: "restaurant-web-pos" }),
            )}
          >
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {isDevelopment ? (
            <div className="mt-7 rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold tracking-wide text-stone-500 uppercase">
                Local demo accounts
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fillDemoCredentials("cashier")}
                >
                  Cashier
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fillDemoCredentials("admin")}
                >
                  Admin
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-400">
                Change the seeded password before any production use.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
