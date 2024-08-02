import ButtonUi from '@/components/ButtonUi/ButtonUi'
import Layout from '@/components/Layout/Layout'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Dropdown, Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import styles from "../../styles/leavebalance.module.scss";
import { instance } from '@/utils/Apiconfig'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'

export default function LeaveBalance() {

  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterData, setFilterdata] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [action, setAction] = useState(null);

  const leaveBalanceForm = useFormik({
    initialValues: {
      employee_id: "",
      planned_leave: "",
      unplanned_leave: ""
    },

    onSubmit: async (values) => {
      if (values.employee_id && values.planned_leave && values.unplanned_leave) {
        if (typeof values.employee_id === "object") {
          values.employee_id = values.employee_id._id;
        }
        if (action === "add") {
          try {
            await instance.put(`/api/leave_balance?id=`, values).then(() => {
              toast.success("Leave Balance Added");
              leaveBalanceForm.resetForm();
              getLeaveBalance();
              handleModalToggle();
            })
          } catch (error) {
            toast.error("Error while adding Leave Balance");
          }
        } else {
          try {
            delete values._id;
            let sendData = {
              employee_id: values.employee_id,
              planned_leave: values.planned_leave,
              unplanned_leave: values.unplanned_leave
            }
            await instance.put(`/api/leave_balance?id=${values.employee_id}`, sendData).then(() => {
              toast.success("Leave Balance Updated");
              leaveBalanceForm.resetForm();
              getLeaveBalance();
              handleModalToggle();
            })
          } catch (error) {
            toast.error("Error while updating Leave Balance");
          }
        }
      }

    }
  })

  useEffect(() => {
    instance.get(`/api/employees`).then((res) => {
      if (res.data) {
        let filter = res.data.filter((emp) => emp.status === "active");
        setEmployees(filter);
        setFilteredEmployees(filter);
      }
    });
    getLeaveBalance();
  }, [])

  function getLeaveBalance() {
    instance.get(`/api/leave_balance`).then((res) => {
      setFilterdata(res.data);
      setLeaveData(res.data)
    })
  }

  const handleModalToggle = (action, data = null) => {
    setAction("add");
    if (action === "edit") {
      setAction("edit");
      let emp = filteredEmployees.filter((emp) => emp._id === data.employee_id);

      leaveBalanceForm.setValues({ ...data, employee_id: emp[0] });
    }

    setShowModal(!showModal);
    setFilteredEmployees(employees);
  }

  const handleDeleteModalToggle1 = async () => {
    try {
      await instance.delete(`/api/leave_balance?id=${deleteModal[1]}`);
      toast.success("Leave Balance Deleted");
      getLeaveBalance();
    } catch (err) {
      toast.success("Error while deleting leave balance.");
    }
    setDeleteModal(!deleteModal)
  }

  const clearData = () => {
    setDeleteModal([false, null])
    setShowModal(null);
    leaveBalanceForm.resetForm();
  }
  const searchEmploy = (e) => {
    if (e.target.value) {
      setFilteredEmployees(
        employees.filter((employee) =>
          [employee.first_name, employee.last_name].some((field) =>
            field.toLowerCase().includes(e.target.value.toLowerCase())
          )
        )
      );
    } else {
      setFilteredEmployees(employees);
    }
  };

  const leaves = [
    { name: "Emp.ID", selector: (row) => `${row.emp_id}`, grow: 0.5 },
    {
      name: "Name", selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: 'pointer' }}>
          <img src={row.profile || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} style={{ marginRight: "10px", borderRadius: '50%', objectFit: "cover", minWidth: "30px" }} onError={(e) => {
            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
          }} />
          {row.first_name + " " + row.last_name}
        </div>
      ),
      wrap: true,
      grow: 1.5,
    },

    { name: "Planned Leave", selector: (row) => `${row.planned_leave}`, grow: 0.5 },
    { name: "Unplanned Leave", selector: (row) => `${row.unplanned_leave}`, grow: 0.5 },
    {
      name: "Action", selector: (row) => (
        <div className={styles.action}>
          <div className={styles.delete} onClick={() => setDeleteModal([true, row._id])}>
            <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
          </div>
          <div className={styles.edit} onClick={() => { handleModalToggle("edit", row) }}>
            <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
          </div>
        </div>
      ),
    },
  ];

  return (<>
    <Head>
      <title>Portal || Leave Balance</title>
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
      <div className={styles.head}>
        <h2 className='page-title'>Leave Balance</h2>
        <ButtonUi cssClass="btnuiRounded" text="Add Leave Balance" callBack={() => handleModalToggle("add")} />
      </div>
      <DataTable columns={leaves} data={filterData} pagination />
    </Layout>

    {showModal && (<Modal show={showModal} className="leaveModal" onHide={clearData}>
      <Modal.Header closeButton>
        <Modal.Title> {action === "edit" ? "Edit Leave Balance" : "Add Leave Balance"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-input">
          <label className="custom-label">{action === "edit" ? "Employee Name" : "Select Employee"}</label>
          <Dropdown className="leave_Dropdown">
            <Dropdown.Toggle id="dropdown-basic">
              {leaveBalanceForm.values.employee_id ? (
                <div className={styles.list}>
                  <img
                    src={leaveBalanceForm.values.employee_id.employee_profile || "/images/dummy-profile.png"}
                    width={30}
                    height={30}
                    alt="profile"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${leaveBalanceForm.values.first_name.charAt(0).toUpperCase()}${leaveBalanceForm.values.last_name.charAt(0).toUpperCase()}`;
                    }}
                  />
                  <p>{leaveBalanceForm.values.employee_id.first_name} {leaveBalanceForm.values.employee_id.last_name}</p>
                </div>) : ("Select Employee")}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <div className={styles.search}>
                <Image src="/images/search-icon.svg" alt="search-icon" height={14} width={14} />
                <input type="text" className={styles.searchTerm} placeholder='Search' onChange={searchEmploy} />
              </div>
              {filteredEmployees.map((employee, key) => {
                return (<>
                  <Dropdown.Item key={key} onClick={() => leaveBalanceForm.setFieldValue("employee_id", employee)}>
                    <div
                      className={styles.list}
                    >
                      <img
                        src={employee.employee_profile || "/images/dummy-profile.png"}
                        width={30}
                        height={30}
                        alt="profile"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${employee.first_name.charAt(0).toUpperCase()}${employee.last_name.charAt(0).toUpperCase()}`;
                        }}
                      />
                      <p>{employee.first_name} {employee.last_name}</p>
                    </div>
                  </Dropdown.Item>
                </>)
              })}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <form>
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="form-input">
                <label className="custom-label">Planned Leave</label>
                <input className="form-control custom-input" value={leaveBalanceForm.values.planned_leave} onChange={leaveBalanceForm.handleChange} name="planned_leave" id="planned_leave" />
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="form-input">
                <label className="custom-label">Unplanned Leave</label>
                <input className="form-control custom-input" value={leaveBalanceForm.values.unplanned_leave} onChange={leaveBalanceForm.handleChange} name="unplanned_leave" id="unplanned_leave" />
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
        <ButtonUi cssClass="btnuiRounded" text={action === "edit" ? "Save Changes" : "Add Leave Balance"} type='submit' callBack={(e) => leaveBalanceForm.handleSubmit(e)} />
      </Modal.Footer>
    </Modal>)}

    {deleteModal[0] && (<Modal show={deleteModal[0]} className="leaveModal" onHide={clearData}>
      <Modal.Header closeButton>
        <Modal.Title>
          Delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className={styles.remove}>Are you sure you want to Remove Leave?</p>
      </Modal.Body>
      <Modal.Footer>
        <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
        <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={() => handleDeleteModalToggle1()} />
      </Modal.Footer>
    </Modal>)}
  </>)
}

