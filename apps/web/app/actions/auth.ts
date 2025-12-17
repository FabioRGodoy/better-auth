"use server";

import { SignupFormSchema, SignupState } from "@/lib/definitions";
import axios from "axios";
import "server-only";

export async function signup(
  _state: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await axios.post(
    "http://localhost:3000/auth/sign-up/email",
    validatedFields.data
  );

  return { message: "Usuário criado com sucesso" };
}
export async function login(
  _state: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = SignupFormSchema.pick({
    email: true,
    password: true,
  }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await axios.post(
    "http://localhost:3000/auth/sign-in/email",
    validatedFields.data
  );

  return { message: "Login realizado com sucesso" };
}
