/**
 * Appends query parameters to a URL while handling existing parameters.
 *
 * @param url - The base URL to which parameters will be added.
 * @param params - An object containing key-value pairs of parameters to add. Null or undefined values will be automatically filtered out.
 * @returns The constructed URL with query parameters. If no valid parameters are provided, the original URL is returned unchanged.
 */
export function addQueryParams(
  url: string,
  params: Record<string, string | number | boolean>
): string {
  const entries = Object.entries(params).filter((entry) => entry[1] != null);

  if (!entries.length) return url;

  const searchParams = new URLSearchParams();
  entries.forEach(([key, value]) => searchParams.append(key, String(value)));

  return `${url}${url.includes("?") ? "&" : "?"}${searchParams.toString()}`;
}

/**
 * Recursively merges two or more objects
 * @param target is the base object that the others will be combined into
 * @* @forum sources Objects that need to be combined with the base
 * @returns A new object containing the combined properties
 */
export function deepMergeObject<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;

  const output: any = { ...target };

  for (const source of sources) {
    if (!isObject(source)) continue;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key]) && key in target && isObject(target[key])) {
          output[key] = deepMergeObject(
            target[key] as object,
            source[key] as object
          );
        } else {
          output[key] = source[key];
        }
      }
    }
  }

  return output;
}

/**
 * Checks if the given item is a plain object (and not an array or null).
 * @param item - The item to check.
 * @returns True if the item is a non-null object and not an array, false otherwise.
 */
export function isObject(item: any): item is object {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Checks if an object is empty (has no own enumerable properties).
 * @param obj - The object to check.
 * @returns True if the object has no enumerable properties, false otherwise.
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
