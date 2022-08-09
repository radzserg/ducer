import {
  AddFactory,
  AddFactoryWithDeps,
  Factories,
  OutcomeFactory,
  FactoryDependenciesMap,
  IncomeFactory,
} from "./types";

export class Ducer<
  ExistingFactories extends Factories = {},
  FormattedFactories extends Factories = {}
> {
  private factories: ExistingFactories = {} as ExistingFactories;

  addFactory<Name extends string, NewFactory extends (input: any) => any>(
    name: Name,
    f: NewFactory
  ): asserts this is Ducer<ExistingFactories & { [k in Name]: NewFactory }> &
    FormattedFactories &
    AddFactory<ExistingFactories, Name, NewFactory>;
  addFactory<
    Name extends string,
    NewFactory extends IncomeFactory<
      any,
      any,
      ExistingFactories,
      NewFactoryDependenciesMap
    >,
    NewFactoryDependenciesMap extends FactoryDependenciesMap<ExistingFactories>
  >(
    name: Name,
    f: NewFactory,
    dependencies?: NewFactoryDependenciesMap
  ): asserts this is Ducer<ExistingFactories & { [k in Name]: NewFactory }> &
    FormattedFactories &
    AddFactoryWithDeps<
      ExistingFactories,
      Name,
      NewFactory,
      NewFactoryDependenciesMap
    >;

  addFactory(
    name: string,
    factory: OutcomeFactory,
    dependencies?: FactoryDependenciesMap<ExistingFactories>
  ) {
    if (this.factories[name]) {
      throw new Error(`Factory with name ${name} has been already defined`);
    }

    const wrappedFactory = async (
      input: Parameters<OutcomeFactory>,
      dependencyInputValues?: any
    ) => {
      let dependencyValues = {};
      if (dependencies) {
        const unmergedDependencyValues: {
          [x: string]: any;
        }[] = await Promise.all(
          Object.entries(dependencies).map(
            ([dependencyName, dependencyMappedName]) => {
              if (!this.hasOwnProperty(dependencyMappedName)) {
                throw new Error(
                  `Factory ${dependencyMappedName} does not exist`
                );
              }
              // @ts-ignore
              const dependencyFactory: OutcomeFactory = this[
                dependencyMappedName
              ];
              const dependencyInput = dependencyInputValues[dependencyName];
              return new Promise<{
                [x: string]: any;
              }>((resolve) => {
                dependencyFactory(dependencyInput).then((result) => {
                  resolve({ [dependencyName]: result[dependencyMappedName] });
                });
              });
            }
          )
        );
        unmergedDependencyValues.forEach((v) => {
          dependencyValues = { ...dependencyValues, ...v };
        });
      }

      // @ts-ignore
      const result = await factory(input, dependencyValues);
      return {
        ...{ [name]: result },
        ...dependencyValues,
      };
    };

    Object.defineProperty(this, name, {
      value: wrappedFactory.bind(this),
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }

  // /**
  //  * Adds factory
  //  */
  // public addFactory<
  //   Name extends string,
  //   NewFactory extends Factory<
  //     any,
  //     any,
  //     ExistingFactories,
  //     NewFactoryDependenciesMap
  //   >,
  //   NewFactoryDependenciesMap extends FactoryDependenciesMap<ExistingFactories> = {}
  // >(
  //   name: Name,
  //   f: NewFactory,
  //   dependencies?: NewFactoryDependenciesMap
  // ): asserts this is Ducer<
  //   AddFactory<ExistingFactories, Name, NewFactory, NewFactoryDependenciesMap>
  // > {
  //   if (this.factories[name]) {
  //     throw new Error(`Factory with name ${name} has been already defined`);
  //   }
  //   // @ts-ignore
  //   this.factories[name] = f;
  // }

  // public createFactory<
  //   Name extends string,
  //   NewFactory extends Factory<
  //     any,
  //     any,
  //     ExistingFactories,
  //     NewFactoryDependenciesMap
  //   >,
  //   NewFactoryDependenciesMap extends FactoryDependenciesMap<ExistingFactories> = {}
  // >(
  //   name: Name,
  //   f: NewFactory,
  //   dependencies?: NewFactoryDependenciesMap
  // ): asserts this is Ducer &
  //   {
  //     [k in Name]: FactoryReturnValueWithDeps<
  //       Name,
  //       NewFactory,
  //       ExistingFactories,
  //       NewFactoryDependenciesMap
  //     >;
  //   } {}

  /**
   * Adds parent factory
   * @param name - name
   * @param existingStoriesMap - existing dependencies map { "dependencyName": "existingFactoryName"}
   * @param factory - factory implementation
   */
  // public addParentFactory<
  //   N extends string,
  //   M extends FactoryDependenciesMap<ExistingFactories>,
  //   F extends Factory
  // >(name: N, existingStoriesMap: M, factory: F) {
  //   // : asserts this is Ducer<AddParentFactory<ExistingFactories, N, M, F>> {
  //   if (this.factories[name]) {
  //     throw new Error(`Factory with name ${name} has been already defined`);
  //   }
  //   // @ts-ignore
  //   this.factories[name] = (
  //     args: {
  //       [Property in keyof M]: Partial<
  //         ExtractInputParameter<ExistingFactories[M[Property]]>
  //       >;
  //     } &
  //       {
  //         [k in N]: ExtractInputParameter<F>;
  //       }
  //   ) => {
  //     const promiseDeps: any[] = [];
  //     const nonPromiseDeps: any[] = [];
  //     Object.entries(existingStoriesMap).forEach(([k, v]) => {
  //       const depArgs = args[k];
  //       // @ts-ignore
  //       const result: any = this.make(v, depArgs);
  //       if (result instanceof Promise) {
  //         promiseDeps.push([k, result]);
  //       } else {
  //         nonPromiseDeps.push([k, result]);
  //       }
  //     });
  //
  //     if (promiseDeps.length) {
  //       return new Promise((resolve) => {
  //         Promise.all(promiseDeps.map((promiseDeps) => promiseDeps[1])).then(
  //           (resolvedDeps) => {
  //             const deps = {
  //               ...Object.fromEntries(
  //                 promiseDeps.map(([k]) => [k, resolvedDeps.shift()])
  //               ),
  //               ...Object.fromEntries(nonPromiseDeps),
  //             };
  //             // @ts-ignore
  //             const result = factory(args[name], deps);
  //             if (!(result instanceof Promise)) {
  //               throw new Error(
  //                 `${name} factory must be defined as async function`
  //               );
  //             }
  //             result.then((r: any) => {
  //               resolve(r);
  //             });
  //           }
  //         );
  //       });
  //     } else {
  //       // @ts-ignore
  //       return factory(args[name], Object.fromEntries(nonPromiseDeps));
  //     }
  //   };
  // }

  // /**
  //  * Calls factory
  //  */
  // public async make<N extends keyof ExistingFactories>(
  //   name: N,
  //   input?: Partial<Parameters<ExistingFactories[N]>[0]>,
  //   dependenciesInput?: Parameters<ExistingFactories[N]>[1]
  // ): Promise<
  //   N extends keyof ExistingFactories
  //     ? { [n in N]: Awaited<ReturnType<ExistingFactories[N]>> } &
  //         (Parameters<ExistingFactories[N]>[1] extends void
  //           ? {}
  //           : Parameters<ExistingFactories[N]>[1])
  //     : never
  // > {
  //   const factory: Factory = this.factories[name];
  //   if (!factory) {
  //     throw new Error(`Factory ${name} does not exist`);
  //   }
  //   return new Promise((resolve) => {
  //     // @ts-ignore
  //     factory(input ?? {}, dependenciesInput ?? {}).then((resolvedResult) => {
  //       // @ts-ignore
  //       resolve({ [name]: resolvedResult });
  //     });
  //   });
  // }
}
