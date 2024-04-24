import { Yab } from "./Yab";

export * from "./Yab";
export * from "./decorators";
export * from "./events";
export * from "./interfaces";
export * from "./services";
export * from "./symbols";

new Yab().start(() => console.log("Server started!"));
