export interface IMapset {
  id: string
  name: string
  slug: string
  layers: string[]
  metadata: object // JSON blob: the map center ({ center: [lon, lat] })
  public: boolean
  consent: string | null
  note: string
  icon: string | null
  order: number
  layerset: string // JSON blob TODO: array of layerset items
}
