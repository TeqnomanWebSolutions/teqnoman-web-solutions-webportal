import React from "react";
import DataTable from "react-data-table-component";
import styles from "./CurrentProjectTable.module.scss";
import Image from "next/image";
import ButtonUi from "/components/ButtonUi/ButtonUi";

function CurrentProjectTable() {

  const customStyles = {
    rows: { style: { padding: "20px 0", borderBottom: "1px solid #E2EAF2;", maxHeight: "100px", overflow: "auto", }, },
    headCells: { style: { fontFamily: "Roboto", fontSize: "14px", fontWeight: "600", lineHeight: "16px", color: "#1F1F1F", paddingLeft: "15px", paddingRight: "15px", }, },
    cells: { style: { paddingLeft: "15px", paddingRight: "15px", fontSize: "14px", fontFamily: "Roboto", color: "#1F1F1F", }, },
  };

  const columns = [
    { name: "Project Name", selector: (row) => `${row.project}`, grow: 1 },
    {
      name: "Team Leder", selector: (row) => (
        <div className="userIcon">
          <Image src={row.image} width={40} height={40} alt={row.image} />
          <div>{row.leader}</div>
        </div>
      ),
      grow: 2,
      wrap: true
    },
    {
      name: "Assignees",
      selector: (row) => (
        <div className={styles.assignee}>
          <Image src={row.image} width={40} height={40} alt={row.image} />
          <Image src={row.image} width={40} height={40} alt={row.image} className={styles.imgMargin} />
          <Image src={row.image} width={40} height={40} alt={row.image} className={styles.imgMargin} />
          <Image src={row.image} width={40} height={40} alt={row.image} className={styles.imgMargin} />
        </div>
      ),
      grow: 2
    },
    { name: "Status", selector: (row) => <ButtonUi text={row.status} status={row.status} />, grow: 2, },
  ];

  const data = [
    { project: "Rohfit", image: "/images/profile-img.png", leader: "harsh patel", status: "Done", },
    { project: "Rohfit", image: "/images/profile-img.png", leader: "harsh patel", status: "In-Porgress", },
    { project: "Rohfit", image: "/images/profile-img.png", leader: "harsh patel", status: "Done", },
    { project: "Rohfit", image: "/images/profile-img.png", leader: "harsh patel", status: "Done", },
  ];

  return (<>
    <section className={`custom-scroll ${styles.monthtable}`}>
      <DataTable columns={columns} data={data} fixedHeader customStyles={customStyles} />
    </section>
  </>);
}

export default CurrentProjectTable;
