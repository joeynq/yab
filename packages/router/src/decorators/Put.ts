import { HttpMethod } from "../enums";
import { Action } from "./Action";

export const Put = Action.bind(null, HttpMethod.PUT);
