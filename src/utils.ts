/**
 * Add query parameters to URL
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

export function isObject(item: any): item is object {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
