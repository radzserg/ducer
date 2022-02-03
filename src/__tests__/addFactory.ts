import { Ducer } from "../Ducer";
import { User, UserInput } from "./testTypes";

describe("addFactory", () => {
  it("adds simple story to the bag", () => {
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
});
