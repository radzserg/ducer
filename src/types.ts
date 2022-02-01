export type StoryBag = {
  [name in string]: Factory<any, any, any>;
};

export type Factory<I, O, D = {}> = (input: Partial<I>, dependencies: D) => O;

export type ExtractInputParameter<Type> = Type extends Factory<
  infer X,
  any,
  any
>
  ? Partial<X>
  : never;

// type T = Awaited<Promise<PromiseLike<number>>

export type ExtractOutputParameter<Type> = Type extends Factory<
  any,
  infer X,
  any
>
  ? X extends PromiseLike<infer U>
    ? U
    : X
  : never;

export type ExistingStoriesMap<Acc extends StoryBag> = {
  [x: string]: keyof Acc;
};

// export type AddFactory<
//   Acc extends StoryBag,
//   Name extends string,
//   F
// > = F extends Factory<any, any, any>
//   ? AddSimpleFactory<Acc, Name, F>
//   : F extends ExistingStoriesMap<Acc>
//   ? AddParentFactory<Acc, Name, F>
//   : never;

export type AddSimpleFactory<
  Acc extends StoryBag,
  Name extends string,
  F
> = Acc &
  {
    [k in Name]: F extends Factory<any, any, any> ? F : never;
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
