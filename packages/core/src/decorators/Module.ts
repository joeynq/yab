import { useDecorators } from "../utils";
import { Injectable } from "./Injectable";

export const Module = () => {
	return useDecorators(Injectable("SINGLETON"));
};
