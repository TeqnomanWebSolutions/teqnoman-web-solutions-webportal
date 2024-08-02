import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { useAuth } from "@/Hooks/useAuth";

const Layout = ({ children }) => {
  const [showNav, setShowNav] = useState(true);
  const { loading, user } = useAuth();
  return (<>
    {loading && (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    )}
    {!loading && (<div className={`body-area ${showNav ? " body-pd" : ""}`}>
      <Sidebar showNav={showNav} setShowNav={setShowNav} />
      <div className="page-content">
        <Header user={user} />
        {children}
      </div>
    </div>)}
  </>);
};
export default Layout;