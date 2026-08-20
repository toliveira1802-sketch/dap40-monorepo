export function isValidLicensePlate(plate: string): boolean {
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const standardRegex = /^[A-Z]{3}[0-9]{4}$/;
  const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return standardRegex.test(cleaned) || mercosulRegex.test(cleaned);
}
