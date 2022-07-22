export type Factory<
  Input = any,
  Output extends Promise<any> = Promise<any>,
  ExistingFactories extends Factories = any,
  NewDependencies extends FactoryDependenciesMap<ExistingFactories> = any
> = (
  input: Input,
  deps: {
    [Property in keyof NewDependencies]: ExtractOutputParameter<
      ExistingFactories[NewDependencies[Property]]
    >;
  }
) => Output;

export type Factories = {
  [name in string]: Factory;
};

export type FactoryDependenciesMap<ExistingFactories extends Factories> = {
  [x: string]: keyof ExistingFactories;
};

export type ExtractInputParameter<
  F extends Factory<any, any, ExistingFactories, NewDependencies>,
  ExistingFactories extends Factories = any,
  NewDependencies extends FactoryDependenciesMap<ExistingFactories> = any
> = F extends Factory<infer X, any, ExistingFactories, NewDependencies>
  ? X
  : never;

export type ExtractOutputParameter<F> = F extends Factory<any, infer X>
  ? Awaited<Promise<PromiseLike<X>>>
  : never;

export type AddFactory<
  ExistingFactories extends Factories,
  Name extends string,
  NewFactory extends Factory<any, any, ExistingFactories, FactoryDependencies>,
  FactoryDependencies extends FactoryDependenciesMap<ExistingFactories> = {}
> = ExistingFactories &
  {
    [k in Name]: NewFactory;
  };

// type UserFactory = Factory<Partial<UserInput>, Promise<User>>;
//
// type PaidProjectFactory = Factory<
//   Partial<PaidProjectInput>,
//   Promise<{ paidProject: PaidProject; contractor: User }>,
//   {
//     user: UserFactory;
//   },
//   { contractor: "user"; client: "user" }
// >;
//
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
