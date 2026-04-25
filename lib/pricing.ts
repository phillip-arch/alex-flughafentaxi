export type VehicleType = 'Limo' | 'Kombi' | 'Bus';

export function formatVehicleTypeLabel(vehicleType: VehicleType | string): string {
  switch (vehicleType) {
    case 'Limo':
      return 'Sedan';
    case 'Kombi':
      return 'St. wagon';
    case 'Bus':
      return 'Minivan';
    default:
      return vehicleType;
  }
}

export function determineVehicle(passengers: number, suitcases: number): VehicleType {
  if (passengers <= 2 && suitcases <= 2) {
    return 'Limo';
  }
  if (passengers <= 4 && suitcases <= 4) {
    return 'Kombi';
  }
  return 'Bus';
}

export function calculateVehiclePrice(
  basePrice: number, 
  vehicleType: VehicleType, 
  dbPrices?: { limo?: number; kombi?: number; bus?: number }
): number {
  switch (vehicleType) {
    case 'Limo':
      return dbPrices?.limo ?? basePrice;
    case 'Kombi':
      return dbPrices?.kombi ?? (basePrice + 5);
    case 'Bus':
      return dbPrices?.bus ?? (basePrice + 20);
    default:
      return basePrice;
  }
}
