import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { Modal } from "react-bootstrap";
import ButtonUi from "../ButtonUi/ButtonUi";
import { instance } from "@/utils/Apiconfig";
import { useAuth } from "@/Hooks/useAuth";

function SideBarMenu({ showNav, setShowNav }) {
  const { user } = useAuth();
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const userRole = user?.role;
  const userId = user?.id;
  const adminMenu = [
    { label: "Dashboard", icon: "/images/dashboard-icon.svg", href: "/admin/dashboard", },
    {
      label: "Employee", icon: "/images/employ-management.svg", href: "/admin/employees",
      subMenuItems: [
        { label: "Change Request", href: "/admin/employees/change-request" },
      ],
    },
    { label: "Leave", icon: "/images/leave-icon.svg", href: "/admin/leaves", },
    { label: "Leave Balance", icon: "/images/leave-icon.svg", href: "/admin/leavebalance", },
    { label: "Holiday", icon: "/images/holidays-icon.svg", href: "/admin/holidays", },
    // { label: "Event", icon: "/images/event-icon.svg", href: "/admin/events", },
    // { label: "Project", icon: "/images/project-icon.svg", href: "/admin/projects" },
    {
      label: "Inquiries", icon: "/images/inquiry-icon.svg", href: "/admin/inquiry/careerinquiry",
      subMenuItems: [
        { label: "Career inquires", href: "/admin/inquiry/careerinquiry" },
        { label: "Contact inquires", href: "/admin/inquiry/contactinquiry" },
      ],
    },
    { label: "Newsletter", icon: "/images/newsletter-icon.svg", href: "/admin/newsletter" },
    { label: "Jobs", icon: "/images/career.svg", href: "/admin/jobs", },
    { label: "Portfolio", icon: "/images/portfolio-icon.svg", href: "/admin/portfolio", },
    { label: "Blog", icon: "/images/blog-icon.svg", href: "/admin/blog", },
    // { label: "Invoice", icon: "/images/invoice-icon.svg", href: "/admin/invoice", },
  ]
  const userMenu = [
    { label: "Dashboard", icon: "/images/dashboard-icon.svg", href: "/dashboard", },
    // { label: "Projects", icon: "/images/project-icon.svg", href: "/projects", },
    { label: "Leave", icon: "/images/leave-icon.svg", href: "/leaves", },
    { label: "Holiday", icon: "/images/holidays-icon.svg", href: "/holidays", },
    // { label: "Event", icon: "/images/event-icon.svg", href: "/events", },
  ]
  const [menuItems, setMenuItems] = useState(() => {
    if (userRole === "admin")
      return adminMenu
    else {
      return userMenu
    }
  })


  const updateMenu = (modules) => {
    const filteredModules = adminMenu.filter(menu => {
      return modules.some(data => capitalizeFirstLetter(data.module) === menu.label);
    });

    if (filteredModules.length != 0) {
      setMenuItems([...userMenu, {
        label: "Admin",
        icon: "/images/dashboard-icon.svg",
        href: filteredModules && filteredModules[0]?.href,
        subMenuItems: filteredModules,
      }]);
    }
  };

  useEffect(() => {
    if (user?.lead) {
      userMenu.push({ label: "Leads", icon: "/images/project-icon.svg", href: "/leads" });
    }
    if (userRole === "employee") {
      updateMenu(user?.accessModules)
    }
  }, [userRole]);


  const [barIcon, setBarIcon] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowNav(window.innerWidth > 767);
      setBarIcon(window.innerWidth <= 767);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [showModal, setShowModal] = useState(false);

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const router = useRouter();
  const Routerpath = router.pathname;

  return (<>
    {barIcon ? (<>
      <div className="header_toggle">
        <Image width={30} height={30} alt="close" src={`${showNav ? `/images/bar-close.svg` : `/images/bar.svg`}`} onClick={() => { setShowNav(!showNav); }} />
      </div>
    </>) : (<div className="header_toggle">
      <Image width={30} height={30} alt="close" src={`${showNav ? `/images/close-arrow.svg` : `/images/open-arrow.svg`}`} onClick={() => { setShowNav(!showNav); }} />
    </div>)}
    <div className={`l-navbar ${showNav ? "show" : ""}`}>

      <div className="header_toggle">
        {showNav && <Image className="bar-close" width={30} height={30} alt="close" src='/images/bar-close.svg' onClick={() => { setShowNav(!showNav); }} />}
      </div>
      <nav className="nav">
        <div>
          {userRole === "admin" ? (
            <Link href="/admin/dashboard" className={` ${showNav ? "nav_logo" : "nav_logo2"} `}>
              {showNav ? (<Image src="/images/login-logo-new.png" alt={"logo"} width={103} height={30} />) : (<Image src="/images/logo2.svg" width={45} height={45} alt={"logo"} />)}
            </Link>) : (
            <Link href="/dashboard" className={` ${showNav ? "nav_logo" : "nav_logo2"} `}>
              {showNav ? (<Image src="/images/login-logo-new.png" alt={"logo"} width={103} height={30} />) : (<Image src="/images/logo2.svg" width={45} height={45} alt={"logo"} />)}
            </Link>)}
          <div className="nav_list">
            {menuItems.map((menuItem, index) => (
              <div key={index} className="nav_items">
                {userRole === "admin" ? (
                  <Link href={menuItem.href ? menuItem.href : "#"} className={`nav_link ${Routerpath === menuItem.href && `active`} ${Routerpath.includes('/admin/inquiry/') && menuItem.href.includes('/admin/inquiry/') ? 'active' : ''} ${Routerpath.includes('/admin/events/') && menuItem.href.includes('/admin/event/') ? 'active' : ''}
                   ${(Routerpath.includes('/admin/blog')) && menuItem.href.includes('/admin/blog') ? 'active' : ''} ${Routerpath.includes('/admin/projects/') && menuItem.href.includes('/admin/projects') ? 'active' : ''} ${Routerpath.includes('/admin/jobs/') && menuItem.href.includes('/admin/jobs') ? 'active' : ''} ${Routerpath.includes('/admin/newsletter/') && menuItem.href.includes('/admin/newsletter') ? 'active' : ''}
                   ${Routerpath.includes('/admin/employees/') && menuItem.href.includes('/admin/employee') ? 'active' : ''}
                   ${Routerpath.includes('/admin/events/') && menuItem.href.includes('/admin/event') ? 'active' : ''} ${Routerpath.includes('/admin/invoice/') && menuItem.href.includes('/admin/invoice') ? 'active' : ''}
                  `}
                  >
                    <Image src={menuItem.icon} width={20} height={20} alt={menuItem.icon} />
                    <span className="nav_name active">{menuItem.label}</span>
                  </Link>
                ) : (
                  <Link href={menuItem.href ? menuItem.href : "#"} className={`nav_link ${Routerpath === menuItem.href && `active`} ${Routerpath.includes('/projects') && menuItem.href === '/projects' ? 'active' : ''}`}>
                    <Image src={menuItem.icon} width={20} height={20} alt={menuItem.icon} />
                    <span className="nav_name active">{menuItem.label}</span>
                  </Link>
                )}
                {menuItem.subMenuItems && (
                  <ul className={`sub-menu  ${menuItem.href === Routerpath && "is-open"} 
                  ${menuItem.subMenuItems.some(subMenuItem => Routerpath === subMenuItem.href) && "is-open"}
                  `}>
                    {menuItem.subMenuItems?.map((subMenuItem, subIndex) => (
                      <Link key={subIndex} href={subMenuItem.href} className={`nav_link ${subMenuItem.href === Routerpath && "active_menu"}`}>
                        {subMenuItem.label}
                      </Link>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {/* <div className="nav_items">
              <Link href={"#"} className={`nav_link disabled`} aria-disabled={true} tabIndex={-1}>
                <span className="nav_name active">Admin</span>
              </Link>
            </div>
            {modules.length== 0 && <div className="nav_items">
              <Link href={"/admin/leaves"} className={`nav_link ${Routerpath === '/admin/leaves' && `active`}`}>
                <Image src={"/images/leave-icon.svg"} width={20} height={20} />
                <span className="nav_name active">Leave</span>
              </Link>
            </div>} */}
            <div className="nav_items logout">
              {userRole === "admin" &&
                <div className="nav_items setiing">
                  <Link href='/admin/setting' className={`nav_link ${Routerpath === '/admin/setting' && `active`}`} style={{ cursor: 'pointer' }} >
                    <Image src="/images/setting.svg" width={20} height={20} alt={"setting"} />
                    <span className="nav_name">Setting</span>
                  </Link>
                </div>}
              <p className="nav_link" onClick={handleModalToggle} style={{ cursor: 'pointer' }} >
                <Image src="/images/logout-icon.svg" width={20} height={20} alt={"Logout"} />
                <span className="nav_name">Log Out</span>
              </p>
            </div>
          </div>
        </div>
      </nav>
    </div>
    {showModal && (<Modal show={showModal} className="logout-modal" centered onHide={handleModalToggle}>
      <Modal.Header closeButton>
        <Modal.Title>Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body><p>Are you sure you want to Logout?</p></Modal.Body>
      <Modal.Footer>
        <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
        <ButtonUi cssClass='btnuiRounded' text="Logout" callBack={async () => {
          await signOut({ redirect: false });
          router.push('/')
          localStorage.removeItem('modules');
          localStorage.removeItem('userID');
        }} />
      </Modal.Footer>
    </Modal>)}
  </>);
}
export default SideBarMenu;
