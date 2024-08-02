import React, { useState } from "react";
import DataTable from "react-data-table-component";
import styles from "./UpcomingHolidayTable.module.scss";
import moment from "moment";

function UpcomingHolidayTable({ holidays }) {

  const [holidayData, setHolidayData] = useState(holidays || [])

  const customStyles = {
    rows: { style: { borderBottom: "1px solid #E2EAF2;", }, },
    headCells: { style: { fontFamily: "Roboto", fontSize: "14px", fontWeight: "600", lineHeight: "16px", color: "#1F1F1F", paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px", }, },
    cells: { style: { minHeight: "initial", paddingLeft: "20px", paddingRight: "20px", paddingTop: "26px", paddingBottom: "26px", fontSize: "14px", fontFamily: "Roboto", color: "#1F1F1F", }, },
  };

  const columns = [
    { name: "Name", selector: (row) => `${row.name}`, },
    { name: "Day", selector: (row) => moment(row.date, 'YYYY-MM-DD').format('dddd'), grow: 1.5, },
    { name: "Date", selector: (row) => moment(row.date, 'YYYY-MM-DD').format('DD/MM/YYYY'), },
  ];

  return (<>
    <section className={`custom-scroll ${styles.monthtable}`}>
      <DataTable columns={columns} data={holidayData?.filter(holiday => new Date(holiday.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2)} fixedHeader customStyles={customStyles} />
    </section>
  </>);
}

export default UpcomingHolidayTable;
