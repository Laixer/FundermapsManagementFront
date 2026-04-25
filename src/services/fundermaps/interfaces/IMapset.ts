export interface IMapset {
  id: string
  name: string
  slug: string
  style: string
  layers: string[]
  metadata: object // JSON blob TODO: Mapbox options
  public: boolean
  consent: string | null
  note: string
  icon: string | null
  order: number
  layerset: string // JSON blob TODO: array of layerset items
}
