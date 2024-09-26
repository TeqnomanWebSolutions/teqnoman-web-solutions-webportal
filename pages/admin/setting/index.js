import Layout from "@/components/Layout/Layout";
import Head from "next/head";
import styles from "/styles/setting.module.scss";
import { Dropdown, Modal, Nav, Tab, Tabs } from "react-bootstrap";
import Image from "next/image";
import { useState } from "react";
import { instance } from "@/utils/Apiconfig";
import ButtonUi from "@/components/ButtonUi/ButtonUi";

function EmployeeList({ employeeData, userAccess }) {

    const [addmemberModal, setAddmemberModal] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const handleAddParticipant = () => {
        setAddmemberModal(!addmemberModal)
    }

    const handleCheckboxClick = async (event) => {
        if (event.target.checked) {
            let sendData = {
                employee_id: event.target.value,
                module: "leave",
                updated_date: new Date()
            }
            let res = await instance.put(`/api/user_access`, sendData);
            if (res.status === 200) {
                setSelectedEmployees([...selectedEmployees, event.target.value]);
            }
        } else {
            let res = await instance.delete(`/api/user_access?id=${event.target.value}`);
            if (res.status === 200) {
                setSelectedEmployees(selectedEmployees.filter((e) => e == event.target.value));
            }
        }
        event.stopPropagation();
    };

    const checkValue = (id) => {
        let data = userAccess.filter((u) => u.employee_id === id);
        return data.length != 0 ? true : false;
    }
    const [employeeList, setEmployeeList] = useState(employeeData || []);

    return (<>
        <div className={`row ${styles.rowAdjust}`}>
            <div className="col-lg-7">
                <div className={styles.heading}>
                    <h5>Select Employee</h5>
                    <p className={styles.AddMember} onClick={handleAddParticipant}>+ Add new member</p>
                </div>
            </div>
            <div className={`col-lg-7 ${styles.tabInfo}`}>
                {employeeList?.map((list, key) => {
                    return (<>
                        <div key={key} className={`${styles.employeeList}`}>
                            <div>
                                <input
                                    type="checkbox"
                                    className="checkBox"
                                    id={`empCheckbox_${list.employee_id}`}
                                    name="employee"
                                    value={list._id}
                                    defaultChecked={checkValue(list._id)}
                                    onChange={(e) => handleCheckboxClick(e, list.employee_id)}
                                />
                                <label htmlFor={`empCheckbox_${list.employee_id}`} className="addressCheck">
                                    <img src={list.employee_profile || "/images/dummy-profile.png"} width={30} height={30} alt="profile" className={styles.profileImg} onError={(e) => {
                                        e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${list.first_name.charAt(0).toUpperCase()}${list.last_name.charAt(0).toUpperCase()}`;
                                    }} />
                                    <span className={styles.empName}>{list.first_name} {list.last_name}</span>
                                </label>
                            </div>
                            <p className={`${styles.empName} ${styles.designation}`}>{list.designation}</p>
                        </div>
                    </>)
                })}
            </div>
        </div>
        {addmemberModal && (<Modal show={addmemberModal} onHide={handleAddParticipant} className="eventModal">
            <Modal.Header closeButton>
                <Modal.Title>Add Participates</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-12">
                        <div className='form_control'>
                            <label className="custom-label">Employee type</label>
                            <div className='filter-sorting'>
                                <div className='dropdown-list'>
                                    <div>
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic" className="employeeDropdown">All </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#">
                                                    <div onClick={handleCheckboxClick}>
                                                        <input type="checkbox" className="checkBox" id="All" name="All" value="All" />
                                                        <label htmlFor="All" className="addressCheck">All</label>
                                                    </div>
                                                </Dropdown.Item>

                                                <Dropdown.Item href="#">
                                                    <div onClick={handleCheckboxClick}>
                                                        <input type="checkbox" className="checkBox" id="Designers" name="Designers" value="Designers" />
                                                        <label htmlFor="Designers" className="addressCheck">Designers</label>
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#">
                                                    <div onClick={handleCheckboxClick}>
                                                        <input type="checkbox" className="checkBox" id="Developers" name="Developers" value="Developers" />
                                                        <label htmlFor="Developers" className="addressCheck">Developers</label>
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#">
                                                    <div onClick={handleCheckboxClick}>
                                                        <input type="checkbox" className="checkBox" id="AllGirls" name="AllGirls" value="AllGirls" />
                                                        <label htmlFor="AllGirls" className="addressCheck">All Girls</label>
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#">
                                                    <div onClick={handleCheckboxClick}>
                                                        <input type="checkbox" className="checkBox" id="AllBoys" name="AllBoys" value="AllBoys" />
                                                        <label htmlFor="AllBoys" className="addressCheck">All Boys</label>
                                                    </div>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p className={styles.text}>Employee list</p>
                    <div className={styles.empLists}>
                        {employeeList.filter(list => list.status === 'active').map((list, key) => {
                            return <>
                                <div key={key} className={`${styles.employeeList}`}>
                                    <div>
                                        <input type="checkbox" className="checkBox" id={`allEmp_${list.employee_id}`} name="employee" value="employee" />
                                        <label htmlFor={`allEmp_${list.employee_id}`} className="addressCheck">
                                            <img src={list.employee_profile || "/images/dummy-profile.png"} width={30} height={30} alt="profile" className={styles.profileImg} onError={(e) => {
                                                e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${list.first_name.charAt(0).toUpperCase()}${list.last_name.charAt(0).toUpperCase()}`;
                                            }} />
                                            <span className={styles.empName}>{list.first_name} {list.last_name}</span>
                                        </label>
                                    </div>
                                    <p className={`${styles.empName} ${styles.designation}`}>{list.designation}</p>
                                </div>
                            </>
                        })}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        )}
    </>)
}

