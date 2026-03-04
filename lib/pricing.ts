export type VehicleType = 'Limo' | 'Kombi' | 'Bus';

export function determineVehicle(passengers: number, suitcases: number, handLuggage: number): VehicleType {
  // 1. Limo (Limousine)
  if (passengers <= 3 && suitcases <= 2 && handLuggage <= 3) {
    return 'Limo';
  }
  
  // 2. Kombi (Station Wagon)
  if (passengers <= 4 && suitcases <= 3 && handLuggage <= 4) {
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
