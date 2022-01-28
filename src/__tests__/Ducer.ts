import { Ducer } from "../Ducer";
import { User, UserInput } from "./testTypes";

describe(Ducer.name, () => {
  /*

const scenarios = new StoryBag()
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

   */

  it("adds simple story to the bag", () => {
    const producer: Ducer = new Ducer();
    producer.addStory(
      "user",
      (userData: Partial<UserInput>): User => {
        return {
          ...{
            id: 123,
            firstName: "John",
            lastName: "Doe",
            createdAt: new Date("2022-02-02"),
          },
          ...userData,
        };
      }
    );
    const user = producer.make("user", { firstName: "Tom", lastName: "Lee" });
    expect(user).toEqual({
      id: 123,
      firstName: "Tom",
      lastName: "Lee",
      createdAt: new Date("2022-02-02"),
    });
  });
});
