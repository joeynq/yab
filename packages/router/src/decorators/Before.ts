import { RouterEvent } from "../event";
import { OnRoute } from "./OnRoute";

export const Before = OnRoute.bind(null, RouterEvent.BeforeHandle);
