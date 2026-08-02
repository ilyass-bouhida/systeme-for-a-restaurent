import { Button } from "@/components/ui/Button";
import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <div className="grid size-16 place-items-center rounded-3xl bg-red-100 text-red-700">
          <ShieldX className="size-8" />
        </div>
        <h1 className="text-3xl font-black">Access not assigned</h1>
        <p className="text-stone-500">
          An administrator has not enabled this part of the system for your
          account.
        </p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </div>
  );
}
