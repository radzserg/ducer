import { Ducer } from "../Ducer";
import { Article, ArticleInput, User, UserInput } from "./testTypes";

describe("addFactory", () => {
  it("adds simple story to the bag", () => {
    const producer: Ducer = new Ducer();
    producer.addFactory("user", (userData: Partial<UserInput>): User => {
      return {
        ...{
          id: 123,
          firstName: "John",
          lastName: "Doe",
          createdAt: new Date("2022-02-02"),
        },
        ...userData,
      };
    });
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

  it("adds simple story that can call another factory that has been defined", () => {
    const producer: Ducer = new Ducer();
    producer.addFactory("user", (userData: Partial<UserInput>): User => {
      return {
        ...{
          id: 123,
          firstName: "John",
          lastName: "Doe",
          createdAt: new Date("2022-02-02"),
        },
        ...userData,
      };
    });
    producer.addFactory(
      "article",
      (article: Partial<ArticleInput>): Article => {
        const user = producer.make("user");
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
    const article = producer.make("article", {});
    expect(article).toEqual({
      id: 456,
      userId: 123,
      title: "My article",
    });
  });
});
