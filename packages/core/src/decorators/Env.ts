import { Inject } from "./Inject";

export const EnvKey = Symbol("Env");

export const Env = Inject.bind(null, EnvKey);
