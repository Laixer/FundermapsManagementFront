import { computed, onBeforeMount, ref, type ComputedRef, type Ref } from 'vue'

export interface UseListResourceOptions<T> {
  /** Fetch the full list of rows. */
  fetch: () => Promise<T[]>
  /** Search predicate. Omit for views without a search box. */
  filter?: (item: T, query: string) => boolean
  /** Optional detail fetch run after a row is selected (e.g. getUser by id). */
  resolve?: (row: T) => T | Promise<T>
  /** Side-effects to run on select, before `record` is updated. Receives the previously selected row. */
  onSelect?: (row: T, previous: T | null) => void
  /** Select the first row after each refresh (default true). */
  autoSelectFirst?: boolean
  /** Fetch on mount (default true). Set false to drive initialisation manually. */
  immediate?: boolean
}

export interface UseListResource<T> {
  rows: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<boolean>
  search: Ref<string>
  record: Ref<T | null>
  filteredRows: ComputedRef<T[]>
  refresh: () => Promise<void>
  select: (row: T) => Promise<void>
  selectFirst: () => void
  refreshAndSelectFirst: () => Promise<void>
}

/**
 * Shared plumbing for the admin list views: a fetched list with loading/error
 * state, a search-filtered view of it, and a selected `record` shown in the
 * docked detail panel. The first row is selected on load so the panel is never
 * empty. View-specific behaviour hangs off the `filter`, `resolve` and
 * `onSelect` hooks.
 */
export function useListResource<T>(options: UseListResourceOptions<T>): UseListResource<T> {
  const rows = ref([]) as Ref<T[]>
  const loading = ref(true)
  const error = ref(false)
  const search = ref('')
  const record = ref(null) as Ref<T | null>

  const filteredRows = computed<T[]>(() => {
    const query = search.value.trim().toLowerCase()
    if (!query || !options.filter) return rows.value
    return rows.value.filter((item) => options.filter!(item, query))
  })

  async function refresh() {
    try {
      loading.value = true
      error.value = false
      rows.value = await options.fetch()
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  async function select(row: T) {
    options.onSelect?.(row, record.value)
    record.value = row
    if (options.resolve) record.value = await options.resolve(row)
  }

  function selectFirst() {
    const first = filteredRows.value[0]
    if (first) select(first)
  }

  async function refreshAndSelectFirst() {
    await refresh()
    if (options.autoSelectFirst !== false) selectFirst()
  }

  if (options.immediate !== false) {
    onBeforeMount(refreshAndSelectFirst)
  }

  return {
    rows,
    loading,
    error,
    search,
    record,
    filteredRows,
    refresh,
    select,
    selectFirst,
    refreshAndSelectFirst,
  }
}
