import { HttpMethod } from "../enums";
import { Action } from "./Action";

export const Get = Action.bind(null, HttpMethod.GET);
