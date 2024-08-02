import ButtonUi from "@/components/ButtonUi/ButtonUi";
import Layout from "@/components/Layout/Layout";
import Head from "next/head";
import DataTable from "react-data-table-component";
import { Dropdown, Modal, Tab, Tabs } from "react-bootstrap";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import moment from "moment";
import { instance } from "@/utils/Apiconfig";
import Image from "next/image";
import SearchBox from "@/components/SearchBox/SearchBox";
import bcrypt from 'bcryptjs'
export default function Employees({ personalDetail }) {

    const [showModal, setShowModal] = useState(false)
    const [confirmation, setConfirmation] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '', employee_id: '' });
    const [employeeList, setEmployeeList] = useState([]);
    const [allData, setAllData] = useState([]);
    const [successMessage, setSuccessMessage] = useState(false);
    const [currentTab, setCurrentTab] = useState('Active');
    const [filterEmp, setFilterEmp] = useState([]);
    const router = useRouter();

    const handleModalToggle = (modal) => {
        setShowModal(modal);
        if (!modal) {
            setSuccessMessage(false);
        }
    };

    const confirmationModal = (id = null) => {
        setConfirmation(id)
    }

    const changestatus = async (id, status) => {
        await instance.put(`/api/employees?emp_id=${id}`, { status: status });
        instance.get("/api/employees").then((res) => {
            const filteredList = res.data.filter((d) => d.status === currentTab.toLowerCase());
            setEmployeeList(filteredList);
            setConfirmation(null)
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const hashedPassowrd = await bcrypt.hash(formData.password, 10);
        try {
            const emailCheck = await instance.get(`/api/employees`);
            const isEmailExists = emailCheck.data.some(employee => employee.email === formData.email);
            if (isEmailExists) {
                alert('Email already exists!!');
                return;
            }
            const response = await instance.post("/api/employees", { ...formData, password: hashedPassowrd, status: "onboard" });
            if (response.status === 200) {
                const emailData = {
                    to: formData.email,
                    subject: "Welcome to our company!",
                    html: `<p>Hello Dear,</p><p>Welcome to our company!</p>
                        <p>Your login credentials:</p>
                        <strong><p>Email: ${formData.email}</p></strong>
                        <strong><p>Password: ${formData.password}</p></strong> `
                };
                const emailResponse = await instance.post("/api/email", emailData);
                if (emailResponse.status === 200) {
                    setFormData({});
                    setSuccessMessage(true);
                    setTimeout(() => {
                        handleModalToggle();
                    }, 1500);
                }
                else {
                    setSuccessMessage(false);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value, });
    };

    const permissionData = [
        { title: 'Employee' },
        { title: 'Project' },
        { title: 'Leave' },
    ];

    const employee = [
        {
            name: "Name",
            selector: (row) => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={row.employee_profile || "/images/dummy-profile.png"} width={30} height={30} alt="profile" style={{ marginRight: "10px", borderRadius: '50px', objectFit: 'cover', minWidth: "30px" }} onError={(e) => {
                        e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
                    }} />
                    {row.first_name} {row.last_name}
                </div>
            ),
            grow: 1.2,
            wrap: true
        },
        { name: "Emp.ID", selector: (row) => `${row.employee_id}` },
        { name: "Join Date", selector: (row) => (moment(row.join_date, 'YYYY-MM-DD').format('DD/MM/YYYY')), },
        {
            name: "Status",
            selector: (row) => {
                if (row.status) {
                    return row.status;
                } else {
                    return "-";
                }
            },
            grow: 0.3
        },
        { name: "Department", selector: (row) => `${row.department}`, wrap: true, },
        { name: "Role", selector: (row) => `${row.designation}`, wrap: true, },
        {
            name: "Action", selector: (row) => (<>
                <div className="action-btns">
                    <Link href={`employees/${row._id}`}>
                        <ButtonUi cssClass='btnuiRounded spaceBtn' text="View/Edit" />
                    </Link>
                    <Dropdown className="leave">
                        <Dropdown.Toggle id="dropdown-basic">
                            <Image src='/images/drop-toggle.svg' width={18} height={4} alt='toggle' />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {currentTab === 'Active' ? <><Dropdown.Item href="#" className="edit" onClick={() => changestatus(row._id, "onboard")}>Onboard</Dropdown.Item><Dropdown.Item href="#" className="reject" onClick={() => confirmationModal(row._id)}>Deactive</Dropdown.Item></> : null}
                            {currentTab === 'Deactive' ? <><Dropdown.Item href="#" className="edit" onClick={() => changestatus(row._id, "onboard")}>Onboard</Dropdown.Item><Dropdown.Item href="#" className="approve" onClick={() => changestatus(row._id, "active")}>Active</Dropdown.Item></> : null}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </>),
            grow: 2
        },
    ];

    const onboardColumns = [
        { name: "No.", selector: (_, index) => `${(index + 1).toString().padStart(2, '0')}`, grow: 0.8 },
        { name: "Email", selector: (row) => row.email, grow: 1, wrap: true },
        { name: "Status", selector: (row) => (row.status ? row.status : "-"), grow: 1 },
    ];

    useEffect(() => {
        instance.get("/api/employees").then((res) => {
            const filteredList = res.data.filter((d) => d.status === currentTab.toLowerCase());
            setAllData(res.data);
            setEmployeeList(filteredList);
            setFilterEmp(filteredList);
        });
    }, []);

    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        let filteredList = allData.filter((d) => d.status === tab.toLowerCase());
        setEmployeeList(filteredList);
        setFilterEmp(filteredList);
    }

    const handleCheckboxClick = (event) => {
        event.stopPropagation();
    };
    const handleSearch = (e) => {
        const filteredList = filterEmp.filter((employee) =>
            employee.first_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
            employee.last_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
            employee.designation.toLowerCase().includes(e.target.value.toLowerCase()) ||
            employee.email.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setEmployeeList(filteredList);
    };

    return (<>
        <Head>
            <title>Portal || Employees</title>
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
            <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.svg" />
            <link rel="apple-touch-icon-precomposed" href="/images/favicon.svg" />
            <meta name="title" property="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="image" property="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="author" content="Teqnoman Web Solutions" />
        </Head>
        <Layout>
            <div className='employee filter-sorting'>
                <h2 className='page-title'>Employee list</h2>
                <div className='employeeFlex'>
                    <SearchBox text="Search Employee" onSearch={handleSearch} />
                    <Tabs defaultActiveKey='Active' id="uncontrolled-tab-example" onSelect={(selectedTab) => handleTabChange(selectedTab)}>
                        <Tab key='Active' eventKey='Active' title='Active' ></Tab>
                        <Tab key='Onboard' eventKey='Onboard' title='Onboard'></Tab>
                        <Tab key='Deactive' eventKey='Deactive' title={<span> Deactive</span>}></Tab>
                    </Tabs>
                    <div className='dropdown-list'>
                        <ButtonUi cssClass='btnuiRounded' text='Add employee' callBack={handleModalToggle} />
                    </div>
                </div>
            </div>
            <DataTable columns={currentTab === 'Onboard' ? onboardColumns : employee} data={employeeList} fixedHeader sortable />
        </Layout>

        {showModal && (<Modal show={showModal} onHide={handleModalToggle} className="add-emp-modal">
            <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12">
                        <div className="form-input">
                            <label className="custom-label">Employee ID</label>
                            <input type="number" name="employee_id" className="custom-input" placeholder="Enter your Employee ID" value={formData?.employee_id} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12">
                        <div className="form-input">
                            <label className="custom-label">Email</label>
                            <input type="email" name="email" className="custom-input" placeholder="Enter your email" value={formData?.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12">
                        <div className="form-input">
                            <label className="custom-label">Password</label>
                            <input name="password" type="password" className="custom-input" placeholder="password" value={formData?.password} onChange={handleChange} required />
                        </div>
                    </div>
                    {successMessage && (
                        <p className="success-message">Employee added successfully!!</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={() => handleModalToggle()} />
                    <ButtonUi cssClass="btnuiRounded" text="Add Employee" type='submit' />
                </Modal.Footer>
            </form>
        </Modal>)}

        <Modal show={confirmation} className="holiday-modal" centered onHide={confirmationModal}>
            <Modal.Header closeButton>
                <Modal.Title>Deactivate Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to Deactivate this employee?</p>
            </Modal.Body>
            <Modal.Footer>
                <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={confirmationModal} />
                <ButtonUi cssClass='btnuiRounded' text="Deactivate" callBack={() => changestatus(confirmation, 'deactive')} />
            </Modal.Footer>
        </Modal>
    </>);
}