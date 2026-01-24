export function getRetirementYearFromDateString(
  dateString: string | null | undefined,
): number | undefined {
  if (!dateString) {
    return undefined;
  }
  try {
    return new Date(dateString).getFullYear();
  } catch {
    return undefined;
  }
}
