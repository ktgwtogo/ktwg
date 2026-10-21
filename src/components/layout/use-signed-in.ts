"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Vrai si une session est ouverte dans ce navigateur (null tant que ce n'est pas connu). */
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}
