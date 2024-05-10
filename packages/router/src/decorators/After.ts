import { RouterEvent } from "../event";
import { OnRoute } from "./OnRoute";

export const After = OnRoute.bind(null, RouterEvent.AfterHandle);
