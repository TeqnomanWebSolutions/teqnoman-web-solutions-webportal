import Image from "next/image";
import styles from "../styles/events.module.scss";
import Layout from "@/components/Layout/Layout";
import { useRef, useState } from 'react';
import { Dropdown, Modal } from 'react-bootstrap';
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Head from "next/head";
import EventCard, { formattedStartDate } from "@/components/EventCard/EventCard";
import { instance } from "@/utils/Apiconfig";
import { useFormik } from "formik";
import * as yup from "yup";
import { getSession, useSession } from "next-auth/react";
import moment from "moment";

const Events = ({ events }) => {

    const eventParticipants = events || []
    const userID = useSession()?.data?.user?.id
    const [eventsData, setEventsData] = useState(events || [])
    const calendarRef = useRef(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const handleMonthSelect = (selectedMonth) => {
        setSelectedMonth(selectedMonth);
        const currentDate = calendarRef.current.getApi().getDate();
        const newDate = new Date(currentDate.getFullYear(), selectedMonth, 1);
        calendarRef.current.getApi().gotoDate(newDate);
    };
    const fetchevents = async () => {
        const response = await instance.get(`/api/events?employee_id=${userID}`).then(res => {
            setEventsData(res.data)
        })
    }

    const [showTextarea, setShowTextarea] = useState(false);
    const [show, setShow] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [current_status, setCurrentStatus] = useState('pending')
    const handleShow = (eventId) => {
        const selectedEventData = eventsData.find((event) => event._id === eventId);
        const status = selectedEventData.employee_data?.find((user) => user.employee_id === userID)?.participate_status
        setCurrentStatus(status)
        setSelectedEvent(selectedEventData);
        setShow(true);
    };

    const eventAction = async (status) => {
        const eventId = selectedEvent?._id;
        if (status === "approved") {
            const updateStatus = await instance.put(`api/event_participants?event_id=${eventId}&&employee_id=${userID}`, { participate_status: "approved", reject_reason: null }).then(res => {
                fetchevents();
                setShowTextarea(false)
                handleClose()
            })
        }
        if (status === "rejected") {
            setShowTextarea(true)
        }
    };
    const handleClose = () => { setShow(false); setShowTextarea(false); formik.setFieldValue('reject_reason', '') };

    const initialValues = { participate_status: "", reject_reason: null }
    const formik = useFormik({
        initialValues,
        validationSchema: yup.object().shape({
            reject_reason: yup.string().when('participate_status', {
                is: 'rejected',
                then: yup.string().required('Required'),
            }),
        }),
        onSubmit: async (values) => {
            const eventId = selectedEvent?._id;
            const reject_reason = values.reject_reason;
            try {
                const response = await instance.put(`/api/event_participants?event_id=${eventId}&&employee_id=${userID}`, {
                    participate_status: "rejected",
                    reject_reason,
                }).then(res => {
                    fetchevents();
                    handleClose();
                });
            } catch (error) {
                console.error('Error submitting data:', error);
            }
        },
    });
    const { handleSubmit, values, handleBlur, handleChange, touched, errors } = formik

    return (<>
        <Head>
            <title>Portal || Events</title>
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
            <div className="events-page">
                <div>
                    <div className={styles.tabs}>
                        <Tabs className="eventTabs">
                            <div className={styles.header}>
                                <h2 className="page-title">Upcoming Events</h2>
                                <TabList>
                                    <Tab><Image src="/images/grid-view.svg" alt="grid" width={17} height={17} /></Tab>
                                    <Tab><Image src="/images/calender-icon.svg" alt="calendar" width={17} height={18} /></Tab>
                                </TabList>
                            </div>

                            <TabPanel>
                                <div className="row">
                                    {eventsData.length === 0 && <p style={{ textAlign: "center" }}>No Events Found</p>}
                                    {eventsData.sort((a, b) => {
                                        return new Date(a.start_date) - new Date(b.start_date);
                                    }).map((e, key) => {
                                        return (<>
                                            <div onClick={() => handleShow(e._id)} className="col-lg-4 col-md-6 col-12">
                                                <EventCard
                                                    eventName={e.name}
                                                    eventDate={e.start_date}
                                                    eventTime={e.start_time}
                                                    duration={e.duration}
                                                    users={e.employee_data}
                                                    variant='show'
                                                />
                                            </div>
                                        </>)
                                    })
                                    }
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div className={styles.calendar}>
                                    <div className={styles.dropdownAdjust}>
                                        <Dropdown>
                                            <Dropdown.Toggle className="monthDropdown">
                                                {months[selectedMonth]}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {months.map((month, index) => (
                                                    <Dropdown.Item key={index} onClick={() => handleMonthSelect(index)}>
                                                        {month}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[dayGridPlugin]}
                                        initialView="dayGridMonth"
                                        displayEventEnd={true}
                                        timeZone="local"
                                        events={
                                            eventParticipants.map((e) => ({
                                                title: ` ${e.start_time} ${e.name}`,
                                                start: moment(`${e.start_date} `, 'YYYY-MM-DD hh:mm A').format(),
                                                id: e._id
                                            }))
                                        }
                                        eventClick={(arg) => handleShow(arg.event.id)}
                                    />
                                </div>
                            </TabPanel>
                        </Tabs>
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose} className="eventModal">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedEvent?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className={styles.modalHead}>
                        <div className={styles.date}>
                            <p className={styles.heading}>Day / Time</p>
                            <p className={styles.text}>{formattedStartDate(selectedEvent?.start_date)} | {moment(selectedEvent?.start_time, "HH:mm").format('hh:mm A')} </p>
                        </div>
                        <div className={styles.date}>
                            <p className={styles.heading}>Event hours</p>
                            <p className={styles.text}><Image src={"./images/timer-icon.svg"} alt="timer-icon" width={16} height={16} /> {selectedEvent?.duration} hr</p>
                        </div>
                        <div className={styles.date}>
                            <p className={styles.heading}>Total Members</p>
                            <div className={styles.eventMember}>
                                {selectedEvent?.employee_data.length === 0 ? <p>No Members Joined Yet!</p> :
                                    selectedEvent?.employee_data.filter(user => user?.participate_status === "approved").slice(0, 4).map((user, index) => (
                                        <img
                                            key={index}
                                            src={user.employee_profile}
                                            className={styles.member}
                                            alt={user.first_name}
                                            width={34}
                                            height={34}
                                            onError={(e) => {
                                                e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${user.first_name.charAt(0).toUpperCase()}${user.last_name.charAt(0).toUpperCase()}`;
                                            }}
                                        />
                                    ))}
                                {selectedEvent?.employee_data.filter(user => user?.participate_status === "approved").length > 4 && (
                                    <p className={styles.more}>{selectedEvent?.employee_data.filter(user => user?.participate_status === "approved").length - 4}+</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className={styles.heading}>Description</p>
                        <div className="editor-text">
                            <div dangerouslySetInnerHTML={{ __html: selectedEvent?.description }}></div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className={styles.interested}>
                        {current_status !== "approved" && <ButtonUi cssClass="btnuiRounded interest" text="I’m Interested" callBack={() => eventAction('approved')} />}
                        {current_status !== "rejected" && <ButtonUi cssClass="btnuiplain interest" text="I’m not Interested" callBack={() => eventAction('rejected')} />}
                    </div>
                </Modal.Footer>
                {showTextarea && (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.textarea}>
                            <div className="form_control">
                                <label className="custom-label">Reason</label>
                                <textarea name="reject_reason" placeholder='Add description' className={`form-control  custom-input ${touched.reject_reason && errors.reject_reason ? 'border-danger' : ''}`}
                                    id='reject_reason'
                                    value={values.reject_reason}
                                    onChange={handleChange}
                                    onBlur={handleBlur} required />
                                {touched.reject_reason && errors.reject_reason && <div className="invalid-tooltip">{errors?.reject_reason}</div>}
                            </div>
                            <div className={styles.submitBtn}> <ButtonUi type='submit' cssClass="btnuiRounded" text="Submit" /></div>
                        </div>
                    </form>
                )}
            </Modal>
        </Layout>
    </>);
}

export default Events;


export async function getServerSideProps(context) {

    const req = context.req;
    const session = await getSession(context);
    const employee_id = session?.user?.id;
    const baseUrl = req ? `http://${req.headers.host}` : '';
    const apiEndpoints = [
        { key: 'events', endpoint: `/api/events?employee_id=${employee_id}` },
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
