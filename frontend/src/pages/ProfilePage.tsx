import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { updateProfile, type ProfileInput } from "@/features/auth/auth-api";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateStoredUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      updateStoredUser(updatedUser);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      toast.success("Your account has been updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!user) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input: ProfileInput = {
      name,
      email,
      ...(currentPassword ? { current_password: currentPassword } : {}),
      ...(password
        ? {
            password,
            password_confirmation: passwordConfirmation,
          }
        : {}),
    };
    mutation.mutate(input);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Badge tone="neutral">My account</Badge>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
        Profile & security
      </h1>
      <p className="mt-2 text-stone-500">
        Every team member can manage their own name, email, and password.
      </p>

      <div className="mt-7 grid gap-4 xl:grid-cols-[0.65fr_1.35fr]">
        <Card className="p-6">
          <div className="grid size-16 place-items-center rounded-3xl bg-stone-950 text-2xl font-black text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-5 text-xl font-black">{user.name}</h2>
          <p className="mt-1 text-sm text-stone-500">{user.email}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={user.roles.includes("admin") ? "green" : "blue"}>
              {user.roles.includes("admin") ? "Administrator" : "Worker"}
            </Badge>
            <Badge tone={user.is_active ? "green" : "red"}>
              {user.is_active ? "Active account" : "Inactive account"}
            </Badge>
          </div>
          <div className="mt-6 rounded-2xl bg-stone-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              <p className="text-sm font-black">Secure changes</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Your current password is required when changing your email or
              password.
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <form className="grid gap-5" onSubmit={submit}>
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-stone-500" />
              <h2 className="text-lg font-black">Personal information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={name}
                required
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="border-t border-stone-100 pt-5">
              <div className="mb-4 flex items-center gap-2">
                <KeyRound className="size-5 text-stone-500" />
                <div>
                  <h2 className="text-lg font-black">Password</h2>
                  <p className="text-xs text-stone-400">
                    Leave the new password empty to keep the current one.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="New password"
                    type="password"
                    minLength={10}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    minLength={10}
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="sm:w-fit"
              disabled={mutation.isPending}
              icon={<Save className="size-5" />}
            >
              {mutation.isPending ? "Saving…" : "Save my account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
