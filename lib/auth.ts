import { auth } from "@clerk/nextjs/server";

export const DEV_USER_ID = "dev-user";

export function isAuthBypassed(): boolean {
  return process.env.BYPASS_AUTH === "true";
}

export async function getAuthUserId(): Promise<string | null> {
  if (isAuthBypassed()) {
    return DEV_USER_ID;
  }
  const { userId } = await auth();
  return userId;
}
