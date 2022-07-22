import { Ducer } from "../Ducer";
import {
  Article,
  ArticleInput,
  PaidProjectInput,
  User,
  UserInput,
} from "./testTypes";

describe("addFactory", () => {
  it("adds simple story to the bag", async () => {
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
    const { user } = await producer.make("user", {
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

  it("adds simple story that can call another factory that has been defined", async () => {
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
    producer.addFactory(
      "article",
      async (article: Partial<ArticleInput>): Promise<Article> => {
        const { user } = await producer.make("user");
        return {
          ...{
            id: 456,
            userId: user.id,
            title: "My article",
          },
          ...article,
        };
      }
    );
    const { article } = await producer.make("article", {});
    expect(article).toEqual({
      id: 456,
      userId: 123,
      title: "My article",
    });
  });
});

describe("addFactory with dependencies", () => {
  it("adds simple parent factory", () => {
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
    producer.addFactory(
      "paidProject",
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
      },
      {
        contractor: "user",
        client: "user",
      }
    );

    const { client, contractor, paidProject } = await producer.make(
      "paidProject",
      {
          title: "My Project",
      },
      {
        contractor: {
          id: 123,
          firstName: "John",
          lastName: "Doe",
          createdAt: new Date(),
        },
        client: {
          id: 123,
          firstName: "John",
          lastName: "Doe",
          createdAt: new Date(),
        },
      }
    );
  //   expect(paidProject).toEqual({
  //     id: 456,
  //     title: "My Project",
  //   });
  //   expect(contractor).toEqual({
  //     id: 123,
  //     firstName: "John",
  //     lastName: "Doe",
  //     createdAt: new Date("2022-02-02"),
  //   });
  //   expect(client).toEqual({
  //     id: 123,
  //     firstName: "Kate",
  //     lastName: "Toms",
  //     createdAt: new Date("2022-02-02"),
  //   });
  // });
});
