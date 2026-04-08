export type VehicleType = 'limo' | 'kombi' | 'van';

export type DistrictPricingRow = {
  id: string;
  name: string;
  group: number;
};

export const districtPricingRows: DistrictPricingRow[] = [
  { id: '1010', name: 'Innere Stadt', group: 1 },
  { id: '1020', name: 'Leopoldstadt', group: 1 },
  { id: '1030', name: 'Landstrasse', group: 1 },
  { id: '1040', name: 'Wieden', group: 1 },
  { id: '1050', name: 'Margareten', group: 1 },
  { id: '1060', name: 'Mariahilf', group: 1 },
  { id: '1070', name: 'Neubau', group: 1 },
  { id: '1080', name: 'Josefstadt', group: 1 },
  { id: '1090', name: 'Alsergrund', group: 1 },
  { id: '1100', name: 'Favoriten', group: 1 },
  { id: '1110', name: 'Simmering', group: 11 },
  { id: '1120', name: 'Meidling', group: 12 },
  { id: '1130', name: 'Hietzing', group: 12 },
  { id: '1140', name: 'Penzing', group: 12 },
  { id: '1150', name: 'Rudolfsheim', group: 12 },
  { id: '1160', name: 'Ottakring', group: 12 },
  { id: '1170', name: 'Hernals', group: 12 },
  { id: '1180', name: 'Waehring', group: 12 },
  { id: '1190', name: 'Doebling', group: 12 },
  { id: '1200', name: 'Brigittenau', group: 12 },
  { id: '1210', name: 'Floridsdorf', group: 12 },
  { id: '1220', name: 'Donaustadt', group: 12 },
  { id: '1230', name: 'Liesing', group: 12 },
];

export const getDistrictPrice = (group: number, type: VehicleType) => {
  if (group === 11) return type === 'limo' ? '30' : type === 'kombi' ? '35' : '50';
  if (group === 1) return type === 'limo' ? '33' : type === 'kombi' ? '38' : '53';
  return type === 'limo' ? '35' : type === 'kombi' ? '40' : '55';
};
