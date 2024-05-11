import { RouterEvent } from "../event";
import { OnRoute } from "./OnRoute";

export const Guard = OnRoute.bind(null, RouterEvent.RouteGuard);
