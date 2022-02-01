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

  /**
   * Adds factory
   * @param name - factory name
   * @param f - factory implementation
   */
  public addFactory<N extends string, F extends Factory<any, any>>(
    name: N,
    f: F
  ): asserts this is Ducer<AddSimpleFactory<S, N, F>> {
    if (this.bag[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }
    // @ts-ignore
    this.bag[name] = f;
  }

  /**
   * Adds parent factory
   * @param name - name
   * @param existingStoriesMap - existing dependencies map { "dependencyName": "existingFactoryName"}
   * @param factory - factory implementation
   */
  public addParentFactory<
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
    ) => {
      let promiseDeps: any[] = [];
      let nonPromiseDeps: any[] = [];
      Object.entries(existingStoriesMap)
        .forEach(([k, v]) => {
          const depArgs = args[k];
          // @ts-ignore
          const result: any = this.make(v, depArgs);
          if (result instanceof Promise) {
            promiseDeps.push([k, result]);
          } else {
            nonPromiseDeps.push([k, result]);
          }
        });

      if (promiseDeps.length) {
        return new Promise((resolve) => {
          Promise.all(promiseDeps.map(([_, p]) => p)).then(resolvedDeps => {
            const deps = {
              ...Object.fromEntries(promiseDeps.map(([k]) => [k, resolvedDeps.shift()])),
              ...Object.fromEntries(nonPromiseDeps)
            }
            const result = factory(args[name], deps);
            if (!(result instanceof Promise)) {
              throw new Error(`${name} factory must be defined as async function`)
            }
            result.then((r: any) => {
              resolve(r)
            })
          })
        });
      } else {
        // @ts-ignore
        return factory(args[name], Object.fromEntries(nonPromiseDeps));
      }
    };
  }

  /**
   * Calls factory
   * @param name
   * @param args
   */
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
