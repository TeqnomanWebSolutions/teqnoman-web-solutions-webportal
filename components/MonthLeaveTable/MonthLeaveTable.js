import React from "react";
import DataTable from "react-data-table-component";
import styles from "./MonthLeaveTable.module.scss";
import Image from "next/image";
import ButtonUi from "../ButtonUi/ButtonUi";

function MonthLeaveTable() {

  const customStyles = {
    rows: { style: { borderBottom: "1px solid #E2EAF2", minHeight: "auto" } },
    headCells: { style: { minHeight: "auto", fontFamily: "Roboto", fontSize: "14px", fontWeight: "600", lineHeight: "16px", color: "#1F1F1F", paddingLeft: "8px", paddingRight: "8px", paddingTop: "20px", paddingBottom: "20px" } },
    cells: { style: { minHeight: "initial", paddingLeft: "8px", paddingRight: "8px", fontSize: "14px", fontFamily: "Roboto", color: "#1F1F1F", paddingTop: "20px", paddingBottom: "20px" } },
  };

  const columns = [
    { name: "Emp. ID", selector: (row) => `${row.id}`, grow: 0.3, minWidth: "70px", },
    { name: "Name", selector: (row) => (<div className="userIcon"><Image src={row.image} width={40} height={40} alt={row.image} /><div>{row.name}</div></div>), grow: 1.3, minWidth: "155px", wrap: true },
    { name: "Leave Type", selector: (row) => `${row.leaveType}`, grow: 0.8, },
    { name: "Reason", selector: (row) => `${row.reason}`, grow: 1, wrap: true },
    { name: "Duration", grow: 0.8, selector: (row) => `${row.duration}`, },
    { grow: 0.8, name: "Start Date", selector: (row) => `${row.startDate}`, },
    { grow: 0.8, name: "End Date", selector: (row) => `${row.endDate}`, },
    { name: "Status", selector: (row) => { return <ButtonUi status={row.status} text={row.status} />; }, grow: 1.5, },
  ];

  const data = [
    { id: "01", image: "/images/profile-img.png", name: "harsh patel", leaveType: "LWP", reason: "College Viva", duration: "8 hours", startDate: "14/01/2022", endDate: "14/01/2022", status: "Rejected", },
    { id: "02", image: "/images/profile-img.png", name: "harsh patel", leaveType: "LWP", reason: "College Viva", duration: "8 hours", startDate: "14/01/2022", endDate: "14/01/2022", status: "Pending", },
    { id: "03", image: "/images/profile-img.png", name: "harsh patel", leaveType: "LWP", reason: "College Viva", duration: "8 hours", startDate: "14/01/2022", endDate: "14/01/2022", status: "Approved", },
  ];

  return (<>
    <section className={`custom-scroll ${styles.monthtable} `}>
      <DataTable columns={columns} data={data} fixedHeader customStyles={customStyles} />
    </section>
  </>);
}

export default MonthLeaveTable;