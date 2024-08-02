import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../styles/job.module.scss";
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import moment from 'moment';

export default function Contactinquiry({ NewsData }) {

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(NewsData || []);
    const deleteModal = (id) => {
        setShowModal([true, id]);
    };

    const deletenews = async () => {
        const id = showModal[1]
        setShowModal([false, null]);
        const remove = await instance.delete(`/api/newsletter?id=${id}`).then(res => {
            setFormData(formData.filter(d => d._id !== id))
            setShowModal([false, null]);
        })
    };

    const clearData = () => {
        setShowModal([false, null]);
    }

    const contactInquiry = [
        { name: "No.", selector: (_, index) => index + 1, grow: 0.5 },
        { name: "Email", selector: (row) => `${row.email}`, wrap: true },
        { name: "Date", selector: (row) => moment(row.date, 'DD/MM/YYYY ').format('DD-MM-YYYY'), sortable: true },
        {
            name: "Action", selector: (row) => {
                return (<>
                    <div className={styles.buttons}>
                        <button className={`btn ${styles.viewBtn}`} onClick={() => { deleteModal(row._id); }}>
                            <Image src="/images/delete-icon.svg" alt="icon" width={15} height={18} />
                        </button>
                    </div>
                </>);
            },
        },
    ];

    return (<>
        <Head>
            <title>Portal || Newsletter</title>
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
            <h2 className="page-title">Newsletter</h2>
            <DataTable columns={contactInquiry} data={formData} fixedHeader pagination sortable />
            <Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Delete Job
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className={styles.remove}>Are you sure you want to Delete this newsletter?</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                    <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deletenews} />
                </Modal.Footer>
            </Modal>
        </Layout>
    </>)
}

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
        { key: 'NewsData', endpoint: '/api/newsletter' }
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
