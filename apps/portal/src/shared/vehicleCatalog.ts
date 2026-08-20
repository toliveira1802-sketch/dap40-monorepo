export const OTHER_MAKE = "OUTRA";

const VEHICLE_CATALOG: Record<string, string[]> = {
  Chevrolet: ["Onix", "Tracker", "Cruze", "S10", "Spin", "Montana", "Prisma", "Celta", "Astra", "Equinox"],
  Volkswagen: ["Gol", "Polo", "T-Cross", "Nivus", "Virtus", "Saveiro", "Taos", "Amarok", "Jetta", "Fox", "Voyage", "Golf"],
  Fiat: ["Strada", "Mobi", "Argo", "Pulse", "Fastback", "Toro", "Fiorino", "Cronos", "Uno", "Palio", "Siena"],
  Toyota: ["Corolla", "Corolla Cross", "Hilux", "Yaris", "SW4", "Etios", "RAV4", "Camry"],
  Hyundai: ["HB20", "HB20S", "Creta", "Tucson", "i30", "Santa Fe", "IX35", "HR"],
  Honda: ["Civic", "HR-V", "City", "Fit", "WR-V", "CR-V", "Accord"],
  Jeep: ["Renegade", "Compass", "Commander", "Wrangler", "Grand Cherokee"],
  Renault: ["Kwid", "Duster", "Sandero", "Logan", "Oroch", "Captur", "Master", "Megane", "Clio"],
  Nissan: ["Kicks", "Versa", "Sentra", "Frontier", "March", "Tiida", "Livina"],
  Ford: ["Ka", "EcoSport", "Ranger", "Fiesta", "Focus", "Fusion", "Territory", "Maverick"],
  BMW: ["Série 3 (320i)", "X1", "X3", "X5", "Série 1 (118i/120i)", "Série 4", "M3"],
  "Mercedes-Benz": ["Classe C (C180/C200)", "GLA", "GLC", "Classe A", "Sprinter", "CLA"],
  Audi: ["A3", "A4", "Q3", "Q5", "A5", "Q7", "TT"],
  Peugeot: ["208", "2008", "3008", "Partner", "207", "308"],
  Citroën: ["C3", "C4 Cactus", "Aircross", "Jumpy", "C3 Picasso", "C4 Pallas"],
  Mitsubishi: ["L200 Triton", "ASX", "Eclipse Cross", "Pajero", "Outlander", "Lancer"],
  CaoaChery: ["Tiggo 5X", "Tiggo 7", "Tiggo 8", "Arrizo 6", "iCar"],
  BYD: ["Dolphin", "Song Plus", "Seal", "Yuan Plus", "Dolphin Mini"],
  GWM: ["Haval H6", "Ora 03", "Tank 300"],
};

export function listVehicleMakes(): string[] {
  return [...Object.keys(VEHICLE_CATALOG), OTHER_MAKE];
}

export function listVehicleModels(make: string): string[] {
  if (make === OTHER_MAKE || !VEHICLE_CATALOG[make]) {
    return [];
  }
  return VEHICLE_CATALOG[make];
}
