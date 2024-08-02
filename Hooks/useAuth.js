import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function useAuth() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { data, status } = useSession();
  const user = data?.user;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/SignIn");
    }
    if (status === "loading") {
      setLoading(true);
    }
    if (status === "authenticated") {
      setLoading(false);
    }
    if (user) {
      if (user.status === "deactive") {
        setLoading(true);
        router.push("/auth/SignIn");
      }
      if (user.status === "active") {
        if (router.pathname.includes("/auth/SignIn")) {
          router.push("/dashboard");
        }
      }
      if (user.status === "onboard") {
        if (router.pathname.includes("/onboard")) {
          setLoading(false);
        } else {
          router.push("/onboard");
        }
      }
    }
  }, [user, status]);

  return { loading, user };
}