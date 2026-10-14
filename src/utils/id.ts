/**
 * The start of an id (its first 8 characters), for a list that has no room for
 * all of it. Whoever shows it puts the whole id in the `title`; the detail
 * panel shows it in full.
 */
export const shortId = (id: string): string => (id.length > 8 ? `${id.slice(0, 8)}…` : id)
