import { LoggerKey } from "../symbols";
import { Inject } from "./Inject";

export const InjectLogger = Inject.bind(null, LoggerKey);
