/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
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
              if (!Object.prototype.hasOwnProperty.call(this, dependencyMappedName)) {
                throw new Error(
                  `Factory ${String(dependencyMappedName)} does not exist`
                );
              }

              // @ts-expect-error - we know that dependencyFactory is a function
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

      // @ts-expect-error - we know that factory is a function
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
}
