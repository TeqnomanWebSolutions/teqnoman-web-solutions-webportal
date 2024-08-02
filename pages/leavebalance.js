import ButtonUi from '@/components/ButtonUi/ButtonUi'
import Layout from '@/components/Layout/Layout'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import DataTable from 'react-data-table-component'
const leaveData = [
    { first_name: "harsh", last_name: "Patel", emp_id: "00001", remaining_cl: "13", sl: "1", total_cl: "16", },
]

export default function LeaveBalance() {

    const leaves = [
        {
            name: "Name", selector: (row) => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: 'pointer' }} onClick={() => modifyLeave(row)}>
                    <Image src={row.image || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} style={{ marginRight: "10px" }} />
                    {row.first_name + " " + row.last_name}
                </div>
            ),
            wrap: true,
            grow: 1.8,
        },
        { name: "Emp.ID", selector: (row) => `${row.emp_id}`, },
        { name: "Remaining CL", selector: (row) => `${row.remaining_cl}`, },
        { name: "SL hours", selector: (row) => `${row.sl}`, },
        { name: "Total CL", selector: (row) => `${row.total_cl}`, },
    ];

    return (<>
        <Head>
            <title>Portal || Leave balance</title>
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
            <h2 className='page-title'>Leave Balance</h2>
            <DataTable columns={leaves} data={leaveData} />
        </Layout>
    </>)
}
