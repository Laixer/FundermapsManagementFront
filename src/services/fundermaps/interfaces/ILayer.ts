export interface ILayerField {
  name: string
  color: string
}

export interface ILayer {
  id: string
  name: string
  order: number
  fields: ILayerField[]
}
