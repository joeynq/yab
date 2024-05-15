import { type Static, Type } from "@sinclair/typebox";

export const UserQuerySchema = Type.Object({
	email: Type.String(),
});

export type UserQuerySchemaDto = Static<typeof UserQuerySchema>;

export const UserParamSchema = Type.Object({
	id: Type.Number(),
});

export type UserParamDto = Static<typeof UserParamSchema>;
