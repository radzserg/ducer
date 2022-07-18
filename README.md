# Motivation

This package is an extension of the [rs-db-seeder](https://www.npmjs.com/package/rs-db-seeder) idea. While rs-db-seeder
works at a low level, directly writing data to the database, Ducer works at the API level allowing to fill in data
in the same way as the real application does.

Features:

- ability to generate data as close as possible to real conditions
- ability to play complex data scenarios
- ability to easily tweak data at different levels of nesting
- ability to easily obtain (if necessary) all generated data from different levels of nesting.

# How to use

Ducer is framework-agnostic library. You can write data directly to DB, call your REST or graphql API. It's your responsibility
to implement data providers. Ducer encourages you to seed data in the same way as your application does. Call your API
to fill in the data. Use direct DB updates where there's no other way.

### Simple scenarios

```typescript
function createDucer(axios) {
  const producer: Ducer = new Ducer();
  producer.addFactory(
    "user",
    async (userData: Partial<UserInput>): Promise<User> => {
      const fullUserData = {
        ...{
          firstName: chance.firstName(), // use chance or faker to create "like a real" data
          lastName: chance.lastName(),
        },
        ...userData,
      };
      // call your API to register new user
      const user = await axios.post("/user", fullUserData);
      return user;
    }
  );
  return producer;
}

// seed script
import axios from "axios";

const producer = createDucer(axios);
const user = await producer.make("user");
const userJohn = await producer.make("user", {
  firstName: "John", // we want to override firstName field
});
```

### Complex scenarios

In more complex scenarios, we may need to create factories based on other factories. For example, we need to create
an article that should have an author.

```typescript
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
producer.addParentFactory(
  "article",
  // we declare dependencies, where author is dependency name
  // and "user" is referencet to existing factory
  { author: "user" },
  (
    article: Partial<ArticleInput>,
    { author }: { author: User } // author will be automatically created
  ) => {
    return {
      author,
      article: {
        ...{
          id: 456,
          title: "Generated title",
          author_id: author.id,
        },
        ...article,
      },
    };
  }
);

// in seeder script
const { article } = producer.make("article");
// when you need more flexibility
const { article: customizedArticle, author } = producer.make("article", {
  author: { firstName: "John" },
  article: {
    title: "My Customized Title",
  },
});
```
