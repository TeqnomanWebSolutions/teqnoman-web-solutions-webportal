import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout';
import Head from 'next/head';
import Image from 'next/image';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../../styles/job.module.scss";
import moment from 'moment';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { instance } from '@/utils/Apiconfig';
import { toast } from 'react-toastify';

export default function Portfolio({ portfolio }) {

    const [list, setList] = useState(portfolio || []);
    const router = useRouter()
    const [showModal, setShowModal] = useState([false, null]);

    const deleteModal = (id) => {
        setShowModal([true, id]);
    };

    const deletePortfolio = async () => {
        const id = showModal[1]
        setShowModal([false, null]);
        const remove = await instance.delete(`/api/portfolio?id=${id}`).then(res => {
            setList(list.filter(d => d._id !== id))
            setShowModal([false, null]);
        })
    };

    const clearData = () => {
        setShowModal([false, null]);
    }

    const changeStatus = async (id, status) => {
        const newStatus = status === 'published' ? 'draft' : 'published';
        const data = await instance.put(`/api/portfolio?id=${id}`, { status: newStatus }).then(res => {
            instance.get(`/api/portfolio`).then(res => {
                toast.success(`Portfolio ${newStatus} successfully`)
                setList(res.data)
            })
        })
    }

    const column = [
        { name: "Order", selector: (row) => `${row.order}`, grow: 0.2 },
        {
            name: "Image", selector: (row) => (
                <div><img src={row.image || "/images/dummy-profile.png"} width={80} height={80} alt={"image"} style={{ borderRadius: '6px', objectFit: "cover" }} /></div>
            ), grow: 0.5
        },
        { name: "Name", selector: (row) => `${row.name}`, wrap: true, grow: 1.8 },
        { name: "Featured", selector: (row) => `${row.featured}`, grow: 0.5 },
        { name: "Status", selector: (row) => `${row.status}`, grow: 0.5 },
        { name: "Created Date", selector: (row) => moment(row.created_date, 'YYYY-MM-DD').format('DD/MM/YYYY'), sortable: true, grow: 0.5 },
        {
            name: "Action", selector: (row) => {
                return (<>
                    <div className={styles.action}>
                        <div className={styles.delete} onClick={() => { deleteModal(row._id); }} style={{ "cursor": "pointer" }}>
                            <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
                        </div>
                        <div className={styles.edit}>
                            <Link href={`portfolio/${row._id}`}>
                                <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
                            </Link>
                        </div>
                        <button className={styles.btn + ' ' + (row.status === 'draft' ? styles.published : styles.draft)}
                            onClick={() => changeStatus(row._id, row.status)}
                        >{
                                row.status === 'published' ? 'Draft' : 'Publish'
                            }</button>

                    </div>
                </>)
            },
            grow: 1.7,
        },
    ];

    return (<>
        <Head>
            <title>Portal || Portfolio</title>
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
            <div className={styles.head}>
                <h2 className="page-title">Portfolio</h2>
                <ButtonUi cssClass="btnuiRounded" text="Add Portfolio" callBack={() => router.push('/admin/portfolio/add-portfolio')} />
            </div>
            <DataTable columns={column} data={list} pagination sortable />
            <Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Remove Post
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className={styles.remove}>Are you sure you want to Remove this Post?</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                    <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deletePortfolio} />
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
        { key: 'portfolio', endpoint: '/api/portfolio' },
    ];

    const data = {};
    let errorOccurred = false;

    for (const api of apiEndpoints) {
        try {
            const response = await instance.get(`${baseUrl}${api.endpoint}`);
            data[api.key] = response.data;
        } catch (error) {
            console.log(`Error fetching ${api.key}:`, error.message);
            errorOccurred = true;
        }
    }

    if (errorOccurred) {
        console.log('error')
        return { props: { ...data } };
    } else {
        return { props: data };
    }
}
