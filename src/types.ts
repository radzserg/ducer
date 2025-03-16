/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */

export type IncomeFactory<
  Input = any,
  Output extends Promise<any> = Promise<any>,
  ExistingFactories extends Factories = {},
  NewDependencies = void
> = NewDependencies extends FactoryDependenciesMap<ExistingFactories>
  ? (
      input: Input,
      deps: {
        [Property in keyof NewDependencies]: ExtractOutputParameter<
          ExistingFactories[NewDependencies[Property]]
        >;
      }
    ) => Output
  : (input?: Input) => Output;

export type OutcomeFactory<
  Input = any,
  Output extends Promise<any> = Promise<any>,
  ExistingFactories extends Factories = {},
  NewDependencies = void
> = NewDependencies extends FactoryDependenciesMap<ExistingFactories>
  ? (
      input?: Input,
      deps?: {
        [Property in keyof NewDependencies]: ExtractInputParameter<
          ExistingFactories[NewDependencies[Property]]
        >;
      }
    ) => Output
  : (input?: Input) => Output;

export type Factories = {
  [name in string]: OutcomeFactory;
};

export type FactoryDependenciesMap<ExistingFactories extends Factories> = {
  [x: string]: keyof ExistingFactories;
};

export type ExtractInputParameter<F> = F extends (...args: any) => any
  ? Parameters<F>[0]
  : never;

export type ExtractOutputParameter<F> = F extends (...args: any) => any
  ? Awaited<ReturnType<F>>
  : never;

export type AddFactoryWithDeps<
  ExistingFactories extends Factories,
  Name extends string,
  NewFactory extends IncomeFactory<
    any,
    any,
    ExistingFactories,
    FactoryDependencies
  >,
  FactoryDependencies extends FactoryDependenciesMap<ExistingFactories> = {}
> = ExistingFactories &
  {
    [k in Name]: OutcomeFactory<
      ExtractInputParameter<NewFactory>,
      Promise<
        {
          [n in Name]: Awaited<ReturnType<NewFactory>>;
        } &
          {
            [Property in keyof FactoryDependencies]: Awaited<
              ReturnType<ExistingFactories[FactoryDependencies[Property]]>
            >;
          }
      >,
      ExistingFactories,
      FactoryDependencies
    >;
  };
