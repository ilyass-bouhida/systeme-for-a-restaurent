import { useRestaurantName } from "@/features/branding/branding-queries";
import { useEffect } from "react";

export function BrandingTitle() {
  const { restaurantName } = useRestaurantName();

  useEffect(() => {
    document.title = `${restaurantName} POS`;
  }, [restaurantName]);

  return null;
}
