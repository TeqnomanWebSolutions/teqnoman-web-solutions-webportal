import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../styles/inquiry.module.scss";
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useRouter } from 'next/router';
import moment from 'moment';
import { getSession } from 'next-auth/react';

export default function Careerinquiry({ leadsList }) {
  const [leads, setLeads] = useState(leadsList || []);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const careerInquiry = [
    { name: "Client Name", selector: (row) => `${row.client_name}`, wrap: true },
    { name: "Client Email", selector: (row) => `${row.client_email}`, wrap: true },
    { name: "Phone", selector: (row) => `${row.client_phone}`, wrap: true },
    { name: "Project name", selector: (row) => `${row.project_name}`, },
    { name: "Type", selector: (row) => `${row.project_type}`, sortable: true, wrap: true },
    { name: "Inquiry Date", selector: (row) => `${moment(row.inquiry_date).format("DD-MM-YYYY")}`, sortable: true, wrap: true },
    { name: "Created Date", selector: (row) => `${moment(row.created_date).format("DD-MM-YYYY")}`, sortable: true, wrap: true },
    {
      name: "Action", selector: (row) => {
        return (<>
          <div>
            <button className="btn" title='View Lead' onClick={() => router.push(`/leads/${row._id}`)}><Image src="/images/view-icon.svg" alt="icon" width={15} height={18} /></button>
          </div>
        </>);
      },
      grow: 0.2
    },
  ];

  const handleRemoveInquiry = async () => {
    await instance.delete(`/api/leads?id=${showModal}`);
    let res = await instance.get("/api/leads");
    if (res.data) {
      setLeads(res.data);
    }
    setShowModal(false);
  }

  return (<>
    <Head>
      <title>Portal || Career Inquiry</title>
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
      <div className='d-flex justify-content-between mb-4'>
        <h2 className="page-title">Leads</h2>
      </div>

      <DataTable columns={careerInquiry} data={leads || []} fixedHeader pagination sortable />
      {showModal && (<Modal show={showModal} className="holiday-modal" centered onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete Lead
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={styles.remove}>Are you sure you want to Delete Lead?</p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={() => setShowModal(false)} />
          <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={() => handleRemoveInquiry()} />
        </Modal.Footer>
      </Modal>)}
    </Layout>
  </>)
}

export async function getServerSideProps(context) {
  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const session = await getSession(context);
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  let result = await instance.get(`${baseUrl}/api/leads?uid=${session.user.id}`);

  return {
    props: {
      leadsList: result && result.data
    }
  }
}
