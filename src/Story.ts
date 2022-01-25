import {
  PaidProject,
  PaidProjectInput,
  User,
  UserInput,
  UserSettings,
  UserSettingsInput,
} from "./testTypes";
import {
  AddParentFactory,
  AddSimpleFactory,
  ExistingStoriesMap,
  ExtractOutputParameter,
  Factory,
  StoryBag,
} from "./types";

export class StoryBagBuilder<S extends StoryBag = {}> {
  public readonly bag: StoryBag = {};

  public addStory<N extends string, F extends Factory<any, any>>(
    name: N,
    f: F
  ): StoryBagBuilder<AddSimpleFactory<S, N, F>> {
    //this.bag[name] = f;
    return ({} as unknown) as any;
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
  ): StoryBagBuilder<AddParentFactory<S, N, M, F>> {
    return ({} as unknown) as any;
  }

  public getBag(): S {
    return ({} as unknown) as S;
  }
}

const scenarios = new StoryBagBuilder()
  .addStory(
    "user",
    (userData: Partial<UserInput>): User => {
      return ({} as unknown) as User;
    }
  )
  .addStory(
    "settings",
    (userData: Partial<UserSettingsInput>): UserSettings => {
      return ({} as unknown) as UserSettings;
    }
  )
  .addSubStory(
    "paidProject",
    {
      contractor: "user",
      client: "user",
    },
    (
      input: Partial<PaidProjectInput>,
      dependencies: { client: User; contractor: User }
    ): PaidProject => {
      return ({} as unknown) as any;
    }
  )
  .getBag();

let u: User = scenarios.user({ first_name: "John" });
let p: PaidProject = scenarios.paidProject({
  paidProject: { title: "title" },
});
