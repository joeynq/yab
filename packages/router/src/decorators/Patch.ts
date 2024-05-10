import { HttpMethod } from "../enums";
import { Action } from "./Action";

export const Patch = Action.bind(null, HttpMethod.PATCH);
