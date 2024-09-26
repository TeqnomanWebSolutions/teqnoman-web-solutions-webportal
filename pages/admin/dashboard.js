import Layout from "@/components/Layout/Layout";
import styles from "../../styles/dashboard.module.scss";
import Image from "next/image";
import DataTable from "react-data-table-component";
import Link from "next/link";
import Head from "next/head";
import AdminCard from "@/components/AdminCard/AdminCard";
import { instance } from "@/utils/Apiconfig";
import moment from "moment";
import { useRouter } from "next/router";

const projectColumns = [
    { name: 'Project Name', selector: row => row.name, wrap: true },
    { name: 'Status', selector: row => <p style={{ textTransform: "capitalize" }}>{row.status}</p> },
    {
        name: 'Action', grow: 0, selector: (row) => (
            <div className={styles.viewBtn}>
                <Link href={`/admin/projects/${row._id}`}>View</Link>
            </div>
        ),
    },
];

const contactColumns = [
    { name: 'User Name', selector: row => row.name, wrap: true },
    { name: 'Date', selector: row => row.date, wrap: true },
    { name: 'Contact no.', selector: (row) => row.phone, wrap: true },
    { name: 'Email Id', selector: row => row.email, wrap: true },
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
        )
    },
    { name: "Day / Time", selector: (row) => (moment(row.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')), },
    {
        name: "Event Hours", selector: (row) => (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Image src={"/images/timer.svg"} width={10} height={10} alt="timericon" style={{ marginRight: "5px" }} />
                {row.duration} hr
            </div>
        ), grow: 0,
    },
];

const leaveTypes = {
    planned_leave: "Planned Leave",
    unplanned_leave: "Unplanned Leave",
    lwp: "Leave without pay (LWP)",
};

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
        grow: 1.5,
        wrap: true
    },
    { name: "Emp.ID", selector: (row) => `${row.emp_id}`, grow: 0.3, },
    { name: "Type", selector: (row) => `${leaveTypes[row.leave_type]}`, wrap: true },
    { name: "Reason", selector: (row) => `${row.reason}`, grow: 1.5, wrap: true },
    { name: "Duration", selector: (row) => `${row.duration} ${row.leave_type === "lwp" ? (row.lwp_type === "hours" ? "Hours" : "Days") : "Days"}`, },
    { name: "Start Date", selector: (row) => `${moment(row.start_date).format("DD/MM/YYYY")}` },
    { name: "End Date", selector: (row) => `${moment(row.end_date).format("DD/MM/YYYY")}` },
    {
        name: "Status",
        grow: 1.8,
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
                        return key
                }
            }
            return (<><p className={statuscheck(row.status)}>{row.status}</p></>)
        },
    },
];


export default function Dashboard(data) {

    const { holidaysData, totalData, leavesData } = data;
    const currentDate = moment();
    const totalLeavesData = totalData?.leaves.length === 0 ? [] : totalData?.leaves.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).slice(0, 3);
    const upcomingHolidays = totalData?.holidaysData
        .filter(holiday => moment(holiday.holiday_date).isSameOrAfter(currentDate)).slice(0, 3);
    const router = useRouter();

    const cardData = [
        // ["project", "current-project-icon", "Projects", totalData?.projects || 0, "/admin/projects"],
        ["employee", "total-employee-icon", "Total Employees", totalData?.employees || 0, "/admin/employees"],
        ["inquiries", "project-inquiry-icon", "Project Inquiries", totalData?.contactData.length || 0, "/admin/inquiry/contactinquiry"],
        ["blogs", "blogs-icon", "Blogs", totalData?.blogs || 0, "/admin/blog"],
        ["career", "career-inquiries-icon", 'Career Inquiries', totalData?.careerLength || 0, "/admin/inquiry/careerinquiry"],
        ["jobs", "job-icon", 'Active jobs', totalData?.jobsLength.filter(j => j.status == 'open').length || 0, "/admin/jobs"],
    ];

    const cards = cardData.map(([cssClass, icon, name, amount, url]) => ({ cssClass, icon, name, amount, url }));

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
            <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.png" />
            <link rel="apple-touch-icon-precomposed" href="/images/favicon.png" />
            <meta name="title" property="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="image" property="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="author" content="Teqnoman Web Solutions" />
        </Head>

        <Layout>
            <div className={styles.cards}>
                {cards.map((card, key) => {
                    return <AdminCard key={key} amount={card.amount} cssclass={card.cssClass} icon={card.icon} name={card.name} url={card.url} />
                })}
            </div>
            <div className={styles.Tablespace}>
                <div className="row">
                    <div className=" col-12">
                        <div className={styles.tableContent}>
                            <div className={styles.tableheading}>
                                <p>Leave Request</p>
                                <Link href={"/admin/leaves"}>
                                    <p className={styles.viewall}>View All</p>
                                </Link>
                            </div>
                            <DataTable columns={totalLeaves} data={totalLeavesData} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.Tablespace}>
                <div className='row'>
                    {/* <div className="col-lg-6 col-12">
                        <div className={styles.tableContent}>
                            <div className={styles.tableheading}>
                                <p>Current Projects</p>
                                <Link href={"/admin/projects"}>
                                    <p className={styles.viewall}>View All</p>
                                </Link>
                            </div>
                            <DataTable columns={projectColumns} data={totalData?.projectData} />
                        </div>
                    </div> */}
                    <div className="col-lg-6 col-12">
                        <div className={styles.tableheading}>
                            <p>Project Inquiry</p>
                            <Link href={"/admin/inquiry/contactinquiry"}>
                                <p className={styles.viewall}>View All</p>
                            </Link>
                        </div>
                        <DataTable columns={contactColumns} data={totalData?.contactData.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).slice(0, 3)} />
                    </div>
                    <div className="col-lg-6 col-12">
                        <div className={styles.tableContent}>
                            <div className={styles.tableheading}>
                                <p>Upcoming Holidays</p>
                                <p className={styles.viewall}><Link href={"/admin/holidays"}>View All</Link></p>
                            </div>
                            <DataTable columns={holidayColumn} data={upcomingHolidays} fixedHeader />
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className={styles.Tablespace}>
                <div className="row">
                    <div className="col-lg-6">
                        <div className={styles.tableContent}>
                            <div className={styles.tableheading}>
                                <p>Upcoming Holidays</p>
                                <p className={styles.viewall}><Link href={"/admin/holidays"}>View All</Link></p>
                            </div>
                            <DataTable columns={holidayColumn} data={upcomingHolidays} fixedHeader />
                        </div>
                    </div>
                    {/* <div className="col-lg-6">
                        <div className={styles.tableheading}>
                            <p>Upcoming Events</p>
                            <Link href={"/admin/events"}>
                                <p className={styles.viewall}>View All</p>
                            </Link>
                        </div>
                        <DataTable columns={eventColumn} data={totalData?.eventsData} fixedHeader />
                    </div> 
         </div> 
            {/* </div> */}         </Layout >
    </>);
}

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
        { key: 'totalData', endpoint: '/api/total_data?id=' },
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

