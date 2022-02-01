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
    if (this.bag[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }
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
    if (this.bag[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }
    // @ts-ignore
    this.bag[name] = (
      args: {
        [Property in keyof M]: Partial<ExtractInputParameter<S[M[Property]]>>;
      } &
        {
          [k in N]: ExtractInputParameter<F>;
        }
    ): ReturnType<F> => {
      const deps = Object.fromEntries(
        Object.entries(existingStoriesMap).map(([k, v]) => {
          const depArgs = args[k];
          // @ts-ignore
          return [k, this.make(v, depArgs)];
        })
      );

      // @ts-ignore
      return factory(args[name], deps);
    };
  }

  public make<N extends keyof S>(
    name: N,
    args: ExtractInputParameter<S[N]>
  ): N extends keyof S ? ExtractOutputParameter<S[N]> : never {
    const factory: Factory<any, any> = this.bag[name];
    if (!factory) {
      throw new Error(`Factory ${name} does not exist`);
    }
    return factory(args, {});
  }
}

export type ExistingStoriesMap<Acc extends StoryBag> = {
  [x: string]: keyof Acc;
};
