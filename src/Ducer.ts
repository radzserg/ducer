import {
  AddFactory,
  FactoryDependenciesMap,
  ExtractInputParameter,
  ExtractOutputParameter,
  Factory,
  Factories,
} from "./types";

export class Ducer<ExistingFactories extends Factories = {}> {
  public readonly factories: ExistingFactories = {} as ExistingFactories;

  /**
   * Adds factory
   */
  public addFactory<
    Name extends string,
    NewFactory extends Factory<
      any,
      any,
      ExistingFactories,
      NewFactoryDependenciesMap
    >,
    NewFactoryDependenciesMap extends FactoryDependenciesMap<ExistingFactories> = {}
  >(
    name: Name,
    f: NewFactory,
    dependencies?: NewFactoryDependenciesMap
  ): asserts this is Ducer<
    AddFactory<ExistingFactories, Name, NewFactory, NewFactoryDependenciesMap>
  > {
    if (this.factories[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }
    // @ts-ignore
    this.factories[name] = f;
  }

  /**
   * Adds parent factory
   * @param name - name
   * @param existingStoriesMap - existing dependencies map { "dependencyName": "existingFactoryName"}
   * @param factory - factory implementation
   */
  public addParentFactory<
    N extends string,
    M extends FactoryDependenciesMap<ExistingFactories>,
    F extends Factory
  >(name: N, existingStoriesMap: M, factory: F) {
    // : asserts this is Ducer<AddParentFactory<ExistingFactories, N, M, F>> {
    if (this.factories[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }
    // @ts-ignore
    this.factories[name] = (
      args: {
        [Property in keyof M]: Partial<
          ExtractInputParameter<ExistingFactories[M[Property]]>
        >;
      } &
        {
          [k in N]: ExtractInputParameter<F>;
        }
    ) => {
      const promiseDeps: any[] = [];
      const nonPromiseDeps: any[] = [];
      Object.entries(existingStoriesMap).forEach(([k, v]) => {
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
          Promise.all(promiseDeps.map((promiseDeps) => promiseDeps[1])).then(
            (resolvedDeps) => {
              const deps = {
                ...Object.fromEntries(
                  promiseDeps.map(([k]) => [k, resolvedDeps.shift()])
                ),
                ...Object.fromEntries(nonPromiseDeps),
              };
              const result = factory(args[name], deps);
              if (!(result instanceof Promise)) {
                throw new Error(
                  `${name} factory must be defined as async function`
                );
              }
              result.then((r: any) => {
                resolve(r);
              });
            }
          );
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
  public async make<N extends keyof ExistingFactories>(
    name: N,
    args?: ExtractInputParameter<ExistingFactories[N]>
  ): Promise<
    N extends keyof ExistingFactories
      ? { [n in N]: ExtractOutputParameter<ExistingFactories[N]> }
      : never
  > {
    const factory: Factory = this.factories[name];
    if (!factory) {
      throw new Error(`Factory ${name} does not exist`);
    }
    return new Promise((resolve) => {
      factory(args ?? {}).then((resolvedResult) => {
        // @ts-ignore
        resolve({ [name]: resolvedResult });
      });
    });
  }
}
