import Layout from "@/components/Layout/Layout";
import styles from "../../styles/project.module.scss";
import Image from "next/image";
import DataTable from "react-data-table-component";
import Link from "next/link";
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { useState, useEffect } from "react";
import { Dropdown, Modal } from "react-bootstrap";
import Head from "next/head";
import { useFormik } from "formik";
import { instance } from "@/utils/Apiconfig";
import { toast } from "react-toastify";
import moment from "moment";
import * as yup from "yup";
import { DashboardCard } from "@/components/DashboardCard/DashboardCard";
import SearchBox from "@/components/SearchBox/SearchBox";

export default function Leaves() {

  const leaveTypes = {
    planned_leave: "Planned Leave",
    unplanned_leave: "Unplanned Leave",
    lwp: "Leave without pay (LWP)",
  };

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [leaveData, setLeaveData] = useState([])
  const [filterData, setFilterdata] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const [leaveType, setLeaveType] = useState(null);
  const [leaveDuration, setLeaveDuration] = useState([]);
  const [minDate, setMinDate] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    leaveTypes: ["All", "Planned Leave", "Unplanned Leave", "Leave without pay (LWP)"],
    statuses: ['allstatus', 'pending', 'accepted', 'rejected', 'cancelled'],
  });

  const getLeaves = () => {
    instance.get(`/api/leaves`).then((res) => {
      setLeaveData(res.data);
      setFilterdata(filterLeaves(res.data));
    })
  }

  useEffect(() => {
    instance.get(`/api/employees`).then((res) => {
      if (res.data) {
        let filter = res.data.filter((emp) => emp.status === "active");
        setEmployees(filter);
        setFilteredEmployees(filter);
      }
    });
    getLeaves();
  }, [])

  const leaveForm = useFormik({
    initialValues: { employee_id: "", leave_type: "", duration: "", start_date: "", end_date: "", reason: "", lwp_type: "" },
    validationSchema: yup.object().shape({
      employee_id: yup.mixed().required("Required"),
      leave_type: yup.string().required("Required"),
      duration: yup.string().required("Required"),
      start_date: yup.string().required("Required"),
      end_date: yup.string().required("Required"),
      reason: yup.string().required("Required")
    }),
    onSubmit: async (values) => {
      delete values.planned_leave
      delete values.unplanned_leave
      if (typeof values.employee_id === "object") {
        values.employee_id = values.employee_id._id;
      }
      if (values.leave_type != "lwp") {
        if (parseFloat(values.duration) <= parseFloat(leaveBalance[values.leave_type])) {
          if (leaveType === "addLeave") {
            await instance.post(`/api/leaves`, values)
          } else {
            let id = values._id;
            delete values._id;
            await instance.put(`/api/leaves?id=${id}`, values)
          }
        } else {
          toast.error("Not enough leave balance");
        }
      } else {
        if (leaveType === "addLeave") {
          await instance.post(`/api/leaves`, values)
        } else {
          let id = values._id;
          delete values._id;
          await instance.put(`/api/leaves?id=${id}`, values)
        }
      }
      handleModalToggle();
      getLeaves();
    }
  })

  const getLeaveBalance = async (employee) => {
    setIsLoading(true);
    let res = await instance.get(`/api/leave_balance?id=${employee._id}`);
    if (res.data && res.data.length != 0) {
      setLeaveBalance(res.data[0]);
    } else {
      toast.error("The leave balance for this employee could not be found.")
    }
    setIsLoading(false);
  }

  const setLeaveValues = (field, leaveBalance) => {
    if (leaveBalance) {
      let limit = parseInt(leaveBalance[field]);
      let list = [];
      for (let i = 0; i <= limit; i++) {
        let add = i;
        if (add != 0) {
          list.push(add);
        }
        add = add + 0.5;
        if (add > 0 && add <= limit) {
          list.push(add);
        }
      }
      setLeaveDuration([...list]);
    } else {
      toast.error("Select Employee");
      setLeaveDuration([]);
    }
    if (field === "planned_leave") {
      let todayAfter = moment().add(4, "days");
      setMinDate(todayAfter.format("YYYY-MM-DD"));
    } else {
      setMinDate(moment().format("YYYY-MM-DD"));
    }
  }

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const handleViewModal = (data) => {
    leaveForm.setValues({ ...data });
    setViewModal(!viewModal)
  }

  const handleActionLeave = async (action, data) => {
    if (action === "approve") {
      let res = await instance.get(`/api/leave_balance?id=${data.employee_id}`);
      let balance = res.data[0];
      balance[data.leave_type] = parseFloat(balance[data.leave_type]) - parseFloat(data.duration);
      delete balance._id;
      await instance.put(`/api/leave_balance?id=${balance.employee_id}`, balance);
      await instance.put(`/api/leaves?id=${data._id}`, { status: "accepted" });
    } else {
      await instance.put(`/api/leaves?id=${data._id}`, { status: "rejected" });
    }
    getLeaves();
  }
  const leaves = [
    {
      name: "Name", selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: 'pointer' }} className='image-space'>
          <img src={row.profile || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} style={{ marginRight: "10px", borderRadius: "50%", objectFit: "cover", minWidth: "30px" }} onError={(e) => {
            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
          }} />
          {row.first_name + " " + row.last_name}
        </div>
      ),
      wrap: true,
      grow: 2,
    },
    { name: "Emp.ID", selector: (row) => `${row.emp_id}`, grow: 0.2 },
    { name: "Type", selector: (row) => `${leaveTypes[row.leave_type]}`, grow: 1, wrap: true },
    { name: "Duration", selector: (row) => `${row.duration} ${row.leave_type === "lwp" ? (row.lwp_type === "hours" ? "Hours" : "Days") : "Days"}`, grow: 0.2 },
    { name: "Start Date", selector: (row) => `${moment(row.start_date).format("DD/MM/YYYY")}`, grow: 0.2 },
    { name: "End Date", selector: (row) => `${moment(row.end_date).format("DD/MM/YYYY")}`, },
    {
      name: "Status", selector: row => {
        return (<p className={row.status}>{row.status}</p>)
      },
      grow: 1,
      wrap: true
    },
    {
      name: "Action", selector: (row) => (<>
        <Dropdown className="leave">
          <Dropdown.Toggle id="dropdown-basic">
            <Image src='/images/drop-toggle.svg' width={18} height={4} alt='toggle' />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#" className="view" onClick={() => handleViewModal(row)}>View</Dropdown.Item>
            {row.status === "pending" && <>
              <Dropdown.Item href="#" className="edit" onClick={() => modifyLeave(row)}>Edit</Dropdown.Item>
              <Dropdown.Item href="#" className="approve" onClick={() => handleActionLeave("approve", row)}>Approve</Dropdown.Item>
              <Dropdown.Item href="#" className="reject" onClick={() => handleActionLeave("reject", row)}>Reject</Dropdown.Item>
            </>}
          </Dropdown.Menu>
        </Dropdown>
      </>),
      grow: 0.2
    },
  ];

  const handleLeaveTypeCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedTypes = [...filterOptions.leaveTypes];
    if (value === "All") {
      if (checked) {
        updatedTypes = ["All", "Planned Leave", "Unplanned Leave", "Leave without pay (LWP)"];
      } else {
        updatedTypes = [];
      }
    } else {
      if (checked) {
        updatedTypes.push(value);
      } else {
        const index = updatedTypes.indexOf(value);
        if (index !== -1) {
          updatedTypes.splice(index, 1);
        }
      }
      const allIndex = updatedTypes.indexOf('All');
      if (allIndex !== -1) {
        updatedTypes.splice(allIndex, 1);
      }

      if (updatedTypes.length === 4) {
        updatedTypes.unshift("All");
      }
    }

    setFilterOptions(prevOptions => ({
      ...prevOptions,
      leaveTypes: updatedTypes,
    }));
  };

  const filterLeaves = (data) => {
    let filteredData = data;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
    const currentWeekEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - currentDate.getDay()));
    if (selectedFilter === "This Month") {
      filteredData = data.filter(item => new Date(item.start_date).getMonth() + 1 === currentMonth);
    } else if (selectedFilter === "Last Month") {
      filteredData = data.filter(item => new Date(item.start_date).getMonth() + 1 === currentMonth - 1);
    } else if (selectedFilter === "This Week") {
      filteredData = data.filter(item => {
        const itemDate = new Date(item.start_date);
        return itemDate >= currentWeekStart && itemDate <= currentWeekEnd;
      });
    } else if (selectedFilter === "Custom Dates" && startDate && endDate) {
      const customStartDate = new Date(startDate);
      const customEndDate = new Date(endDate);
      filteredData = data.filter(item => {
        const itemDate = new Date(item.start_date);
        return itemDate >= customStartDate && itemDate <= customEndDate;
      });
    }

    return filteredData.filter(item => {
      const isLeaveTypeMatched = filterOptions.leaveTypes.includes("All") || filterOptions.leaveTypes.includes(leaveTypes[item.leave_type]);
      const isStatusMatched = filterOptions.statuses.includes('allstatus') || filterOptions.statuses.includes(item.status.toLowerCase());
      return isLeaveTypeMatched && isStatusMatched;
    });
  };

  const handleStatusCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedStatuses = [...filterOptions.statuses];

    if (value === "allstatus") {
      if (checked) {
        updatedStatuses = ['allstatus', 'pending', 'accepted', 'rejected', 'cancelled'];
      } else {
        updatedStatuses = [];
      }
    } else {
      if (checked) {
        updatedStatuses.push(value);
      } else {
        const index = updatedStatuses.indexOf(value);
        if (index !== -1) {
          updatedStatuses.splice(index, 1);
        }
      }

      const allStatusIndex = updatedStatuses.indexOf('allstatus');
      if (allStatusIndex !== -1) {
        updatedStatuses.splice(allStatusIndex, 1);
      }

      if (updatedStatuses.length === 4) {
        updatedStatuses.unshift('allstatus');
      }
    }

    setFilterOptions(prevOptions => ({
      ...prevOptions,
      statuses: updatedStatuses,
    }));
  };

  useEffect(() => {
    setFilterdata(filterLeaves(leaveData));
  }, [selectedFilter, startDate, endDate, filterOptions]);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };
  const searchEmploy = (e) => {
    if (e.target.value) {
      setFilteredEmployees(
        leaveData.filter((employee) =>
          [employee.first_name, employee.last_name].some((field) =>
            field.toLowerCase().includes(e.target.value.toLowerCase())
          )
        )
      );
    } else {
      setFilteredEmployees(employees);
    }
  };

  const addleave = () => {
    setShowModal(!showModal);
    setLeaveType("addLeave");
  }

  const modifyLeave = async (data) => {
    leaveForm.setValues({ ...data });
    setLeaveType("modify");
    let res = await instance.get(`/api/leave_balance?id=${data.employee_id}`);
    if (res.data && res.data.length != 0) {
      setLeaveBalance(res.data[0]);
      setLeaveValues(data.leave_type, res.data[0]);
    } else {
      toast.error("The leave balance for this employee could not be found.")
    }
    let emp = filteredEmployees.filter((emp) => emp._id === data.employee_id);
    leaveForm.setFieldValue("employee_id", emp[0]);
    setShowModal(!showModal);
  }

  const handleModalToggle = () => {
    setShowModal(!showModal);
    leaveForm.resetForm();
  };
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setFilterdata(leaveData.filter((item) => {
      return item.first_name.toLowerCase().includes(searchValue) || item.last_name.toLowerCase().includes(searchValue);
    }));
  }

  return (<>
    <Head>
      <title>Admin || Leaves</title>
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
      <div className={styles.projectCard}>
        <div className='filter-sorting'>
          <h2 className='page-title'>Leave</h2>
          <div className='dropdown-list'>
            <SearchBox text="Search Employee" onSearch={handleSearch} />
            <div className={styles.type}>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">Leave</Dropdown.Toggle>
                <Dropdown.Menu>
                  <p className='listName'>Leave type</p>
                  {['All', 'Planned Leave', 'Unplanned Leave', 'Leave without pay (LWP)'].map((type) => (
                    <Dropdown.Item key={type}>
                      <div className={styles.dropList} onClick={handleCheckboxClick}>
                        <input
                          type="checkbox"
                          className={styles.checkBox}
                          id={type}
                          name={type}
                          value={type}
                          checked={filterOptions.leaveTypes.includes(type)}
                          onChange={handleLeaveTypeCheckboxChange}
                        />
                        <label htmlFor={type} className={styles.addressCheck}>
                          {type}
                        </label>
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={styles.type}>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">Status</Dropdown.Toggle>
                <Dropdown.Menu>
                  <p className='listName'>Status</p>
                  <Dropdown.Item>
                    <div onClick={handleCheckboxClick} className={styles.dropList}>
                      <input
                        type="checkbox"
                        className={styles.checkBox}
                        id={'allstatus'}
                        name={"allstatus"}
                        value={'allstatus'}
                        checked={filterOptions.statuses.includes('allstatus')}
                        onChange={handleStatusCheckboxChange}
                      />
                      <label htmlFor={'allstatus'} className={styles.addressCheck}>
                        {"All"}
                      </label>
                    </div>
                  </Dropdown.Item>
                  {['Pending', 'Accepted', 'Rejected', 'cancelled'].map((status) => (
                    <Dropdown.Item key={status}>
                      <div onClick={handleCheckboxClick} className={styles.dropList}>
                        <input
                          type="checkbox"
                          className={styles.checkBox}
                          id={status}
                          name={status}
                          value={status.toLowerCase()}
                          checked={filterOptions.statuses.includes(status.toLowerCase())}
                          onChange={handleStatusCheckboxChange}
                        />
                        <label htmlFor={status} className={styles.addressCheck}>
                          {status}
                        </label>
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className={styles.type}>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">Filter</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedFilter("All")}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedFilter("This Month")}>This Month</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedFilter("Last Month")}>Last Month</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedFilter("This Week")}>This Week</Dropdown.Item>
                  <Dropdown.Item >
                    <div onClick={(e) => handleCheckboxClick(e)}>
                      Custom Dates
                      <>
                        <div className='selectDate' >
                          <div className='form'>
                            <label className='custom-label labelName'>From</label>
                            <input type='date' className='custom-input' onClick={(e) => { setSelectedFilter("Custom Dates"); }} onChange={(e) => setStartDate(e.target.value)} />
                          </div>
                          <div className={styles.form}>
                            <label className='custom-label labelName'>To</label>
                            <input type='date' className='custom-input' onClick={(e) => { setSelectedFilter("Custom Dates"); }} onChange={(e) => setEndDate(e.target.value)} />
                          </div>
                        </div>
                      </>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className={styles.addLeave}>
              <ButtonUi cssClass="btnuiRounded add-Btn" text='Add Leave' callBack={addleave} />
            </div>
          </div>
        </div>
      </div>
      <DataTable columns={leaves} data={filterData} pagination />
      {showModal && (<Modal show={showModal} onHide={() => { handleModalToggle() }} className="leaveModal">
        <Modal.Header closeButton>
          <Modal.Title>Add leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-input">
            <label className="custom-label">Select Employee</label>
            <Dropdown className="leave_Dropdown">
              <Dropdown.Toggle id="dropdown-basic" >
                {leaveForm.values.employee_id ? (
                  <div className={styles.list}>
                    <img
                      src={leaveForm.values.employee_id.employee_profile || "/images/dummy-profile.png"}
                      width={30}
                      height={30}
                      alt="profile"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${leaveForm.values.employee_id.first_name.charAt(0).toUpperCase()}${leaveForm.values.employee_id.last_name.charAt(0).toUpperCase()}`;
                      }}
                    />
                    <p>{leaveForm.values.employee_id.first_name} {leaveForm.values.employee_id.last_name}</p>
                  </div>
                ) : ("Select Employee")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className={styles.search}>
                  <Image src="/images/search-icon.svg" alt="search-icon" height={14} width={14} />
                  <input type="text" className={styles.searchTerm} placeholder='Search' onChange={searchEmploy} />
                </div>
                {filteredEmployees.map((employee, key) => {
                  return (<>
                    <Dropdown.Item key={key} onClick={() => { leaveForm.setFieldValue("employee_id", employee); getLeaveBalance(employee) }}>
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
                  <label className="custom-label">Select leave type</label>
                  <select name="leave_type" id="leave_type" className="custom-select" onChange={(e) => { leaveForm.handleChange(e); setLeaveValues(e.target.value, leaveBalance) }} defaultValue={leaveForm.values.leave_type} required>
                    <option value="">Select</option>
                    <option value="planned_leave">Planned Leave</option>
                    <option value="unplanned_leave">Unplanned Leave</option>
                    <option value="lwp">Leave without Pay (LWP)</option>
                  </select>
                </div>
              </div>
              {leaveForm.values.leave_type != "lwp" && (<>
                <div className="col-lg-6 col-md-6">
                  <div className="form-input">
                    <label className="custom-label">Leave Duration</label>
                    <select name="duration" id="duration" className="custom-select" onChange={leaveForm.handleChange} defaultValue={leaveForm.values.duration} required>
                      <option value="">Select</option>
                      {leaveDuration.map((l, index) => <option value={l} key={index}>{l}</option>)}
                      {leaveBalance?.planned_leave == 0.5 && leaveForm.values.leave_type === "planned_leave" && <option value="0.5">0.5</option>}
                      {leaveBalance?.unplanned_leave == 0.5 && leaveForm.values.leave_type === "unplanned_leave" && <option value="0.5">0.5</option>}
                    </select>
                  </div>
                </div>
              </>)}
              {leaveForm.values.leave_type === "lwp" && (<>
                <div className="col-lg-6 col-md-6">
                  <div className="form-input">
                    <label className="custom-label">LWP Type</label>
                    <select name="lwp_type" id="lwp_type" className="custom-select" onChange={(e) => { leaveForm.handleChange(e); }} defaultValue={leaveForm.values.lwp_type} required>
                      <option value="">Select</option>
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form-input">
                    <label className="custom-label">Leave Duration</label>
                    <input name="duration" id="duration" type="text" placeholder="8" className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.duration} required />
                  </div>
                </div>
              </>)}
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Start date</label>
                  <input name="start_date" id="start_date" type="date" className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.start_date} required />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">End date</label>
                  <input name="end_date" id="end_date" type="date" className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.end_date} required />
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="form-input">
                  <label className="custom-label">Reason</label>
                  <textarea name="reason" id="reason" className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.reason} required />
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <div className="footer-btns">
          <Modal.Footer>
            <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
            {leaveType === "addLeave" && <ButtonUi cssClass="btnuiRounded" text="Add Leave" callBack={leaveForm.submitForm} />}
            {leaveType != "addLeave" && <ButtonUi cssClass="btnuiRounded" text="Save" callBack={leaveForm.handleSubmit} />}
          </Modal.Footer>
        </div>
      </Modal>)}

      {viewModal && (<Modal show={viewModal} onHide={handleViewModal} className="leaveModal">
        <Modal.Header closeButton>
          <Modal.Title>View leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-input">
            <div style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
              <img src={leaveForm.values.profile || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} style={{ marginRight: "10px" }} onError={(e) => {
                e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${leaveForm.values.first_name.charAt(0).toUpperCase()}${leaveForm.values.last_name.charAt(0).toUpperCase()}`;
              }} />
              <p className="page-title" style={{ marginBottom: "0px" }}> {leaveForm.values.first_name} {leaveForm.values.last_name}</p>
            </div>
          </div>
          <form>
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Leave type</label>
                  <input className="form-control custom-input" value={leaveTypes[leaveForm.values.leave_type]} readOnly />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Leave Duration</label>
                  <input className="form-control custom-input" value={`${leaveForm.values.duration} ${leaveForm.values.leave_type === "lwp" ? leaveForm.values.lwp_type : "Day"}`} readOnly />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Start date</label>
                  <input name="start_date" type="date" className="custom-input" value={leaveForm.values.start_date} readOnly />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">End date</label>
                  <input name="end_date" type="date" className="custom-input" value={leaveForm.values.end_date} readOnly />
                </div>
              </div>
              <div className={styles.textarea}>
                <div className="form_control">
                  <label className="custom-label">Reason</label>
                  <textarea className="form-control custom-input" name="description" placeholder='Add description' value={leaveForm.values.reason} readOnly />
                </div>
              </div>
              {leaveForm.values.cancelled_reason && (
                <div className={styles.textarea}>
                  <div className="form_control">
                    <label className="custom-label">Cancellation reason</label>
                    <textarea className="form-control custom-input" name="cancelled_reason" id="cancelled_reason" placeholder='Add description' value={leaveForm.values.cancelled_reason} readOnly />
                  </div>
                </div>
              )}
              <p className="custom-label">Leave Balance</p>
              <div className="col-lg-6 col-md-6">
                <DashboardCard cardName={"Planned"} total={leaveForm.values.planned_leave} image={"/images/planned-leave-icon.svg"} colorClass={"redCard"} />
              </div>
              <div className="col-lg-6 col-md-6">
                <DashboardCard cardName={"Unplanned"} total={leaveForm.values.unplanned_leave} image={"/images/leaves-card-icon.svg"} colorClass={"greenCard"} />
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>)}
    </Layout>
  </>);
}