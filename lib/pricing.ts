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

export function determineVehicle(passengers: number, suitcases: number, handLuggage: number): VehicleType {
  // 1. Limo (Limousine)
  if (passengers <= 2 && suitcases <= 2 && handLuggage <= 2) {
    return 'Limo';
  }
  
  // 2. Kombi (Station Wagon)
  if (passengers <= 4 && suitcases <= 4 && handLuggage <= 4) {
    return 'Kombi';
  }
  
  // 3. Bus (Minivan/Van)
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
