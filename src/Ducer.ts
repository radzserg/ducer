import {
  AddParentFactory,
  AddSimpleFactory,
  ExtractInputParameter,
  ExtractOutputParameter,
  Factory,
  StoryBag,
} from "./types";

export class Ducer<S extends StoryBag = {}> {
  public readonly bag: S = {} as S;

  public addStory<N extends string, F extends Factory<any, any>>(
    name: N,
    f: F
  ): asserts this is Ducer<AddSimpleFactory<S, N, F>> {
    // @ts-ignore
    this.bag[name] = f;
  }
  public addSubStory<
    N extends string,
    M extends ExistingStoriesMap<S>,
    F extends Factory<
      any,
      any,
      {
        [Property in keyof M]: ExtractOutputParameter<S[M[Property]]>;
      }
    >
  >(
    name: N,
    existingStoriesMap: M,
    factory: F
  ): asserts this is Ducer<AddParentFactory<S, N, M, F>> {
    // return ({} as unknown) as any;
  }

  public make<N extends keyof S>(
    name: N,
    args: ExtractInputParameter<S[N]>
  ): N extends keyof S ? ExtractOutputParameter<S[N]> : never {
    const factory: Factory<any, any> = this.bag[name]
    if (!factory) {
      throw new Error(`Factory ${name} does not exist`)
    }
    return factory(args);
  }
}

export type ExistingStoriesMap<Acc extends StoryBag> = {
  [x: string]: keyof Acc;
};
