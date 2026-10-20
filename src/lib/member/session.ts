import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Personne connectée et son profil (mis en cache pour la durée d'une requête). */
export const getMember = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  return { supabase, user, profile };
});

export type Member = NonNullable<Awaited<ReturnType<typeof getMember>>>;

/** URL temporaire (1 h) de la photo de profil, stockée dans un bucket privé. */
export async function photoUrl(member: Member, path = member.profile.photo_path) {
  if (!path) return null;
  const { data } = await member.supabase.storage.from("avatars").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
