import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../../styles/job.module.scss";
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function JobsList({ data }) {

    const router = useRouter()
    const [jobData, setJobData] = useState(data || []);
    const [showModal, setShowModal] = useState([false, null]);

    const deleteModal = (id) => {
        setShowModal([true, id]);
    };

    const deleteJob = async () => {
        const id = showModal[1]
        setShowModal([false, null]);
        const remove = await instance.delete(`/api/jobs?id=${id}`).then(res => {
            setJobData(jobData.filter(d => d._id !== id))
            setShowModal([false, null]);
        })
    };

    const clearData = () => {
        setShowModal([false, null]);
    }

    const updateJob = async (id, status) => {
        const update = await instance.put(`/api/jobs?id=${id}`, { status: status }).then(res => {
            instance.get(`/api/jobs`).then(res => {
                toast.success(`Job ${status} Successfully`)
                setJobData(res.data)
            })
        })
    }

    const columns = [
        { name: 'Job Title', selector: row => row.jobtitle, grow: 0.8, wrap: true, },
        { name: 'Experience', selector: row => row.experience, grow: 0.6 },
        { name: 'Positions', selector: row => row.positions, grow: 0.5, },
        { name: 'Location', selector: row => row.location, grow: 1, wrap: true },
        { name: 'Work Type', selector: row => row.worktype, grow: 0.5 },
        { name: 'Job Slug', selector: row => row.jobslug, grow: 0.8, wrap: true },
        { name: 'Status', selector: row => row.status, grow: 0.5, wrap: true, },
        {
            name: "Action", selector: (row) => (<>
                <div className={styles.action}>
                    <div className={styles.delete} onClick={() => { deleteModal(row._id); }} style={{ "cursor": "pointer" }}>
                        <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
                    </div>
                    <div className={styles.edit}>
                        <Link href={`jobs/${row._id}`}>
                            <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
                        </Link>
                    </div>
                    <div className={styles.delete}>
                        <ButtonUi
                            cssClass="btnuiRounded button-padding"
                            callBack={() => updateJob(row._id, row.status === "open" ? "close" : "open")}
                            text={row.status === "open" ? (<><span>Close</span></>) : (<><span>Open</span></>)} />
                    </div>
                </div>
            </>),
            grow: 1.2,
        },
    ];

    return (<>
        <Head>
            <title>Portal || Jobs</title>
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
            <div className={styles.head}>
                <h2 className="page-title">Job List</h2>
                <ButtonUi cssClass="btnuiRounded" text="Add Job" callBack={() => router.push('/admin/jobs/addjob')} />
            </div>
            <DataTable columns={columns} data={jobData} pagination responsive />
            <Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Delete Job
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className={styles.remove}>Are you sure you want to Delete Job?</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                    <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deleteJob} />
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
        { key: 'data', endpoint: '/api/jobs' }
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