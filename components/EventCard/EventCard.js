import React from 'react'
import styles from "./EventCard.module.scss"
import Image from 'next/image'
import moment from 'moment';

export function formattedStartDate(startDate) {

    const inputDate = moment(startDate);
    const today = moment();
    const tomorrow = moment().add(1, 'day');

    if (inputDate.isSame(today, 'day')) {
        return 'Today';
    } else if (inputDate.isSame(tomorrow, 'day')) {
        return 'Tomorrow';
    } else {
        return inputDate.format('DD MMM, YYYY');
    }
}

export default function EventCard({ variant, eventName, eventDate, eventTime, duration, users = [] }) {

    const event_name = eventName || 'Celebration';
    const event_time = eventTime || '05:00 AM';
    const duration_time = duration || '2 hr'
    const eventTimeOfDay = moment(event_time, "HH:mm").format('hh:mm A')

    return (<>
        <div className={styles.eventCard} >
            <div className={styles.head}>
                <div className={styles.title}>
                    <div>
                        <Image src={"/images/calender-icon.svg"} alt="calender-icon" width={20} height={22} />
                    </div>
                    <h2>{event_name}</h2>
                </div>
                <div className={`${styles.time} + ${styles[variant]}`}>
                    <Image src={"/images/timer-icon.svg"} alt="timer-icon" width={16} height={16} />
                    <p>{duration_time} hr</p>
                </div>
            </div>
            <div className={styles.eventDate}>
                <p>{formattedStartDate(eventDate)} | {eventTimeOfDay}</p>
                <div className={styles.eventMember}>
                    {users.filter((user) => user.participate_status === "approved").length === 0 && <p>No Members Joined Yet!</p>}
                    {users.filter((user) => user.participate_status === "approved").slice(0, 4).map((user, index) => (
                        <img
                            key={index}
                            src={user.employee_profile}
                            className={styles.member}
                            alt={user.first_name}
                            width={34}
                            height={34}
                            onError={(e) => {
                                e.target.src = `https://placehold.co/100x100/ff701f/fff?text=${user.first_name.charAt(0).toUpperCase()}${user.last_name.charAt(0).toUpperCase()}`;
                            }}
                        />
                    ))}{users.filter((user) => user.participate_status === "approved").length > 4 && <p className={styles.more}>{users.filter((user) => user.participate_status === "approved").length > 4 ? `${users.length - 4}+` : ''}
                    </p>}
                </div>
            </div>
        </div>
    </>)
}
