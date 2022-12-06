import {Database, SQLite3Connector} from 'https://deno.land/x/denodb/mod.ts'
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import {User, Score, CheckPassword, AddScore, GetRank, GetScore} from './user.ts'

const app = new Application();
const router = new Router();

const port = 8000;
//const server = app.listen({ port });


const connection = new SQLite3Connector({
  filepath: './db.sqlite3',
})

const db = new Database(connection)

db.link([User, Score])

await db.sync({drop: true})

// http://localhost:8000/api/getUser/Emir Cengiz
router
  .get("/api/getUser/:username", async (context) => {
    const user = await User.where('username', context.params.username).first();
    context.response.body = user;
    console 
})


/// Example: http://localhost:8000/api/newUser?username=Emir&mail=abc@gmail.com&password=1234
router
  .get("/api/newUser", async (context) => {
    // hash password 
    if (!context.request.url.searchParams.get('password')) {
      context.response.body = "Password is required";
      console.log("Password is required");
      return;
    }
    // check if username or email is already taken
    const userByName = await User.where('username', context.request.url.searchParams.get('username')).first();
    if (userByName) {
      context.response.body = "Username is already taken"
      console.log("Username is already taken");
      return;
    }
    const userByEmail = await User.where('email', context.request.url.searchParams.get('mail')).first();
    if (userByEmail) {
      context.response.body = "Email is already taken"
      console.log("Email is already taken");
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

/// Example: http://localhost:8000/api/login?userusername=Emir&password=1234
router
  .get("/api/login", async (context) => {
    const user = await User.where('username', context.request.url.searchParams.get('username')).first();
    if (!user) {
      context.response.body = "User not found";
      console.log("User not found");
      return;
    }
    const passwordCorrect = await CheckPassword(context.request.url.searchParams.get('password') || '{}', user.password?.toString() || '{}');
    if (!passwordCorrect) {
      context.response.body = "Wrong password";
      console.log("Wrong password");
      return;
    }
    context.response.body = "Logged in";
    console.log("Logged in");
})

/// Example: http://localhost:8000/api/addScore?username=Emir&map_id=123&score=1000&great_count=100&good_count=100&bad_count=100&miss_count=100
router
  .get("/api/addScore", async (context) => {
    const username = context.request.url.searchParams.get('username');
    const map_id = context.request.url.searchParams.get('map_id');
    const score = context.request.url.searchParams.get('score');
    const great_count = context.request.url.searchParams.get('great_count');
    const good_count = context.request.url.searchParams.get('good_count');
    const bad_count = context.request.url.searchParams.get('bad_count');
    const miss_count = context.request.url.searchParams.get('miss_count');
    if (!username || !map_id || !score || !great_count || !good_count || !bad_count || !miss_count) {
      context.response.body = "Missing parameters";
      console.log("Missing parameters");
      return;
    }
    await AddScore(username, Number(map_id), Number(score), Number(great_count), 
      Number(good_count), Number(bad_count), Number(miss_count));
    context.response.body = "Score submitted";
    console.log("Score submitted");
})

/// Example: http://localhost:8000/api/getScore?username=Emir?map_id=123
router
  .get("/api/getScore", async (context) => {
    if (!context.request.url.searchParams.get('username') || !context.request.url.searchParams.get('map_id')) {
      context.response.body = "Missing parameters";
      console.log("Missing parameters");
      return;
    }
    const score = await GetScore(context.request.url.searchParams.get('username') || '{}', Number(context.request.url.searchParams.get('map_id')));
    context.response.body = score;
    console.log(score);
})



console.log(`Server running on port ${port}`);
await app.use(router.routes());
await app.use(router.allowedMethods());
await app.listen({ port });

await db.close()