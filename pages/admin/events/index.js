import Image from "next/image";
import styles from "../../../styles/events.module.scss";
import Layout from "@/components/Layout/Layout";
import { useRef, useState } from 'react';
import { Dropdown, Modal } from 'react-bootstrap';
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Head from "next/head";
import Link from "next/link";
import EventCard from "@/components/EventCard/EventCard";
import { instance } from "@/utils/Apiconfig";
import { useRouter } from "next/router";
import moment from "moment";

const Events = ({ eventsData }) => {

    const router = useRouter()
    const calendarRef = useRef(null);
    const eventParticipants = eventsData || [];
    const [showModal, setShowModal] = useState([false, null]);
    const [list, setList] = useState(eventParticipants)

    const deleteModal = (id) => {
        setShowModal([true, id]);
    };

    const clearData = () => {
        setShowModal([false, null]);
    }

    const deleteEvent = async () => {
        const id = showModal[1]
        setShowModal([false, null]);
        const remove = await instance.delete(`/api/events?event_id=${id}`).then(async (res) => {
            setList(list.filter(d => d._id !== id))
            setShowModal([false, null]);
        })
    };

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleMonthSelect = (selectedMonth) => {
        setSelectedMonth(selectedMonth);
        const currentDate = calendarRef.current.getApi().getDate();
        const newDate = new Date(currentDate.getFullYear(), selectedMonth, 1);
        calendarRef.current.getApi().gotoDate(newDate);
    };

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
            <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.svg" />
            <link rel="apple-touch-icon-precomposed" href="/images/favicon.svg" />
            <meta name="title" property="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="image" property="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="author" content="Teqnoman Web Solutions" />
        </Head>
        <Layout>
            <div className={`events-page ${styles.adminEvent}`}>
                <div className={styles.tabs}>
                    <Tabs className="eventTabs">
                        <div className={styles.header}>
                            <h2 className="page-title">Upcoming Events</h2>
                            <div className={styles.tabBtn}>
                                <TabList>
                                    <Tab><Image src="/images/grid-view.svg" alt="grid" width={17} height={17} /></Tab>
                                    <Tab><Image src="/images/calender-icon.svg" alt="calendar" width={17} height={18} /></Tab>
                                </TabList>
                                <ButtonUi cssClass="btnuiRounded" text="Add Event" callBack={() => router.push('/admin/events/addevent')} />
                            </div>
                        </div>
                        <TabPanel>
                            <div className="row">
                                {list.length === 0 && <p style={{ textAlign: "center" }}>No Events Found</p>}
                                {list.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map((e, key) => {
                                    return (<>
                                        <div className={`${styles.events} col-lg-4 col-md-6`} key={key}>
                                            <div className={styles.eventDelete} onClick={() => { deleteModal(e._id); }} style={{ cursor: 'pointer' }}>
                                                <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
                                            </div>
                                            <Link href={`/admin/events/${e._id}`}>
                                                <EventCard
                                                    eventName={e.name}
                                                    eventDate={e.start_date}
                                                    eventTime={e.start_time}
                                                    duration={e.duration}
                                                    image={e.image}
                                                    users={e.employee_data}
                                                />
                                            </Link>
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
                                    displayEventEnd="true"
                                    timeZone="local"
                                    events={
                                        eventParticipants.map((e) => ({
                                            title: `${moment(e.start_time, 'HH:mm').format('hh:mm a')} ${e.name}`,
                                            start: moment(`${e.start_date} `, 'YYYY-MM-DD hh:mm A').format(),
                                            id: e._id
                                        })
                                        )
                                    }
                                    eventClick={(arg) => router.push(`/admin/events/${arg.event.id}`)}
                                />
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>
        </Layout>
        {showModal[0] && (<Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
            <Modal.Header closeButton>
                <Modal.Title>Remove Event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className={styles.remove}>Are you sure you want to Delete this event?</p>
            </Modal.Body>
            <Modal.Footer>
                <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
                <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deleteEvent} />
            </Modal.Footer>
        </Modal>)}
    </>);

}

export default Events;

export async function getServerSideProps(context) {
    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
        { key: 'eventsData', endpoint: '/api/events' },
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
