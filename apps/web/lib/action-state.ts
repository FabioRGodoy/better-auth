import { ZodTypeAny } from "zod";

export type ActionState<TSchema extends ZodTypeAny> = {
  errors?: Partial<Record<keyof TSchema["_output"], string[]>>;
  message?: string;
};
