import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../../styles/inquiry.module.scss";
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';

export default function Contactinquiry({ contactData }) {

  const [showModal, setShowModal] = useState(false);
  const [viewInquiry, setViewInquiry] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(contactData || []);
  const [selectedRowData, setSelectedRowData] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(null);

  const handleModalToggle = (rowId) => {
    setSelectedRowId(rowId);
    setShowModal(!showModal);
  };

  const clearData = () => {
    setShowModal(false);
    setSelectedRowData({});
    setSelectedRowId(null);
  };

  const handleRemoveInquiry = async (selectedRowId) => {
    if (selectedRowId) {
      const remove = await instance.delete(`/api/contactData?id=${selectedRowId}`).then(res => {
        setSelectedInquiry(selectedInquiry.filter(d => d._id !== selectedRowId))
        clearData()
      })
    }
  }

  const handleViewModal = (rowData) => {
    setSelectedRowData(rowData);
    setViewInquiry(!viewInquiry);
  };

  const contactInquiry = [
    { name: "No.", selector: (_, index) => index + 1, grow: 0.2 },
    { name: "Name", selector: (row) => `${row.name}`, grow: 0.8, wrap: true },
    { name: "Email", selector: (row) => `${row.email}`, wrap: true },
    { name: "Phone number", selector: (row) => `${row.phone}`, grow: 0.5 },
    { name: "Date", selector: (row) => `${row.date}`, sortable: true, wrap: true },
    { name: "Project type", selector: (row) => `${row.projectType}`, wrap: true },
    {
      name: "Action", selector: (row) => {
        return (<>
          <div className={styles.buttons}>
            <button className={`btn ${styles.viewBtn}`} onClick={() => handleViewModal(row)}>
              <Image src="/images/eye-icon.svg" width={13} height={8} /> View
            </button>
            <button className={`btn ${styles.viewBtn}`} onClick={() => handleModalToggle(row._id)}>
              <Image src="/images/delete-icon.svg" alt="icon" width={15} height={18} />
            </button>
          </div>
        </>);
      },
    },

  ];

  return (<>
    <Head>
      <title>Portal || Contact Inquiry</title>
      <link rel="canonical" href="" />
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
      <h2 className="page-title">Contact inquires</h2>
      <DataTable columns={contactInquiry} data={selectedInquiry} fixedHeader pagination sortable />
      {showModal && (<Modal show={showModal} className="holiday-modal" centered onHide={handleModalToggle}>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete Contact inquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={styles.remove}>Are you sure you want to Delete contact inquiry?</p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
          <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={() => handleRemoveInquiry(selectedRowId)} />
        </Modal.Footer>
      </Modal>)}
      {viewInquiry && (<Modal show={viewInquiry} centered className="holiday-modal" onHide={handleViewModal}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Inquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-lg-6 col-md-6 col-12">
              <div className='form_control'>
                <label className="custom-label">Name</label>
                <input
                  className="custom-input"
                  type="text"
                  placeholder="Enter Holiday Name"
                  value={selectedRowData.name}
                  readOnly
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="form_control">
                <label className="custom-label">Email</label>
                <input
                  type="email"
                  className="custom-input"
                  value={selectedRowData.email}
                  readOnly
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="form_control">
                <label className="custom-label">Phone no</label>
                <input
                  type="tel"
                  className="custom-input"
                  readOnly
                  value={selectedRowData.phone}
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="form_control">
                <label className="custom-label">Project type</label>
                <input
                  type="text"
                  className="custom-input"
                  value={selectedRowData.projectType}
                  readOnly
                />
              </div>
            </div>
            <div className="col-lg-12 col-md-12 col-12">
              <div className="form_control">
                <label className="custom-label">Project details</label>
                <textarea
                  className="custom-input"
                  value={selectedRowData.message}
                  readOnly
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>)}
    </Layout>
  </>)
}

export async function getServerSideProps(context) {

  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  const apiEndpoints = [
    { key: 'contactData', endpoint: '/api/contactData' }
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
    console.log('Some errors occurred while fetching data.');
    return { props: { ...data } };
  } else {
    return { props: data };
  }
}
