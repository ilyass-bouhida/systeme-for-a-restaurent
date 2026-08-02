import { api } from "@/services/api";
import type { ApiResource, RestaurantBranding } from "@/types/api";

export interface RestaurantBrandingInput {
  restaurant_name: string;
}

export async function getRestaurantBranding(): Promise<RestaurantBranding> {
  return (await api.get<ApiResource<RestaurantBranding>>("/branding")).data
    .data;
}

export async function updateRestaurantBranding(
  input: RestaurantBrandingInput,
): Promise<RestaurantBranding> {
  return (
    await api.put<ApiResource<RestaurantBranding>>("/admin/settings", input)
  ).data.data;
}
