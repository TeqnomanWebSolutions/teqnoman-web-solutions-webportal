import React from "react";
import DataTable from "react-data-table-component";
import styles from "./BirthdayTable.module.scss";
import Image from "next/image";

function BirthdayTable() {

  const customStyles = {
    rows: { style: { borderBottom: "1px solid #E2EAF2;", }, },
    headCells: { style: { fontFamily: "Roboto", fontSize: "14px", fontWeight: "600", lineHeight: "16px", color: "#1F1F1F", paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px", }, },
    cells: { style: { minHeight: "initial", paddingLeft: "20px", paddingRight: "20px", paddingTop: "15px", paddingBottom: "15px", fontSize: "14px", fontFamily: "Roboto", color: "#1F1F1F", }, },
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => (
        <div className="userIcon">
          <Image src={row.image} width={40} height={40} alt={row.image} />
          <div>{row.name}</div>
        </div>
      ),
      grow: 5,
    },

    { name: "Date", selector: (row) => `${row.birthDate}`, grow: 2, },
  ];

  const data = [
    { image: "/images/profile-img.png", name: "Harsh’s Birthday", birthDate: "14/01/2022", },
    { image: "/images/profile-img.png", name: "Harsh’s Birthday", birthDate: "14/01/2022", },
  ];

  return (<>
    <section className={`custom-scroll ${styles.monthtable}`}>
      <DataTable columns={columns} data={data} fixedHeader customStyles={customStyles} />
    </section>
  </>);
}

export default BirthdayTable;
