import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../../styles/inquiry.module.scss";
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';

export default function Careerinquiry({ careerData }) {

  const [showModal, setShowModal] = useState(false);
  const [viewInquiry, setViewInquiry] = useState(false)
  const [careerContacts, setCareerContacts] = useState(careerData || []);
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

  const handleRemoveInquiry = async () => {
    if (selectedRowId) {
      try {
        console.log(careerContacts);
        let data = careerContacts.filter(d => d._id === selectedRowId)[0];
        if (data && data.length != 0) {
          let params = Object.fromEntries(new URLSearchParams(data.file));
          let fileName = params.fileName;
          await instance.delete(`https://files.teqnomanweb.com/media?path=resumes&fileName=${fileName}`);
          await instance.delete(`/api/career?id=${selectedRowId}`);
          setCareerContacts(careerContacts.filter(d => d._id !== selectedRowId));
        }
        clearData();
      } catch (error) {
        console.error("Error removing inquiry:", error);
      }
    }
  };

  const handleViewModal = (rowData) => {
    setSelectedRowData(rowData);
    setViewInquiry(!viewInquiry);
  };


  const careerInquiry = [
    { name: "Name", selector: (row) => `${row.firstName} ${row.lastName}`, wrap: true },
    { name: "Email", selector: (row) => `${row.email}`, wrap: true },
    { name: "Designation", selector: (row) => `${row.jobslug}`, wrap: true },
    { name: "Phone number", selector: (row) => `${row.phone}`, },
    { name: "Date", selector: (row) => `${row.date}`, sortable: true, wrap: true },
    {
      name: "Resume", selector: (row) => {
        return (<>
          <div>
            <button className={`btn ${styles.pdfBtn}`} onClick={() => handleViewModal(row)}>
              <Image src="/images/pdf.svg" alt="icon" width={14} height={18} />
              PDF
            </button>
          </div>
        </>);
      },
      grow: 0.2
    },
    {
      name: "Action", selector: (row) => {
        return (<>
          <div>
            <button className="btn" onClick={() => handleModalToggle(row._id)}>
              <Image src="/images/delete-icon.svg" alt="icon" width={15} height={18} /></button>
          </div>
        </>);
      },
      grow: 0.2
    },
  ];
  const data = {
    career: [
      { name: "Harsh patel", email: "Terrence36@hotmail.com", phone: "932-752-5702", date: "14/01/2023", designation: "UI/UX Designer" },
      { name: "Victor patel", email: "victor@hotmail.com", phone: "932-752-5702", date: "14/01/2023", designation: "UI/UX Designer" },
    ],
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
      <h2 className="page-title">Career inquires</h2>
      <DataTable columns={careerInquiry} data={careerContacts || []} fixedHeader pagination sortable />
      {showModal && (<Modal show={showModal} className="holiday-modal" centered onHide={handleModalToggle}>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete career inquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={styles.remove}>Are you sure you want to Delete career inquiry?</p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
          <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={() => handleRemoveInquiry(selectedRowId)} />
        </Modal.Footer>
      </Modal>)}
      {viewInquiry && (<Modal show={viewInquiry} centered className="career-modal" onHide={handleViewModal}>
        <Modal.Header closeButton>
        </Modal.Header>
        <div className={styles.modalHead}>
          <div>
            <h3>{selectedRowData.firstName} {selectedRowData.lastName}</h3>
            <p>{selectedRowData.jobslug}</p>
          </div>
          <a href={`${selectedRowData.file}`} target='blank' download={`${selectedRowData.firstName}_${selectedRowData.lastName}_resume.pdf`}>
            <ButtonUi cssClass="btnuiRounded" text="Download" />
          </a>
        </div>
        <Modal.Body>
          <div className={styles.iframeImage}>
            <iframe src={`${selectedRowData.file}`} width="100%" height="800px" title="PDF viewer" />
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
    { key: 'careerData', endpoint: '/api/career' }
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
