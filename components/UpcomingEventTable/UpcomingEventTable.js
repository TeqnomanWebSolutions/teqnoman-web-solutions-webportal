import React from "react";
import styles from "./UpcomingEventTable.module.scss";
import Image from "next/image";

export default function UpcomingEventTable({ events, day, time }) {

  const eventName = events || "Designer’s Team Meeting";
  const eventDay = day || "Today | 11:00 am";
  const eventTime = time || "1 hr";

  return (<>
    <div className={styles.eventTable}>
      <div className={styles.event}>
        <div className={styles.eventDiv}>
          <Image src={"/images/event.svg"} width={20} height={20} alt="eventicon" />
          <div className={styles.eventName}>{eventName}</div>
        </div>
        <div className={styles.eventDay}>{eventDay}</div>
      </div>
      <div className={styles.eventDiv}>
        <Image src={"/images/timer.svg"} width={16} height={16} alt="timericon" />
        <div className={styles.eventTime}>{eventTime}</div>
      </div>
    </div>
  </>);
}
