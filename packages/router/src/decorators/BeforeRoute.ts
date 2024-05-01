import { RouterEvent } from "../event";
import { OnRoute } from "./OnRoute";

export const BeforeRoute = OnRoute.bind(null, RouterEvent.BeforeRoute);