export default function Setting({ employeeData, userAccess }) {

    const permissionData = [
        // { title: 'Employee', icon: 'employee-icon.svg' },
        // { title: 'Project', icon: 'project-icon.svg' },
        { title: 'Leave', icon: 'leave-icon.svg' },
        { title: 'Leads', icon: 'project-icon.svg' },
        // { title: 'Holiday', icon: 'holiday-icon.svg' },
        // { title: 'Event', icon: 'event-icon.svg' },
        // { title: 'Inquiry', icon: 'inquiry-icon.svg' },
        // { title: 'Invoice', icon: 'invoice-icon.svg' },
        // { title: 'Blog', icon: 'blog-icon.svg' },
    ];

    return (<>
        <Head>
            <title>Portal || Setting</title>
            <link rel="canonical" href="" />
            <meta name="description" content="Employee management system." />
            <meta name="image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta itemProp="name" content="Employee management system - Teqnoman Web Solutions" />
            <meta itemProp="description" content="Employee management system." />
            <meta itemProp="image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="twitter:description" content="Employee management system." />
            <meta name="twitter:site" content="@teqnomanwebsolutions" />
            <meta name="twitter:creator" content="@teqnomanwebsolutions" />
            <meta name="twitter:image:src" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="keywords" content="Web design and development company" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="og:description" content="Employee management system." />
            <meta name="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="og:url" content="" />
            <meta name="og:site_name" content="Teqnoman Web Solutions" />
            <meta name="og:locale" content="en_US" />
            <meta name="og:type" content="article" />
            <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
            <link rel="apple-touch-icon-precomposed" href="/images/favicon.png" />
            <meta name="title" property="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="image" property="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="author" content="Teqnoman Web Solutions" />
        </Head>
        <Layout>
            <h2 className="page-title">Settings</h2>
            <div className="settings">
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                    <div className="row">
                        <div className="col-lg-3 col-sm-4">
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="first" className="permission"><Image src="/images/permission-icon.svg" className="image" width={14} height={14} alt="notification" />Permissions</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                        <div className="col-lg-9 col-sm-8">
                            <div className={styles.tabContent}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="first">
                                        <h4>Permissions</h4>
                                        <div>
                                            <Tabs defaultActiveKey={permissionData[0].title} id="uncontrolled-tab-example">
                                                {permissionData.map((tab) => (
                                                    <Tab key={tab.title} eventKey={tab.title} title={<span><Image src={`/images/${tab.icon}`} alt={tab.title} className="image" width={14} height={14} />{tab.title}</span>}>
                                                        <EmployeeList userAccess={userAccess} employeeData={employeeData.filter(list => list.status === 'active')} />
                                                    </Tab>
                                                ))}
                                            </Tabs>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </div>
                        </div>
                    </div>
                </Tab.Container>
            </div>
        </Layout>
    </>);
}

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
        { key: 'employeeData', endpoint: '/api/employees' },
        { key: 'userAccess', endpoint: '/api/user_access' }
    ];

    const data = {};
    let errorOccurred = false;

    for (const api of apiEndpoints) {
        try {
            const response = await instance.get(`${baseUrl}${api.endpoint}`);
            data[api.key] = response.data;
        } catch (error) {
            console.log(`Error fetching ${api.key}:`, error);
            errorOccurred = true;
        }
    }

    if (errorOccurred) {
        return { props: { ...data } };
    } else {
        return { props: data };
    }
}