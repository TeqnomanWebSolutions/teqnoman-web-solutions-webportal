import Layout from "@/components/Layout/Layout";
import styles from "../styles/dashboard.module.scss";
import Image from "next/image";
import DataTable from "react-data-table-component";
import Link from "next/link";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/DashboardCard/DashboardCard";
import WorkingDays from "@/components/WorkingDays/WorkingDays";
import { instance } from "@/utils/Apiconfig";
import moment from "moment";

export default function Dashboard() {

  const currentDate = moment();
  const leaveTypes = {
    planned_leave: "Planned Leave",
    unplanned_leave: "Unplanned Leave",
    lwp: "Leave without pay (LWP)",
  };
  const [totalData, setTotalData] = useState()
  const totalLeavesData = totalData?.leaves.length === 0 ? [] : totalData?.leaves.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).slice(0, 3);
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.id) {
      instance.get(`/api/total_data?id=${session?.user?.id}`).then((res) => {
        setTotalData(res.data);
      })
    }
  }, [session?.user?.id])

  const projectColumns = [
    { name: 'Project Name', selector: row => row.name, },
    { name: 'Status', selector: row => row.status, },
    {
      name: 'Action', grow: 0,
      selector: (row) => (
        <div className={styles.viewBtn}>
          <Link href={"/projects/" + row._id}>View</Link>
        </div>
      ),
    },
  ];

  const birthdayColumns = [
    {
      name: 'User Name',
      selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={row.employee_profile || "/images/dummy-profile.png"} width={28} height={28} alt="profile" style={{ marginRight: "10px", borderRadius: '50px', objectFit: 'cover', minWidth: "28px" }} onError={(e) => {
            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
          }} />
          {row.first_name} {row.last_name}
        </div>
      ), grow: 2, wrap: true
    },
    {
      name: "Day",
      selector: (row) => {
        return moment(row.birth_date, 'YYYY-MM-DD').format('dddd')
      },
      sortable: true,
      grow: 1
    },
    {
      name: "Date", selector: (row) => {
        return moment(row.birth_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
      }, sortable: true
    },
  ];
  const holidayColumn = [
    { name: "Holiday Name", selector: (row) => `${row.holiday_name}`, grow: 2, wrap: true },
    { name: "Day", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('dddd'), grow: 2 },
    { name: "Date", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('DD/MM/YYYY'), },
  ]
  const eventColumn = [
    {
      name: "Event Name", selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Image src={"/images/calender-icon.svg"} width={13} height={14} alt="timericon" style={{ marginRight: "11px" }} />
          {row.name}
        </div>
      ),
      grow: 2, wrap: true
    },
    { name: "Day / Time", selector: (row) => `${row.start_date}`, grow: 2, wrap: true },
    {
      name: "Event Hours", selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Image src={"/images/timer.svg"} width={10} height={10} alt="timericon" style={{ marginRight: "5px" }} />
          {row.duration} hr
        </div>
      ), grow: 0,
    },
  ];
  const totalLeaves = [
    {
      name: "Name",
      selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={row.profile || "/images/dummy-profile.png"} width={30} height={30} alt="profile" style={{ marginRight: "10px", borderRadius: '50px', objectFit: 'cover', minWidth: "30px" }} onError={(e) => {
            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
          }} />
          {row.first_name} {row.last_name}
        </div>
      ),
      grow: 1.3, wrap: true
    },
    { name: "Emp.ID", selector: (row) => `${row.emp_id}`, },
    { name: "Type", selector: (row) => `${leaveTypes[row.leave_type]}`, wrap: true },
    { name: "Reason", selector: (row) => `${row.reason}`, wrap: true },
    { name: "Duration", selector: (row) => `${row.duration}`, },
    { name: "Start Date", selector: (row) => `${moment(row.start_date).format("DD/MM/YYYY")}`, },
    { name: "End Date", selector: (row) => `${moment(row.end_date).format("DD/MM/YYYY")}`, },
    {
      name: "Status",
      grow: 1,
      selector: row => {
        const statuscheck = (key) => {
          switch (key) {
            case "pending":
              return 'status-pending'
            case "accepted":
              return 'status-accepted'
            case "rejected":
              return 'status-rejected'
            default:
              return "Pending"
          }
        }
        return (<><p className={statuscheck(row.status)}>{row.status}</p></>)
      },
    }
  ];



  const cardData = [
    // { cardName: 'Projects', total: totalData?.projects, image: '/images/project-card-icon.svg', colorClass: 'yellowCard' },
    { cardName: 'Planned Leave', total: totalData?.planned_leave, image: '/images/leaves-card-icon.svg', colorClass: 'redCard' },
    { cardName: 'Unplanned Leave', total: totalData?.unplanned_leave, image: '/images/leaves-card-icon.svg', colorClass: 'redCard' },
    { cardName: 'Total Employee', total: totalData?.employees, image: '/images/employee-card-icon.svg', colorClass: 'greenCard' },
  ]
  const upcomingHolidays = totalData?.holidaysData.filter(holiday => moment(holiday.holiday_date).isAfter(currentDate)).slice(0, 3);

  return (<>
    <Head>
      <title>Portal || Dashboard</title>
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
      <div className={styles.cards}>
        {cardData.map((card, key) => {
          return (<><DashboardCard key={key} cardName={card.cardName} total={card.total} image={card.image} colorClass={card.colorClass} /></>)
        })}
      </div>
      <div className={styles.Tablespace}>
        <div className="row">
          <div className=" col-md-12 col-lg-8 col-xl-9">
            <div className={styles.tableContent}>
              <div className={styles.tableheading}>
                <p>Total Leaves</p>
                <Link href={"/leaves"}>
                  <p className={styles.viewall}>View All</p>
                </Link>
              </div>
              <DataTable columns={totalLeaves} data={totalLeavesData} />
            </div>
          </div>
          <div className="col-md-12 col-lg-4 col-xl-3">
            <WorkingDays holidays={totalData?.holidaysData || []} label={"Working Month Days"} />
          </div>
        </div>
      </div>
      <div className={styles.Tablespace}>
        <div className='row'>
          {/* <div className="col-lg-6 col-md-12">
            <div className={styles.tableContent}>
              <div className={styles.tableheading}>
                <p>Current Projects</p>
                <Link href={"/projects"}>
                  <p className={styles.viewall}>View All</p>
                </Link>
              </div>
              <DataTable columns={projectColumns} data={totalData?.projectData} />
            </div>
          </div> */}
          <div className={`col-lg-6 col-md-12 ${styles.Tablespace}`}>
            <div className={styles.tableheading}>
              <p>Upcoming Birthday</p>
            </div>
            <DataTable columns={birthdayColumns} data={totalData?.birthdayData} />
          </div>
          <div className="col-lg-6 col-md-12">
            <div className={styles.tableContent}>
              <div className={styles.tableheading}>
                <p>Upcoming Holidays</p>
                <Link href={"/holidays"}>
                  <p className={styles.viewall}>View All</p>
                </Link>
              </div>
              <DataTable columns={holidayColumn} data={upcomingHolidays} fixedHeader />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.Tablespace}>
        <div className="row">
          {/* <div className="col-lg-6 col-md-12">
            <div className={styles.tableContent}>
              <div className={styles.tableheading}>
                <p>Upcoming Holidays</p>
                <Link href={"/holidays"}>
                  <p className={styles.viewall}>View All</p>
                </Link>
              </div>
              <DataTable columns={holidayColumn} data={upcomingHolidays} fixedHeader />
            </div>
          </div> */}
          {/* <div className="col-lg-6 col-md-12">
            <div className={styles.tableheading}>
              <p>Upcoming Events</p>
              <Link href={"/events"}>
                <p className={styles.viewall}>View All</p>
              </Link>
            </div>
            <DataTable columns={eventColumn} data={
              totalData?.eventsData.map(event => ({
                ...event,
                start_date: `${moment(event.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')} - ${moment(event.start_time, 'HH:mm').format('hh:mm A')}`
              }))
            } fixedHeader />
          </div> */}
        </div>
      </div>
    </Layout>
  </>);
}