<script setup lang="ts" generic="T">
import Skeleton from '@/components/Common/Skeleton.vue'

type Column = {
  field: string
  title: string
  width?: string
  align?: 'left' | 'right' | 'center'
  // For the header and every cell of the column, e.g. to leave the column out
  // while the table is too narrow for it (`@max-[38rem]:hidden`).
  class?: string
}

const props = withDefaults(
  defineProps<{
    rows: T[]
    columns: Column[]
    loading?: boolean
    selectedId?: string | number | null
    emptyMessage?: string
    loadingMessage?: string
    rowKey?: (row: T) => string | number
    clickable?: boolean
    // Columns keep the width they are given and the others share the rest
    // equally, whatever is in them.
    fixed?: boolean
  }>(),
  {
    loading: false,
    selectedId: null,
    emptyMessage: 'No records.',
    loadingMessage: 'Loading…',
    clickable: true,
    fixed: false,
  },
)

const emit = defineEmits<{ select: [row: T] }>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fieldValue = (row: T, field: string): any => (row as Record<string, unknown>)[field]

const keyFor = (row: T, idx: number): string | number => {
  if (props.rowKey) return props.rowKey(row)
  const id = fieldValue(row, 'id')
  return typeof id === 'string' || typeof id === 'number' ? id : idx
}

const alignClass = (align?: 'left' | 'right' | 'center') =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

const isSelected = (row: T): boolean => {
  if (props.selectedId == null) return false
  return fieldValue(row, 'id') === props.selectedId
}

// A natural-looking skeleton bar width per column: narrow for numeric/aligned
// columns, wider for the main text columns.
const skeletonWidth = (c: Column): string => (c.align === 'right' || c.width ? '45%' : '75%')
</script>

<template>
  <div class="@container overflow-x-auto rounded-md border border-grey-200 bg-white">
    <table class="w-full text-sm" :class="fixed && 'table-fixed'">
      <thead
        class="border-b border-grey-200 bg-grey-100 text-xs font-semibold uppercase tracking-wide text-grey-700"
      >
        <tr>
          <th
            v-for="c in columns"
            :key="c.field"
            class="px-3 py-2 whitespace-nowrap"
            :class="[alignClass(c.align), c.class]"
            :style="c.width ? { width: c.width } : undefined"
          >
            {{ c.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 6" :key="`skeleton-${n}`" class="border-t border-grey-200">
            <td v-for="c in columns" :key="c.field" class="px-3 py-2.5" :class="c.class">
              <Skeleton :width="skeletonWidth(c)" />
            </td>
          </tr>
        </template>
        <tr
          v-for="(row, idx) in rows"
          v-else
          :key="keyFor(row, idx)"
          class="border-t border-grey-200 transition-colors"
          :class="[
            clickable && 'cursor-pointer hover:bg-grey-100',
            isSelected(row) && 'bg-grey-100',
          ]"
          @click="clickable && emit('select', row)"
        >
          <td
            v-for="c in columns"
            :key="c.field"
            class="px-3 py-2 align-middle text-grey-800"
            :class="[alignClass(c.align), c.class]"
          >
            <slot :name="c.field" :row="row" :value="fieldValue(row, c.field)">
              {{ fieldValue(row, c.field) ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="$slots.footer && !loading && rows.length">
        <slot name="footer" />
      </tfoot>
    </table>
    <!-- Below the table, not in a cell spanning it: such a cell also counts the
         columns a narrow table hides, and the extra columns squeezed the headers. -->
    <p v-if="!loading && !rows.length" class="px-3 py-4 text-center text-sm text-grey-700">
      {{ emptyMessage }}
    </p>
  </div>
</template>
