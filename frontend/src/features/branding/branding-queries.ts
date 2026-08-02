import {
  getRestaurantBranding,
  updateRestaurantBranding,
  type RestaurantBrandingInput,
} from "@/features/branding/branding-api";
import { getErrorMessage } from "@/utils/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const DEFAULT_RESTAURANT_NAME = "Gigino";
export const brandingKey = ["restaurant-branding"] as const;

export function useBranding() {
  return useQuery({
    queryKey: brandingKey,
    queryFn: getRestaurantBranding,
    staleTime: 5 * 60_000,
  });
}

export function useRestaurantName() {
  const branding = useBranding();

  return {
    ...branding,
    restaurantName: branding.data?.restaurant_name ?? DEFAULT_RESTAURANT_NAME,
  };
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RestaurantBrandingInput) =>
      updateRestaurantBranding(input),
    onSuccess: (branding) => {
      queryClient.setQueryData(brandingKey, branding);
      toast.success("Restaurant name updated everywhere.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
