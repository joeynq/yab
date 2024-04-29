import { LoggerKey } from "../symbols";
import { Inject } from "./Inject";

export const Logger = Inject.bind(null, LoggerKey);
