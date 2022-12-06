import {DataTypes, Database, Model, SQLite3Connector} from 'https://deno.land/x/denodb/mod.ts'
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const app = new Application();
const router = new Router();

const port = 8000;
//const server = app.listen({ port });


const connection = new SQLite3Connector({
  filepath: './db.sqlite3',
})

const db = new Database(connection)

class User extends Model {
  static table = 'users'
  static timestamps = true

  static fields = {
    id: {
      primaryKey: true,
      autoIncrement: true,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  }

  static defaults = {
    
  }
    
}

db.link([User])
await db.sync({drop: true})

// http://localhost:8000/api/getUser/Emir Cengiz
router
  .get("/api/getUser/:username", async (context) => {
    const user = await User.where('username', context.params.username).first();
    context.response.body = user;
    console 
})

// http://localhost:8000/api/newUser?username=Emir&mail=abc@gmail.com&password=1234
router
  .get("/api/newUser", async (context) => {
    // hash password 
    if (!context.request.url.searchParams.get('password')) {
      context.response.body = "Password is required";
      console.log("Password is required");
      return;
    }
    const hashedPassword = await bcrypt.hash(context.request.url.searchParams.get('password') || '{}');
  
    await User.create({
      username: context.request.url.searchParams.get('username'),
      email: context.request.url.searchParams.get('mail'),
      password: hashedPassword,
    })
    context.response.body = "New user created";
    console.log("New user created");
})

// http://localhost:8000/api/login?userusername=Emir&password=1234
router
  .get("/api/login", async (context) => {
    const user = await User.where('username', context.request.url.searchParams.get('username')).first();
    if (!user) {
      context.response.body = "User not found";
      console.log("User not found");
      return;
    }
    const passwordCorrect = await checkPassword(context.request.url.searchParams.get('password') || '{}', user.password?.toString() || '{}');
    if (!passwordCorrect) {
      context.response.body = "Wrong password";
      console.log("Wrong password");
      return;
    }
    context.response.body = "Logged in";
    console.log("Logged in");
})

function checkPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}



console.log(`Server running on port ${port}`);
await app.use(router.routes());
await app.use(router.allowedMethods());
await app.listen({ port });

await db.close()

/*
const user = new User();
user.username = 'Emir Cengiz';
user.email = 'emircengiz21@gmail.com';
user.password = '1234';
await user.save(); */


