export type UnionToIntersection<U> = (
  U extends never ? never : (_: U) => void
) extends (_: infer I) => void
  ? I
  : never;
