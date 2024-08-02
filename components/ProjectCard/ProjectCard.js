import React from 'react'
import styles from "../ProjectCard/ProjectCard.module.scss"
import moment from 'moment';

export default function ProjectCard(props) {

    const { name, department, badge, description, startDate, endDate, link, users = [] } = props;

    const checkbadge = (key) => {
        switch (key) {
            case 'completed':
                return 'badge-completed'

            case 'inprogress':
                return 'badge-inprogress'

            case 'todo':
                return 'badge-todo'

            case 'hold':
                return 'badge-hold'

            default:
                return 'Completed'
        }
    }

    return (<>
        <div className={styles.projBox}>
            <div className={styles.project}>
                <div className={styles.head}>
                    <div className={styles.leftheading}>
                        <h3 className={styles.heading}>{name || 'heading'}</h3>
                        <span className={styles.department}>{department || 'department'}</span>
                    </div>
                    <div className={styles.rightheading}>
                        <span className={`badge ${checkbadge(badge)}`}>{badge || 'badge'}</span>
                    </div>
                </div>
                <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }}></div>
                <div className={styles.projectdate}>
                    <div className={styles.startDate}>
                        <p>Start Date</p>
                        <span>{moment(startDate).format('DD/MM/YYYY') || 'startDate'}</span>
                    </div>
                    <div className={styles.startDate}>
                        <p>End Date</p>
                        <span>{moment(endDate).format('DD/MM/YYYY') || 'endDate'}</span>
                    </div>
                    <div className={styles.projectmember}>
                        {users.length === 0 && <p className={styles.nomembers}>No Members Joined Yet!</p>}
                        {users.slice(0, 4).map((user, index) => {
                            return (
                                <img key={index} src={user.employee_profile || "/images/dummy-profile.png"} className={styles.member} alt={user.userName} width={34} height={34} onError={(e) => {
                                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${user.first_name.charAt(0).toUpperCase()}${user.last_name.charAt(0).toUpperCase()}`;
                                }} />
                            )
                        })}{users.length > 4 && <p className={styles.more}>{users.length > 4 ? `${users.length - 4}+` : ''}</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    </>)
}
