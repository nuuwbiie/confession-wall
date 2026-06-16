"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateUsername } from "@/lib/username-generator";
import { usernameToEmail, validateUsername } from "@/lib/auth-helpers";

export async function signUp(username: string, password: string) {
  const supabase = await createClient();

  // Validate username
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { error: validation.error || "Username tidak valid" };
  }

  const email = usernameToEmail(validation.normalized);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: validation.normalized },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile entry
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: validation.normalized,
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signIn(username: string, password: string) {
  const supabase = await createClient();
  const email = usernameToEmail(username);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Username atau password salah" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, is_admin")
    .eq("id", userId)
    .single();
  return data;
}

export async function isAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin === true;
}

export { generateUsername };