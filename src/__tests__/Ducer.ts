import { Ducer } from "../Ducer";
import { PaidProject, PaidProjectInput, User, UserInput } from "./testTypes";
import { Factory } from "../types";

describe(Ducer.name, () => {

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

  it("adds async simple story to the bag", async () => {
    const producer: Ducer = new Ducer();
    producer.addStory(
      "user",
      async (userData: Partial<UserInput>): Promise<User> => {
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
    const user = await producer.make("user", {
      firstName: "Tom",
      lastName: "Lee",
    });
    expect(user).toEqual({
      id: 123,
      firstName: "Tom",
      lastName: "Lee",
      createdAt: new Date("2022-02-02"),
    });
  });

  it("adds simple sub-story", () => {
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
    producer.addSubStory(
      "paidProject",
      {
        contractor: "user",
        client: "user",
      },
      (
        paidProject: Partial<PaidProjectInput>,
        { client, contractor }: { client: User; contractor: User }
      ) => {
        return {
          client,
          contractor,
          paidProject: {
            ...{
              id: 456,
             title: "Generated title",
            },
            ...paidProject,
          }
        };

      }
    );

    const { client, contractor, paidProject} = producer.make("paidProject", {
      contractor: { firstName: "John", lastName: "Doe"},
      client: { firstName: "Kate", lastName: "Toms"},
      paidProject: {
        title: "My Project"
      }
    })
    expect(paidProject).toEqual({
      id: 456,
      title: "My Project",
    });
    expect(contractor).toEqual({
      id: 123,
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date("2022-02-02"),
    });
    expect(client).toEqual({
      id: 123,
      firstName: "Kate",
      lastName: "Toms",
      createdAt: new Date("2022-02-02"),
    });
  });
});
