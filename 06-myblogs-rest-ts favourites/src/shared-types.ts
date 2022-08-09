export type IdType = number | undefined

export type FormFieldDict<V> = {
    [key: string]: V;
  };

export type Optional<V> = V | undefined