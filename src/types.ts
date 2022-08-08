import {
  PaidProject,
  PaidProjectInput,
  User,
  UserInput,
} from "./__tests__/testTypes";

export type Factory<
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
  : (input: Input) => Output;

export type Factories = {
  [name in string]: Factory;
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

export type UnwrapDucer<
  FormattedFactories extends Factories = {}
> = {
  // addFactory<Name extends string, NewFactory extends Factory<any, any>>(
  //   name: Name,
  //   f: NewFactory
  // ): void;
  // addFactory<
  //   Name extends string,
  //   NewFactory extends Factory<
  //     any,
  //     any,
  //     ExistingFactories,
  //     NewFactoryDependenciesMap
  //   >,
  //   NewFactoryDependenciesMap extends FactoryDependenciesMap<ExistingFactories>
  // >(
  //   name: Name,
  //   f: NewFactory,
  //   dependencies?: NewFactoryDependenciesMap
  // ): void;
} & FormattedFactories;

export type AddFactoryWithDeps<
  ExistingFactories extends Factories,
  Name extends string,
  NewFactory extends Factory<any, any, ExistingFactories, FactoryDependencies>,
  FactoryDependencies extends FactoryDependenciesMap<ExistingFactories> = {}
> = ExistingFactories &
  {
    [k in Name]: Factory<
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

export type AddFactory<
  ExistingFactories extends Factories,
  Name extends string,
  NewFactory extends Factory<any, any>
> = ExistingFactories &
  {
    [k in Name]: Factory<
      ExtractInputParameter<NewFactory>,
      Promise<
        {
          [n in Name]: Awaited<ReturnType<NewFactory>>;
        }
      >,
      ExistingFactories
    >;
  };

type UserFactory = Factory<Partial<UserInput>, Promise<User>>;

type PaidProjectFactory = Factory<
  Partial<PaidProjectInput>,
  Promise<PaidProject>,
  {
    user: UserFactory;
  },
  { contractor: "user"; client: "user" }
>;

export type FactoryReturnValueWithDeps<
  N extends string,
  F extends Factory<any, any, ExistingFactories, NewDependencies>,
  ExistingFactories extends Factories = any,
  NewDependencies extends FactoryDependenciesMap<ExistingFactories> = any
> = Factory<
  ExtractInputParameter<F>,
  Promise<
    {
      [n in N]: Awaited<ReturnType<F>>;
    } &
      {
        [Property in keyof NewDependencies]: ExtractOutputParameter<
          ExistingFactories[NewDependencies[Property]]
        >;
      }
  >,
  ExistingFactories,
  NewDependencies
>;

type T1 = FactoryReturnValueWithDeps<
  "p",
  PaidProjectFactory,
  {
    user: UserFactory;
  },
  { contractor: "user"; client: "user" }
>;

// let userFactory: UserFactory = ({} as unknown) as any;
// const user = await userFactory(
//   {
//     firstName: "John",
//   },
//   {}
// );

//   (
//     paidProject: Partial<PaidProjectInput>
//      { client, contractor }: { client: User; contractor: User }
//   ) => Promise<{
//     paidProject: PaidProject;
//     contractor: User;
//   }>,
//   { contractor: "user", client: "user" }

// let paidProjectFactory: PaidProjectFactory = (
//   paidProject: Partial<PaidProjectInput>,
//   { client, contractor }: { client: User; contractor: User }
// ): Promise<{
//   paidProject: PaidProject;
//   contractor: User;
// }> => {
//   return ({} as unknown) as any;
// };
// const paidProject = await paidProjectFactory(
//   {
//     title: "John",
//   },
//   {
//     contractor: {
//       id: 123,
//       firstName: "John",
//       lastName: "Doe",
//       createdAt: new Date(),
//     },
//     client: {
//       id: 123,
//       firstName: "John",
//       lastName: "Doe",
//       createdAt: new Date(),
//     },
//   }
// );

// export type AddFactory<
//   ExistingFactories extends Factories,
//   Name extends string,
//   NewFactory extends Factory<
//     any,
//     any,
//     {
//       [Property in keyof FactoryDependencies]: ExtractOutputParameter<
//         ExistingFactories[FactoryDependencies[Property]]
//       >;
//     }
//   >,
//   FactoryDependencies extends FactoryDependenciesMap<ExistingFactories> = {}
// > = ExistingFactories &
//   {
//     [k in Name]: Factory<
//       {
//         [Property in keyof FactoryDependencies]: Partial<
//           ExtractInputParameter<
//             ExistingFactories[FactoryDependencies[Property]]
//           >
//         >;
//       } &
//         {
//           [k in Name]: ExtractInputParameter<NewFactory>;
//         },
//       ReturnType<NewFactory>,
//       void
//     >;
//   };

// async (
//         paidProject: Partial<PaidProjectInput>,
//         { client, contractor }: { client: User; contractor: User }
//       ) => {
//         return {
//           client,
//           contractor,
//           paidProject: {
//             ...{
//               id: 456,
//               title: "Generated title",
//             },
//             ...paidProject,
//           },
//         };
//       },
//       {
//         contractor: "user",
//         client: "user",
//       }

// type ExistingFactoriesOne = {
//   user: Factory<Partial<UserInput>, Promise<User>>;
// };
// type TestF = AddFactory<
//   ExistingFactoriesOne,
//   "paidProject",
//   (
//     paidProject: Partial<PaidProjectInput>,
//     { client, contractor }: { client: User; contractor: User }
//   ) => Promise<{
//     paidProject: PaidProject;
//     contractor: User;
//   }>,
//   { contractor: "user"; client: "user" }
// >;
//
// let a: TestF = ({} as unknown) as any;
// let test = a["paidProject"](
//   {
//     title: "123",
//     // a: 13
//   },
//   {
//     contractor: {
//       id: 123,
//       firstName: "John",
//       lastName: "Doe",
//       createdAt: new Date(),
//     },
//     client: {
//       id: 123,
//       firstName: "John",
//       lastName: "Doe",
//       createdAt: new Date(),
//     },
//   }
// );
