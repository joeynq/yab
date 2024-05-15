import { HttpMethod } from "../enums";
import { Action } from "./Action";

export const Post = Action.bind(null, HttpMethod.Post);
