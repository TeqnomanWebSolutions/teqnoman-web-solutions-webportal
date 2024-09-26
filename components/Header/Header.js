import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import styles from './Header.module.scss';
import Link from "next/link";
import moment from "moment";
import { getGreetingByTime, elapsedTime, instance } from "@/utils/Apiconfig";
import ButtonUi from "../ButtonUi/ButtonUi";

const Notification = ({ module, icon, date, time, message, link }) => {

    const notifyMessage = message || "you have new career_inquiry!!";
    const notifyLinkValue = link || "/link_to_module";
    const timestamp = moment(date);
    const currentTime = moment();
    const isCurrentWeek = currentTime.isoWeek() === timestamp.isoWeek();
    let formattedDate;

    if (isCurrentWeek) {
        formattedDate = timestamp.format("dddd, h:mm a");
    } else {
        formattedDate = timestamp.format("D MMM, h:mm a");
    }

    return (<>
        <div className={styles.notiList}>
            <Link href={notifyLinkValue}>
                <div className={styles.iconflex}>
                    <Image src={`/images/${module}-notification.svg`} alt="notify-icon" width={20} height={20} />
                    <div className={styles.msgbox}>
                        <div className={styles.msgLine}>
                            <p className={styles.message}>{notifyMessage}</p>
                            <div className={styles.dot}> </div>
                        </div>
                        <div className={styles.day}>
                            <p className={styles.time}>{formattedDate}</p>
                            <p className={styles.ago}>{elapsedTime(timestamp)}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    </>);
};

const demonotification = [
    // { module: "project", msg: "Etereo project has been completed", date: "2023-07-24T08:20:00.000Z" },
    // { module: "holiday", msg: "Admin has added new holiday", date: "2023-08-20T11:30:00.000Z" },
    // { module: "leave", msg: "Your leave has been approved by admin", date: "2023-08-23T00:00:00.000Z" },
];

const openFileManager = (field = null) => {
    const Flmngr = require("@flmngr/flmngr-react").default;
    if (Flmngr) {
        Flmngr.open({
            apiKey: "WrYOVz2j",
            urlFileManager: "https://files.teqnomanweb.com/flmngr",
            urlFiles: "https://files.teqnomanweb.com/files",
            isMultiple: false,
            acceptExtensions: null,
            onFinish: (files) => {
                if (typeof field === "string") {
                    formik.setFieldValue(field, files[0].url);
                } else {
                    editorRef.current.editor.insertContent(`<img src='${files[0].url}' />`);
                }
            },
        });
    }
}

const Header = ({ user }) => {
    const userId = user?.id
    const [userName, setUserName] = useState('')
    const [userProfile, setUserProfile] = useState('')
    useEffect(() => {
        if (userId && user?.role === "employee") {
            const fetchuser = async () => {
                try {

                    const data = await instance.get(`/api/employees?id=${userId}`).then(res => {
                        setUserName({ first_name: res.data.first_name, last_name: res.data.last_name })
                        setUserProfile(res.data.employee_profile)
                    })
                } catch (err) {
                    console.log(err.message);
                }
            }
            fetchuser()
        }
    }, [])
    const [showNotifications, setShowNotifications] = useState(false);
    const [customHeader, setCustomHeader] = useState(false);
    const notificationList = demonotification
    const notificationRef = useRef(null);
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };
    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setShowNotifications(false);
        }
    };

    const handleResize = () => {
        setCustomHeader(window.innerWidth <= 767);
    };

    useEffect(() => {
        window.addEventListener("click", handleClickOutside);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    return (<>
        {customHeader ? (<>
            <div className={styles.header}>
                <Link href='/dashboard' className={styles.logo}>
                    <Image src="/images/Teqnoman_Logo_With_BG.jpg" alt={"logo"} width={103} height={30} />
                </Link>
                <div className={styles.iconDiv}>
                    {user?.role === 'admin' && <ButtonUi text={'File Manager'} cssClass="btnuiRounded" callBack={openFileManager} />}
                    <div className={styles.notify}>
                        <div className={styles.icon} onClick={toggleNotifications} ref={notificationRef}>
                            <Image src="/images/notification-icon.svg" alt="notification" className={styles.notificationIcon} width={13} height={16} />
                            <span className={styles.notifyNumber}>{notificationList.length}</span>
                        </div>
                        <div className={`${styles.notificationDropdown} ${showNotifications ? styles.visible : ''}`}>
                            {showNotifications && (<>
                                <h3 className={styles.notificationHeading}>Notifications</h3>
                                {notificationList.length === 0 ?
                                    (<p className={styles.empty}>No notifications</p>) :
                                    (notificationList.map((item, key) => <Notification module={item.module} key={key} message={item.msg} link={item.link} date={item.date} />))
                                }
                            </>
                            )}
                        </div>
                    </div>
                    <Link href={user?.role === 'admin' ? '/admin/setting/profile' : '/profile'}>
                        <img style={{ borderRadius: '50px', objectFit: 'cover' }} src={userProfile || "/images/dummy-profile.png"} alt="user" className={styles.userIcon} width={38} height={38} onError={(e) => {
                            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${userName.first_name.charAt(0).toUpperCase()}${userName.last_name.charAt(0).toUpperCase()}`;
                        }} />
                    </Link>
                </div>
            </div>
            <div className={styles.mobileSearch}>
                <p className={styles.welcome}>{getGreetingByTime(new Date()) + " "}<span>{user?.role === 'admin' ? 'Admin' : userName.first_name}! </span></p>
            </div>
        </>) : (<>
            <div className={styles.header}>
                <p className={styles.welcome}>{getGreetingByTime(new Date()) + " "} <span>{user?.role === 'admin' ? 'Admin' : userName.first_name}! </span></p>
                <div className={styles.iconDiv}>
                    {user?.role === 'admin' && <ButtonUi text={'File Manager'} cssClass="btnuiRounded" callBack={openFileManager} />}
                    <div className={styles.notify}>
                        <div className={styles.icon} onClick={toggleNotifications} ref={notificationRef}>
                            <Image src="/images/notification-icon.svg" alt="notification" className={styles.notificationIcon} width={13} height={16} />
                            <span className={styles.notifyNumber}>{notificationList.length}</span>
                        </div>
                        <div className={`${styles.notificationDropdown} ${showNotifications ? styles.visible : ''}`}>
                            {showNotifications && (<>
                                <h3 className={styles.notificationHeading}>Notifications</h3>
                                {notificationList.length === 0 ? (<p className={styles.empty}>No notifications</p>) : (
                                    notificationList.map((item, key) => <Notification module={item.module} key={key} message={item.msg} link={item.link} date={item.date} />)
                                )}
                            </>)}
                        </div>
                    </div>
                    <Link href={user?.role === 'admin' ? '/admin/setting/profile' : '/profile'}>
                        <img style={{ borderRadius: '50px', objectFit: 'cover' }} src={userProfile || "/images/dummy-profile.png"} alt="user" className={styles.userIcon} width={38} height={38} onError={(e) => {
                            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${userName.first_name.charAt(0).toUpperCase()}${userName.last_name.charAt(0).toUpperCase()}`;
                        }} />
                    </Link>
                </div>
            </div >
        </>)}
    </>)
}

export default Header;

