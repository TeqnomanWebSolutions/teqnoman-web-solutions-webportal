
import Layout from "@/components/Layout/Layout";
import styles from "../styles/project.module.scss";
import Image from "next/image";
import DataTable from "react-data-table-component";
import Link from "next/link";
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { useState, useEffect } from "react";
import { Dropdown, Modal } from "react-bootstrap";
import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import { instance } from "@/utils/Apiconfig";
import axios from "axios";
import moment from "moment";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";

export default function Leaves() {

  const user = useSession()
  const user_ID = user?.data?.user?.id
  const leaveTypes = {
    planned_leave: "Planned Leave",
    unplanned_leave: "Unplanned Leave",
    lwp: "Leave without pay (LWP)",
  };

  const [showModal, setShowModal] = useState(false);
  const [leaveData, setLeaveData] = useState([])
  const [filterData, setFilterdata] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveDuration, setLeaveDuration] = useState([]);
  const [minDate, setMinDate] = useState(null);
  const [leaveType, setLeaveType] = useState(null);
  const [showTextarea, setShowTextarea] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [canAddLeave, setCanAddLeave] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    leaveTypes: ["All", "Planned Leave", "Unplanned Leave", "Leave without pay (LWP)"],
    statuses: ['allstatus', 'pending', 'accepted', 'rejected', 'cancelled'],
  });

  const getLeaves = () => {
    instance.get(`/api/leaves?id=${user_ID}`).then((res) => {
      setLeaveData(res.data);
      setFilterdata(filterLeaves(res.data));
      if (res.data) {
        setCanAddLeave(res.data.some((leave) => leave.status === "pending"));
      }
    })
  }
  const handleViewModal = (data) => {
    leaveForm.setValues({ ...data });
    setViewModal(!viewModal)
  }
  useEffect(() => {
    if (user_ID) {
      instance.get(`/api/employees?id=${user_ID}`).then((res) => {
        if (res.data) {
          setCurrentUser(res.data);
        }
      });
      getLeaves();
      getLeaveBalance();
    }
  }, [user_ID]);

  const getLeaveBalance = async (employee) => {
    let res = await instance.get(`/api/leave_balance?id=${user_ID}`);
    if (res.data && res.data.length != 0) {
      setLeaveBalance(res.data[0]);
    } else {
      toast.error("Leave Balance not found! Please Contact Admin.")
    }
  }

  const leaveForm = useFormik({
    initialValues: { employee_id: "", leave_type: "", duration: "", start_date: "", end_date: "", reason: "", cancelled_reason: "", lwp_type: "", is_cancelled: false },
    validationSchema: yup.object().shape({
      leave_type: yup.string().required("Required"),
      duration: yup.string().required("Required"),
      start_date: yup.string().required("Required"),
      end_date: yup.string().required("Required"),
      reason: yup.string().required("Required")
    }),
    onSubmit: async (values) => {

      values.employee_id = user_ID;
      if (showTextarea) {
        if (values.cancelled_reason) {
          values.is_cancelled = true;
          values.status = "cancelled";
        } else {
          toast.error("Enter cancellation reason.");
          return;
        }
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
      setShowTextarea(false);
      getLeaves();
    }
  })

  const setLeaveValues = (field) => {
    leaveForm.setValues({
      ...leaveForm.values,
      leave_type: field,
      duration: "",
      start_date: "",
      end_date: "",
      lwp_type: ""
    })
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
      toast.error("Leave Balance not found! Please Contact Admin.");
      setLeaveDuration([]);
    }
    if (field === "planned_leave") {
      let todayAfter = moment().add(3, "days");
      setMinDate(todayAfter.format("YYYY-MM-DD"));
    } else {
      setMinDate(moment().format("YYYY-MM-DD"));
    }
  }

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const leaves = [
    {
      name: "Name", selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={row.profile || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} style={{ marginRight: "10px", borderRadius: '50%', objectFit: 'cover', minWidth: "30px" }} onError={(e) => {
            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
          }} />
          {row.first_name + " " + row.last_name}
        </div>
      ), wrap: true
    },
    { name: "Type", selector: (row) => `${leaveTypes[row.leave_type]}`, wrap: true },
    { name: "Reason", selector: (row) => `${row.reason}`, wrap: true },
    { name: "Duration", selector: (row) => `${row.duration} ${row.leave_type === "lwp" ? (row.lwp_type === "hours" ? "Hours" : "Days") : "Days"}`, },
    { name: "Start Date", selector: (row) => `${moment(row.start_date).format("DD/MM/YYYY")}`, },
    { name: "End Date", selector: (row) => `${moment(row.end_date).format("DD/MM/YYYY")}`, },
    {
      name: "Status", selector: (row) => <p className={row.status}>{`${row.status}`}</p>
    },
    {
      name: "Action", selector: (row) => row.status === "pending" ? <div className="action-btns"> <ButtonUi cssClass='btnuiRounded modify-Btn' text="Modify" callBack={() => { handleModalToggle(); modifyLeave(row) }} /></div> : <div className="action-btns"> <ButtonUi cssClass='btnuiRounded modify-Btn' text="View" callBack={() => handleViewModal(row)} /> </div>,
    },
  ];

  const handleLeaveTypeCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedTypes = [...filterOptions.leaveTypes];

    if (value === "All") {
      checked ? updatedTypes = ["All", "Planned Leave", "Unplanned Leave", "Leave without pay (LWP)"] : updatedTypes = [];
    } else {
      checked ? updatedTypes.push(value) : updatedTypes.splice(updatedTypes.indexOf(value), 1);

      const allIndex = updatedTypes.indexOf('All');
      if (allIndex !== -1) updatedTypes.splice(allIndex, 1);

      if (updatedTypes.length === 4) updatedTypes.unshift("All");
    }
    setFilterOptions(prevOptions => ({ ...prevOptions, leaveTypes: updatedTypes }));
  };

  const handleStatusCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updatedStatusList = [...filterOptions.statuses];

    if (value === "allstatus") {
      checked
        ? setFilterOptions({ ...filterOptions, statuses: ['allstatus', 'pending', 'accepted', 'rejected', 'cancelled'] })
        : setFilterOptions({ ...filterOptions, statuses: [] });
    } else {
      checked ? updatedStatusList.push(value) : updatedStatusList.splice(updatedStatusList.indexOf(value), 1);
      if (updatedStatusList.length === 4) {
        const allStatusIndex = updatedStatusList.indexOf('allstatus');
        if (allStatusIndex !== -1) updatedStatusList.splice(allStatusIndex, 1);
      }
      if (updatedStatusList.length === 0) updatedStatusList.push('allstatus', 'pending', 'accepted', 'rejected', 'cancelled');
      setFilterOptions({ ...filterOptions, statuses: updatedStatusList });
    }
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

  useEffect(() => {
    setFilterdata(filterLeaves(leaveData));
  }, [selectedFilter, startDate, endDate, filterOptions]);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const addleave = () => {
    leaveForm.resetForm();
    setLeaveType('addLeave');
    setShowModal(!showModal);
  }

  const cancleLeaveToggle = () => {
    leaveForm.setFieldValue("cancelled_reason", "");
    setShowTextarea(!showTextarea);
  }
  const handleModalToggle = () => {
    setShowModal(!showModal);
  };
  const modifyLeave = (leave) => {
    leaveForm.resetForm();
    setLeaveValues(leave.leave_type);
    setLeaveType("modify");
    leaveForm.setValues(leave);
  }

  const onDurationChange = (e) => {
    if (leaveForm.values.start_date) {
      leaveForm.setFieldValue("end_date", Math.ceil(e.target.values) === 1 ? leaveForm.values.start_date : moment(leaveForm.values.start_date, "YYYY-MM-DD").add(Math.ceil(e.target.value) - 1, "days").format("YYYY-MM-DD"))
    }
  }

  const onStartDateChange = (e) => {
    if (leaveForm.values.leave_type === "lwp") {
      if (leaveForm.values.lwp_type === "hours") {
        let days = Math.ceil(parseFloat(leaveForm.values.duration) / 8);
        leaveForm.setFieldValue("end_date", days === 1 ? e.target.value : moment(e.target.value, "YYYY-MM-DD").add(Math.ceil(days) - 1, "days").format("YYYY-MM-DD"))
      } else {
        leaveForm.setFieldValue("end_date", Math.ceil(leaveForm.values.duration) === 1 ? e.target.value : moment(e.target.value, "YYYY-MM-DD").add(Math.ceil(leaveForm.values.duration) - 1, "days").format("YYYY-MM-DD"))
      }
    } else {
      leaveForm.setFieldValue("end_date", Math.ceil(leaveForm.values.duration) === 1 ? e.target.value : moment(e.target.value, "YYYY-MM-DD").add(Math.ceil(leaveForm.values.duration) - 1, "days").format("YYYY-MM-DD"))
    }
  }

  const onLWPDurationChange = (e) => {
    if (leaveForm.values.lwp_type === "hours") {
      let days = Math.ceil(parseFloat(e.target.value) / 8);
      leaveForm.setFieldValue("end_date", days === 1 ? leaveForm.values.start_date : moment(leaveForm.values.start_date, "YYYY-MM-DD").add(Math.ceil(days) - 1, "days").format("YYYY-MM-DD"))
    } else {
      leaveForm.setFieldValue("end_date", Math.ceil(e.target.value) === 1 ? leaveForm.values.start_date : moment(leaveForm.values.start_date, "YYYY-MM-DD").add(Math.ceil(e.target.value) - 1, "days").format("YYYY-MM-DD"))
    }
  }

  const onLWPTypeChange = (e) => {
    if (e.target.value === "hours") {
      let days = Math.ceil(parseFloat(leaveForm.values.duration) / 8);
      leaveForm.setFieldValue("end_date", days === 1 ? leaveForm.values.start_date : moment(leaveForm.values.start_date, "YYYY-MM-DD").add(Math.ceil(days) - 1, "days").format("YYYY-MM-DD"))
    } else {
      leaveForm.setFieldValue("end_date", Math.ceil(leaveForm.values.duration) === 1 ? leaveForm.values.start_date : moment(leaveForm.values.start_date, "YYYY-MM-DD").add(Math.ceil(leaveForm.values.duration) - 1, "days").format("YYYY-MM-DD"))
    }
  }

  return (<>
    <Head>
      <title>Portal || Leaves</title>
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
                  {['Pending', 'Accepted', 'Rejected', 'Cancelled'].map((status) => (
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
                <Dropdown.Toggle id="dropdown-basic">Sort by</Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className={styles.sortFilter}>
                    <p className='listName'>Sort by</p>
                    <p className={styles.clear} onClick={() => setSelectedFilter('All')}>Clear</p>
                  </div>
                  {['This Month', 'Last Month', 'This Week'].map((type, key) => {
                    return (
                      <Dropdown.Item key={key} onClick={() => setSelectedFilter(type)}>{type}</Dropdown.Item>
                    )
                  })}
                  <Dropdown.Item >
                    <div onClick={(e) => handleCheckboxClick(e)}>
                      Custom Dates
                      <>
                        <div className='selectDate' onClick={handleCheckboxClick}>
                          <div className='form'>
                            <label className='custom-label labelName'>From</label>
                            <input type='date' className='custom-input' onClick={(e) => { setSelectedFilter("Custom Dates"); }} onChange={(e) => setStartDate(e.target.value)} />
                          </div>
                          <div className='form'>
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
            {!canAddLeave && <div className={styles.addLeave}>
              <ButtonUi cssClass="btnuiRounded add-Btn" text='Add Leave' callBack={addleave} />
            </div>}
          </div>
        </div>
      </div>
      <DataTable columns={leaves} data={filterData} pagination />
      {showModal && (<Modal show={showModal} onHide={() => { handleModalToggle(); setShowTextarea(false) }} className="leaveModal">
        <form>
          <Modal.Header closeButton>
            <Modal.Title>Add leave</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="user-profile">
              <img style={{ borderRadius: '50%', objectFit: 'cover' }} src={currentUser.employee_profile || "/images/profile.png"} width={100} height={100} alt="user-profile" onError={(e) => {
                e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${currentUser.first_name.charAt(0).toUpperCase()}${currentUser.last_name.charAt(0).toUpperCase()}`;
              }} />
              <div className="user-detail">
                <p className="user-name">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="designation">{currentUser.designation}</p>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Select leave type</label>
                  <select name="leave_type" id="leave_type" className="custom-select" onChange={(e) => { leaveForm.handleChange(e); setLeaveValues(e.target.value) }} defaultValue={leaveForm.values.leave_type} required>
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
                    <select name="duration" id="duration" className="custom-select" onChange={(e) => { leaveForm.handleChange(e); onDurationChange(e) }} value={leaveForm.values.duration} required>
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
                    <select name="lwp_type" id="lwp_type" className="custom-select" onChange={(e) => { leaveForm.handleChange(e); onLWPTypeChange(e) }} defaultValue={leaveForm.values.lwp_type} required>
                      <option value="">Select</option>
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form-input">
                    <label className="custom-label">Leave Duration</label>
                    <input name="duration" id="duration" type="number" placeholder="8" className="custom-input" onChange={(e) => { leaveForm.handleChange(e); onLWPDurationChange(e) }} value={leaveForm.values.duration} required />
                  </div>
                </div>
              </>)}
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">Start date</label>
                  <input name="start_date" id="start_date" min={minDate} type="date" className="custom-input" onChange={(e) => { leaveForm.handleChange(e); onStartDateChange(e) }} value={leaveForm.values.start_date} required />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-input">
                  <label className="custom-label">End date</label>
                  <input name="end_date" id="end_date" type="date" min={minDate} className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.end_date} readOnly />
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="form-input">
                  <label className="custom-label">Reason</label>
                  <textarea name="reason" id="reason" className="custom-input" onChange={leaveForm.handleChange} value={leaveForm.values.reason} required />
                </div>
              </div>
            </div>

          </Modal.Body>
          <div className="footer-btns">
            <Modal.Footer>
              <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
              {leaveType === "addLeave" ?
                <ButtonUi cssClass="btnuiRounded" text="Add Leave" callBack={leaveForm.handleSubmit} /> :
                <>
                  <div className='cancelLeave'>
                    <p className="leaveText" onClick={cancleLeaveToggle}>Cancel my leave</p>
                    {!showTextarea && <ButtonUi cssClass="btnuiRounded" text="Save" callBack={leaveForm.handleSubmit} />}
                  </div>
                </>
              }
            </Modal.Footer>
          </div>
          {showTextarea && (
            <div className={styles.textarea}>
              <div className="form_control">
                <label className="custom-label">Cancellation reason</label>
                <textarea className="form-control custom-input" name="cancelled_reason" id="cancelled_reason" placeholder='Add description' onChange={leaveForm.handleChange} value={leaveForm.values.cancelled_reason} />
              </div>
              <div className={styles.submitBtn}> <ButtonUi text={"Submit"} cssClass="btnuiRounded" callBack={leaveForm.handleSubmit} /></div>
            </div>
          )}   </form>
      </Modal>)}
      {viewModal && (<Modal show={viewModal} onHide={handleViewModal} className="leaveModal">
        <Modal.Header closeButton>
          <Modal.Title>View leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-input">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                  <input className="form-control custom-input" value={`${leaveForm.values.duration} Day`} readOnly />
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
                    <textarea className="form-control custom-input" name="cancelled_reason" id="cancelled_reason" placeholder='Add description' onChange={leaveForm.handleChange} value={leaveForm.values.cancelled_reason} />
                  </div>
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
      </Modal>)}
    </Layout>
  </>);
}