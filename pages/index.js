import React from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function MyPage() {

  const router = useRouter();

  useEffect(() => {
    router.push('/auth/SignIn')
  })

  return (<div className="spinner-container">
    <div className="spinner"></div>
  </div>);
}
