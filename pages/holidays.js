
import Layout from "@/components/Layout/Layout";
import { instance } from "@/utils/Apiconfig";
import moment from "moment";
import Head from "next/head";
import { useState } from "react";
import DataTable from "react-data-table-component";

export default function Holidays({ holidays }) {

    const [holidayList] = useState(holidays || []);
    const holidaysColumn = [
        { name: "No.", selector: (_, index) => `${(index + 1).toString().padStart(2, '0')}`, grow: 0.3 },
        { name: "Holiday Name", selector: (row) => `${row.holiday_name}`, wrap: true },
        { name: "Date", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('DD/MM/YYYY'), sortable: true },
        { name: "Day", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('dddd'), },
    ];

    return (<>
        <Head>
            <title>Portal || Holidays</title>
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
            <h2 className='page-title'>Holidays</h2>
            <DataTable columns={holidaysColumn} data={holidayList} fixedHeader pagination />
        </Layout>
    </>);
}

export async function getServerSideProps(context) {
    const req = context.req;
    const { cookie } = req.headers;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    let res = await instance.get(`${baseUrl}/api/holidays`, {
        headers: {
            'Cookie': cookie,
        }
    });
    return {
        props: {
            holidays: res && res.data
        }
    }
}