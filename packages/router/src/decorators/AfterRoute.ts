import { RouterEvent } from "../event";
import { OnRoute } from "./OnRoute";

export const AfterRoute = OnRoute.bind(null, RouterEvent.AfterRoute);
