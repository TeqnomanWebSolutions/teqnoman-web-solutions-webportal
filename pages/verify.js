import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Verify() {
    const { data, status } = useSession();
    const router = useRouter();
    let check = async () => {
        if (data?.user?.role === "admin") {
            return router.push("/admin/dashboard");
        } else if (data?.user?.role === "employee") {
            if (data?.user?.status !== "onboard") {
                return router.push("/dashboard");
            }
            if (data?.user?.status === "deactive") {
                signOut({
                    redirect: false,
                })
                router.push("/auth/SignIn");
                toast.error("Your account is deactivated. Please contact admin.");
            } else {
                return router.push("/onboard")
            }
        }
    }
    useEffect(() => {
        if (status === "authenticated") {
            check();
        }
    }, [status])

    return (<>
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    </>)
}