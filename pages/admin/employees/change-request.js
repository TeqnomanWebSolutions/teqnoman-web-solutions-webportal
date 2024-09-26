import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../../styles/inquiry.module.scss";
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Head from 'next/head';
import { ChangeRequestCard } from '@/components/ChangeRequestCard/ChangeRequestCard';
import { instance } from '@/utils/Apiconfig';

export default function ChangeRequest({ changeRequests }) {
    const [changeList, setChangeList] = useState([]);

    useEffect(() => {
        if (changeRequests) {
            setChangeList(changeRequests);
        }
    }, [])

    async function getChangeRequest() {
        let res = await instance.get(`/api/change_request`);
        setChangeList(res.data)
    }
    return (<>
        <Head>
            <title>Portal || Change Request</title>
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
            <h2 className="page-title">Change Requests</h2>
            {changeList.length != 0 && changeList.map((change, index) => <ChangeRequestCard changes={change} key={index} refreshData={getChangeRequest} />)}
            {changeList.length === 0 && <p>No change found</p>}
        </Layout>
    </>)
}
export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;

    const response = await instance.get(`${baseUrl}/api/change_request`);

    return {
        props: {
            changeRequests: response.data
        }
    };
}