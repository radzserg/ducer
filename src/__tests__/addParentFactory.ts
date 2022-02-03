import { Ducer } from "../Ducer";
import { PaidProjectInput, User, UserInput } from "./testTypes";

describe(Ducer.name, () => {
  it("adds simple parent factory", () => {
    const producer: Ducer = new Ducer();
    producer.addFactory(
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
    producer.addParentFactory(
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
          },
        };
      }
    );

    const { client, contractor, paidProject } = producer.make("paidProject", {
      contractor: { firstName: "John", lastName: "Doe" },
      client: { firstName: "Kate", lastName: "Toms" },
      paidProject: {
        title: "My Project",
      },
    });
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

  it("adds async parent factory", async () => {
    const producer: Ducer = new Ducer();
    producer.addFactory(
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
    producer.addParentFactory(
      "paidProject",
      {
        contractor: "user",
        client: "user",
      },
      async (
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
          },
        };
      }
    );

    const { client, contractor, paidProject } = await producer.make(
      "paidProject",
      {
        contractor: { firstName: "John", lastName: "Doe" },
        client: { firstName: "Kate", lastName: "Toms" },
        paidProject: {
          title: "My Project",
        },
      }
    );
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
