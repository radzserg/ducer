# **Ducer - Framework-Agnostic Data Factory**

## **Motivation**

Ducer is a **framework-agnostic** library that allows you to generate data for your application in a way that closely mimics real-world conditions. Whether you're inserting data directly into a database, calling a REST API, or interacting with GraphQL, **Ducer provides full flexibility**—you define the data providers.

Instead of manually seeding your database or mocking API responses, **Ducer encourages you to generate test data in the same way your application does**. This ensures consistency and makes it easier to test complex scenarios.

### **Key Features**
✅ Generate data that accurately reflects real-world conditions.  
✅ Support for complex, interdependent data structures.  
✅ Easily customize data at different levels of nesting.  
✅ Retrieve all generated data, including dependencies, if needed.


# Usage

### 1. Simple scenarios

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

### 2. Complex scenarios

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



### 3. Integration with data providers

Ducer allows you to integrate with any data provider, such as databases or APIs.  
Here’s an example using Drizzle ORM to write directly to a database:

```typescript

import {
  user as userTable,
} from '@/database/schema/drizzle.js';

const iMake: Ducer = new Ducer();
iMake.addFactory(
  "user",
  async (userData: Partial<UserInput>): Promise<User> => {
    const defaultData: UserInput = {
      id: uuidv4(),
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date("2022-02-02"),
    }
    
    const result = {
      ...defaultData,
      ...data,
    };
    await database.insert(userTable).values(result);

    return result;
  }
);
```

### Why Use Ducer?

-	🛠 Framework Agnostic: Works with any database, API, or service.
-	🔄 Reproducible Data: Ensures consistent test data across environments.
-	🔗 Supports Dependencies: Easily define complex object relationships.
-	⚡ Customizable: Define your own factories and extend them as needed.