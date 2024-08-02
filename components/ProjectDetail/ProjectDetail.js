import React from 'react'
import styles from "../ProjectDetail/ProjectDetail.module.scss"
import FileThumbnail from '../FileThumbnail/FileThumbnail'
export default function ProjectDetail({ name, department, badge, start_date, end_date, users = [], description, fileDownloads }) {

    const getFileName = (file) => {
        let slices = file.split("/");
        return slices[slices.length - 1]
    }

    return (<>
        <div className={styles.detailPage}>
            <div className={styles.projectDetail}>
                <div className={styles.projectName}>
                    <h3 className={styles.name}>{name}</h3>
                    <p className={styles.department}>{department}</p>
                </div>
                <div className={styles.status}>
                    <p className={"badge badge-" + badge}>{badge}</p>
                </div>
            </div>
            <div className={styles.projectDuration}>
                <div className={styles.DateRange}>
                    <p className={styles.title}>Start Date</p>
                    <p className={styles.Date}>{start_date}</p>
                </div>
                <div className={styles.DateRange}>
                    <p className={styles.title}>End Date</p>
                    <p className={styles.Date}>{end_date}</p>
                </div>
                <div>
                    <p className={styles.totalMember}>Total Members</p>
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

            <p className={styles.heading}>Description</p>
            <div className='project-desc'>
                <div dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
            <p className={styles.attchamentHeading}>Attachment</p>
            {fileDownloads.length == 0 && (<p className={styles.nomembers}>No attachments!</p>)}
            <div className={styles.fileDownload}>
                {fileDownloads.map((file, index) => (
                    <div className={styles.flexFile} key={`ProjectFiles${index}`}>
                        <a className={styles.file} target='_blank' href={file}>
                            <img src='/images/download.png' className={styles.icon1} />
                            <FileThumbnail height={24} width={25} className={styles.icon} name={file} />
                            <p>{getFileName(file)}</p>
                        </a>
                    </div>))}
            </div>
        </div>
    </>)
}
