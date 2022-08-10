# Motivation

Ducer is framework-agnostic library. You can write data directly to DB, call your REST or graphql API. It's your responsibility
to implement data providers. Ducer encourages you to seed data in the same way as your application does. Call your API
to fill in the data. Use direct DB updates where there's no other way.

Features:

- ability to generate data as close as possible to real conditions
- ability to play complex data scenarios
- ability to easily tweak data at different levels of nesting
- ability to easily obtain (if necessary) all generated data from different levels of nesting.

# How to use

### Simple scenarios

```typescript
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
```

### Complex scenarios

In more complex scenarios, we may need to create factories based on other factories. For example, we need to create
an article that should have an author.

```typescript
const iMake: Ducer = new Ducer();
iMake.addFactory(
  "user",
  (userData: Partial<UserInput>): User => {
    // write to DB/call API whatever you need
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
```
