import React, { useState, useEffect } from "react";
import styles from "./WorkingDays.module.scss";
import Image from "next/image";

const WorkingDays = ({ label, holidays }) => {

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleMonthChange = (increment) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  function getDaysInMonth(month, year) {
    month--;
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
      var tmpDate = new Date(date);
      var weekDay = tmpDate.getDay();
      var day = tmpDate.getDate();
      if (weekDay % 6) {
        days.push(day);
      }
      date.setDate(date.getDate() + 1);
    }
    return days.length;
  }

  const calculateWorkingDays = () => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    let workingDays = getDaysInMonth(currentMonth.getMonth() + 1, currentMonth.getFullYear())
    if (firstDay === 0) workingDays -= 1;

    const uniqueHolidays = new Set();
    const totalHolidays = new Set();

    holidays.forEach((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);

      if (
        holidayDate.getFullYear() === currentMonth.getFullYear() &&
        holidayDate.getMonth() === currentMonth.getMonth() &&
        holidayDate.getDay() !== 6 &&
        holidayDate.getDay() !== 0
      ) {
        uniqueHolidays.add(holidayDate.toDateString());
      }
    });

    holidays.forEach((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      if (
        holidayDate.getFullYear() === currentMonth.getFullYear() &&
        holidayDate.getMonth() === currentMonth.getMonth()
      ) {
        totalHolidays.add(holidayDate.toDateString());
      }
    });
    const holidayCount = uniqueHolidays.size;
    return { workingDays, holidayCount, totalHolidays: totalHolidays.size };
  };

  const totaldays = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const { workingDays, holidayCount, totalHolidays } = calculateWorkingDays();

  return (<>
    {label && (<div className={styles.tableheading}><p>{label}</p></div>)}
    <div className={styles.workingDays}>
      <div className={`box ${styles.workingBox}`}>
        <div className={styles.month}>
          <p className={styles.monthName}>
            {" "}
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
            }).format(currentMonth).split(" ").join(", ")}
          </p>
          <div className={styles.changebtns}>
            <div onClick={() => handleMonthChange(-1)} className={styles.btn}>
              <Image src="/images/left-arrow.svg" alt="left-arrow" width={4} height={8} />
            </div>
            <div onClick={() => handleMonthChange(1)} className={styles.btn}>
              <Image src="/images/right-arrow.svg" alt="right-arrow" width={4} height={8} />
            </div>
          </div>
        </div>
        <div className={styles.daysRow}>
          <div className={styles.days}>
            <div className={`box ${styles.dayBox}`}>{totaldays}</div>
            <div className={styles.totalDays}>Total Days</div>
          </div>
          <div className={styles.days}>
            <div className={`box ${styles.dayBox}`}>{workingDays - holidayCount}</div>
            <div className={styles.totalDays}>Working Days</div>
          </div>
          <div className={styles.days}>
            <div className={`box ${styles.dayBox}`}>{totalHolidays}</div>
            <div className={styles.totalDays}>Holidays</div>
          </div>
        </div>
      </div>
    </div>
  </>);
};

export default WorkingDays;
