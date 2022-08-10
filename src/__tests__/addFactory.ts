import { Ducer } from "../Ducer";
import {
  Article,
  ArticleInput,
  PaidProject,
  PaidProjectInput,
  User,
  UserInput,
} from "./testTypes";

describe("addFactory", () => {
  it("adds simple factory and calls it without parameters", async () => {
    const iMake: Ducer = new Ducer();
    iMake.addFactory(
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
    const { user } = await iMake.user();
    expect(user).toMatchObject({
      id: expect.any(Number),
      firstName: expect.any(String),
      lastName: expect.any(String),
      createdAt: expect.any(Date),
    });
  });

  it("adds simple and calls it with parameters", async () => {
    const iMake: Ducer = new Ducer();
    iMake.addFactory(
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
    const { user } = await iMake.user({
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
    const iMake: Ducer = new Ducer();
    iMake.addFactory(
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
    iMake.addFactory(
      "article",
      async (article: Partial<ArticleInput>): Promise<Article> => {
        const { user } = await iMake.user();
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
    const { article } = await iMake.article();
    expect(article).toEqual({
      id: 456,
      userId: 123,
      title: "My article",
    });
  });
});

describe("addFactory with dependencies", () => {
  it("adds simple parent factory", async () => {
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
        paidProject: Partial<PaidProjectInput> = {},
        { client, contractor }: { client: User; contractor: User }
      ) => {
        return {
          ...{
            id: 456,
            title: `Contract between ${client.firstName} and ${contractor.firstName}`,
          },
          ...paidProject,
        } as PaidProject;
      },
      {
        contractor: "user",
        client: "user",
      }
    );

    const { client, contractor, paidProject } = await producer.paidProject(
      {
        id: 678,
      },
      {
        contractor: {
          firstName: "John",
        },
        client: {
          firstName: "Tom",
        },
      }
    );

    expect(paidProject).toMatchObject({
      id: 678,
      title: "Contract between Tom and John",
    });
    expect(client).toMatchObject({
      id: 123,
      firstName: "Tom",
      lastName: "Doe",
    });
    expect(contractor).toMatchObject({
      id: 123,
      firstName: "John",
      lastName: "Doe",
    });
  });

  test("article with author", async () => {
    const iMake: Ducer = new Ducer();
    iMake.addFactory(
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
    iMake.addFactory(
      "article",
      (
        article: Partial<ArticleInput>,
        { author }: { author: User } // author will be automatically created
      ) => {
        return {
          id: 456,
          title: "Generated title",
          author_id: author.id,
        };
      },
      // we declare dependencies, where author is dependency name
      // and "user" is referenced to existing factory
      { author: "user" }
    );
    const { article, author } = await iMake.article(
      { title: "My article" },
      { author: { firstName: "Tome" } }
    );
    expect(article).toEqual({
      id: 456,
      title: "Generated title",
      author_id: 123,
    });
    expect(author).toMatchObject({
      id: 123,
      firstName: "Tome",
      lastName: "Doe",
    });
  });
});
