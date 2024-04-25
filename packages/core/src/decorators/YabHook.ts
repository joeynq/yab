import type { YabEvents } from "../events";
import { Hook } from "./Hook";

export const YabHook = Hook<typeof YabEvents>;
