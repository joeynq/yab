import { HttpMethod } from "../enums";
import { Action } from "./Action";

export const Delete = Action.bind(null, HttpMethod.DELETE);
