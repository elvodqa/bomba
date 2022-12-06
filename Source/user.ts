import {DataTypes, Model} from 'https://deno.land/x/denodb/mod.ts'
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export class User extends Model {
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
        total_score: DataTypes.INTEGER,
        rank: DataTypes.INTEGER,
    }

    static defaults = {
        total_score: 0,
        rank: 0,
    }    
}

export class Score extends Model {
    static table = 'scores'
    static timestamps = true

    static fields = {
        id: {
            primaryKey: true,
            autoIncrement: true,
        },
        username: DataTypes.STRING,
        map_id: DataTypes.INTEGER,
        score: DataTypes.INTEGER,
        rank: DataTypes.INTEGER,
        great_count: DataTypes.INTEGER,
        good_count: DataTypes.INTEGER,
        bad_count: DataTypes.INTEGER,
        miss_count: DataTypes.INTEGER,
    }
    static defaults = {
        score: 0,
        rank: 0,
        great_count: 0,
        good_count: 0,
        bad_count: 0,
        miss_count: 0,
    }
}

export function CheckPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
}

export async function GetScore(username: string, map_id: number) {
    return await Score.where('username', username).where('map_id', map_id).first();
}

export async function AddScore(username: string, map_id: number, score: number, great_count: number, good_count: number, bad_count: number, miss_count: number) {
    const scoreToSubmit = new Score();
    scoreToSubmit.username = username;
    scoreToSubmit.map_id = map_id;
    scoreToSubmit.score = score;
    scoreToSubmit.great_count = great_count;
    scoreToSubmit.good_count = good_count;
    scoreToSubmit.bad_count = bad_count;
    scoreToSubmit.miss_count = miss_count;
    await scoreToSubmit.save();
}

export function GetRank(username: string) {
    return User.where('username', username).first();
}