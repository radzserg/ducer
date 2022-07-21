export type Factory<Input = any, Output = any, Dependencies = {}> = (
  input: Partial<Input>,
  dependencies: Dependencies
) => Promise<Output>;

export type StoryBag = {
  [name in string]: Factory;
};

export type ExtractInputParameter<F> = F extends Factory<infer X, any, any>
  ? Partial<X>
  : never;

export type ExtractOutputParameter<Type> = Type extends Factory<
  any,
  infer X,
  any
>
  ? X
  : never;

export type AddFactory<Acc extends StoryBag, Name extends string, F> = Acc &
  {
    [k in Name]: F extends Factory ? F : never;
  };

export type ExistingStoriesMap<Acc extends StoryBag> = {
  [x: string]: keyof Acc;
};

export type AddParentFactory<
  Acc extends StoryBag,
  Name extends string,
  ExistingFactoriesMap extends ExistingStoriesMap<Acc>,
  F extends Factory<
    any,
    any,
    {
      [Property in keyof ExistingFactoriesMap]: ExtractOutputParameter<
        Acc[ExistingFactoriesMap[Property]]
      >;
    }
  >
> = Acc &
  {
    [k in Name]: Factory<
      {
        [Property in keyof ExistingFactoriesMap]: Partial<
          ExtractInputParameter<Acc[ExistingFactoriesMap[Property]]>
        >;
      } &
        {
          [k in Name]: ExtractInputParameter<F>;
        },
      ReturnType<F>,
      void
    >;
  };
