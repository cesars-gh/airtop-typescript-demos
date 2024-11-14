/**
 * Converts a camelCase field name to a human-readable label.
 */
export function toFormFieldLabel(fieldName: string) {
  return (
    fieldName
      // Add space before capital letters
      .replace(/([A-Z])/g, " $1")
      // Capitalize first letter
      .replace(/^./, (str) => str.toUpperCase())
      // Remove any leading space
      .trim()
      // Replace "Id" with "ID"
      .replace(/\bId\b/g, "ID")
      // Replace "Api" with "API"
      .replace(/\bApi\b/g, "API")
  );
}
