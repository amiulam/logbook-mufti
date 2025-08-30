"use server";

import { auth } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/schemas";
import { APIError } from "better-auth/api";

export const signInWithEmail = async (data: unknown) => {
  const validationResult = signInSchema.safeParse(data);

  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validatedData = validationResult.data;
  const { email, password } = validatedData;

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });

    return { success: true, message: "signin succeed" };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
};

export const signUpWithEmail = async (data: unknown) => {
  const validationResult = signUpSchema.safeParse(data);

  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validatedData = validationResult.data;
  const { name, email, password } = validatedData;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });

    return { success: true, message: "signup succeed" };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
};
