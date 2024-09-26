import ButtonUi from "@/components/ButtonUi/ButtonUi";
import Layout from "@/components/Layout/Layout";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import styles from "/styles/holidays.module.scss";
import moment from "moment";
import { instance } from "@/utils/Apiconfig";
import Image from "next/image";

export default function Holidays({ holidaysData }) {

    const [holidayList, setHolidayList] = useState(holidaysData)
    const [deleteModal, setDeleteModal] = useState([false, null])
    const [showModal, setShowModal] = useState(null);
    const [editHolidayData, setEditHolidayData] = useState({ holiday_name: '', holiday_date: '' });
    const [reload, setReload] = useState(0)

    useEffect(() => {
        const getHolidays = async () => {
            const response = await instance.get("/api/holidays")
            if (response.data) {
                setHolidayList(response.data)
            }
        }
        if (reload !== 0) {
            getHolidays()
        }
    }, [reload])

    const clearData = () => {
        setDeleteModal([false, null])
        setEditHolidayData(null)
        setShowModal(null)
    }

    const removeHoliday = async (id) => {
        if (id) {
            const remove = await instance.delete(`/api/holidays?id=${id}`).then(res => {
                setHolidayList(holidayList.filter(d => d._id !== id))
                clearData()
            })
        }
    }

    const onChangeHandler = (e) => {
        const { value, name } = e.target;
        setEditHolidayData((prevHoliday) => ({
            ...prevHoliday,
            [name]: value,
        }));
    };

    const submitHandler = async () => {
        const { holiday_name, holiday_date } = editHolidayData
        if (showModal === "edit") {
            const newDate = new Date(holiday_date);
            const update = await instance.put(`/api/holidays?id=${editHolidayData._id}`, { holiday_name, holiday_date: newDate }).then(res => {
                setReload(reload + 1)
                clearData()
            })
        }
        if (showModal === "add") {
            const newDate = new Date(holiday_date);
            const update = await instance.post(`/api/holidays`, { holiday_name, holiday_date: newDate }).then(res => {
                setReload(reload + 1)
                clearData()
            })
        }
    }

    const holidays = [
        { name: "No.", selector: (_, index) => `${(index + 1).toString().padStart(2, '0')}`, grow: 0.3 },
        { name: "Holiday Name", selector: (row) => `${row.holiday_name}`, wrap: true },
        { name: "Date", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('DD/MM/YYYY'), sortable: true },
        { name: "Day", selector: (row) => moment(row.holiday_date, 'YYYY-MM-DD').format('dddd'), },
        {
            name: "Action", selector: (row) => {
                return (<>
                    <div className={styles.action}>
                        <div className={styles.delete} onClick={() => setDeleteModal([true, row._id])}>
                            <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
                        </div>
                        <div className={styles.edit} onClick={() => { setEditHolidayData(row); setShowModal("edit") }}>
                            <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
                        </div>
                    </div>
                </>)
            },
            grow: 1.5,
        },
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
            <div className={styles.head}>
                <h2 className="page-title">holidays</h2>
                <ButtonUi cssClass="btnuiRounded" text="Add Holiday" callBack={() => setShowModal("add")} />
            </div>
            <DataTable columns={holidays} data={holidayList} fixedHeader pagination />
            {deleteModal[0] && (<Modal show={deleteModal[0]} className="holiday-modal" centered onHide={clearData}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Remove Holiday
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className={styles.remove}>Are you sure you want to Remove Holiday?</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                    <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={() => removeHoliday(deleteModal[1])} />
                </Modal.Footer>
            </Modal>)}
            {showModal && (<Modal show={showModal} centered className="holiday-modal" onHide={clearData}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showModal === "edit" ? "Edit Holiday" : "Add Holiday"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className='form_control'>
                                <label className="custom-label">Holiday Name</label>
                                <input
                                    className="custom-input"
                                    type="text"
                                    placeholder="Enter Holiday Name"
                                    value={editHolidayData ? editHolidayData.holiday_name : ''}
                                    onChange={onChangeHandler}
                                    name="holiday_name"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className="form_control">
                                <label className="custom-label">Date</label>
                                <input
                                    type="date"
                                    className="custom-input"
                                    value={editHolidayData ? moment(editHolidayData.holiday_date, 'YYYY-MM-DD').format('YYYY-MM-DD') : ''}
                                    onChange={onChangeHandler}
                                    name="holiday_date"
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                    <ButtonUi cssClass='btnuiRounded' text={showModal === "edit" ? "Save Changes" : "Add Holiday"}
                        callBack={submitHandler} />
                </Modal.Footer>
            </Modal>)}
        </Layout>
    </>);
}

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
        { key: 'holidaysData', endpoint: '/api/holidays' }
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