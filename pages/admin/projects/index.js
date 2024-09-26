import React, { useEffect, useState } from 'react'
import styles from "../../../styles/project.module.scss";
import Layout from '@/components/Layout/Layout';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import { Dropdown } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { useRouter } from 'next/router';
import { instance } from '@/utils/Apiconfig';
import moment from 'moment';
import Head from 'next/head';

export default function Project({ projects }) {

    const handleCheckboxClick = (event) => {
        event.stopPropagation();
    };
    const [start_date, setStartDate] = useState("")
    const [end_date, setEnd_date] = useState("")
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedStatus, setSelectedStatus] = useState([])
    const [sortBy, setSortBy] = useState(null)
    const [filteredProject, setFilteredProject] = useState(projects)
    const projectTypes = ["All", "Wordpress", "Graphic Design", "UI/UX", "Frontend Development", "Web Development", "React JS", "Next JS"]
    const statusList = ["Todo", , "Completed", "In-Progress", "Hold"]
    const router = useRouter();

    const changeFilter = (e, stateSetter) => {
        const { value, checked } = e.target;
        stateSetter((prev) => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter((d) => d !== value);
            }
        });
    };
    const clearFilter = () => {
        setSortBy(null)
        setStartDate("")
        setEnd_date("")
    }
    useEffect(() => {
        setFilteredProject(projects.filter(d => {
            if (selectedTypes.includes('All') || selectedTypes.length === 0) {
                return true
            }
            else {
                if (selectedTypes.includes(d.type)) {
                    return true
                }
            }
        }).filter(d => {
            if (selectedStatus.length === 0) {
                return true
            } else {
                if (selectedStatus.includes(d.status)) {
                    return true
                }
            }
        }).filter(d => {
            if (sortBy !== null) {
                if (sortBy === "custom") {
                    if (start_date && end_date) {
                        const startDate = moment(start_date);
                        const endDate = moment(end_date).endOf('day');
                        const projectDate = moment(d.start_date);
                        return projectDate.isBetween(startDate, endDate, null, '[]');
                    } else {
                        return false;
                    }
                } else {
                    setStartDate("")
                    setEnd_date("")
                    const currentDate = moment();
                    const projectDate = moment(d.start_date);

                    if (sortBy === 'thisweek') {
                        return projectDate.isSame(currentDate, 'week');
                    } else if (sortBy === 'lastweek') {
                        return projectDate.isSame(currentDate.subtract(1, 'week'), 'week');
                    } else if (sortBy === 'thismonth') {
                        return projectDate.isSame(currentDate, 'month');
                    } else {
                        return true
                    }
                }

            }
            else {
                return true
            }
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date)))
    }, [selectedTypes, selectedStatus, sortBy, start_date, end_date])

    return (<>
        <Head>
            <title>Portal || Projects</title>
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
            <div className={styles.projectCard}>
                <div className='filter-sorting'>
                    <h2 className='page-title'>Projects</h2>
                    <div className='dropdown-list'>
                        <div className={styles.type}>
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic">Project type</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <p className='listName'>Project type</p>
                                    {projectTypes.map((type, index) => (
                                        <Dropdown.Item key={index} href="#">
                                            <div onClick={handleCheckboxClick} className={styles.dropList}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkBox}
                                                    id={`${type}`}
                                                    name={type}
                                                    value={type}
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={(e) => changeFilter(e, setSelectedTypes)}
                                                />
                                                <label htmlFor={type} className={styles.addressCheck}>
                                                    {type}
                                                </label>
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className={styles.type}>
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic">Status</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <p className='listName'>Status</p>
                                    {statusList.map((type, index) => (
                                        <Dropdown.Item key={index} href="#">
                                            <div onClick={handleCheckboxClick} className={styles.dropList}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkBox}
                                                    id={`${type}`}
                                                    name={type.toLocaleLowerCase().split("-").join("")}
                                                    value={type.toLocaleLowerCase().split("-").join("")}
                                                    onChange={(e) => changeFilter(e, setSelectedStatus)}
                                                />
                                                <label htmlFor={type} className={styles.addressCheck}>
                                                    {type}
                                                </label>
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className={styles.type}>
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic">Sort by</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <div className={styles['clear-filter']}>
                                        <p className='listName'>Sort by</p>
                                        <p className={styles.clear + ' listName'} onClick={clearFilter}>Clear Filter</p>
                                    </div>
                                    <Dropdown.Item onClick={() => setSortBy('thisweek')}>This week</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setSortBy('lastweek')}>Last week</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setSortBy('thismonth')}>This month</Dropdown.Item>
                                    <Dropdown.Item >Custom date
                                        <div className='selectDate' onClick={handleCheckboxClick}>
                                            <div className='form'>
                                                <label className='custom-label labelName'>From</label>
                                                <input type='date' className='custom-input' onChange={(e) => {
                                                    setSortBy("custom")
                                                    setStartDate(e.target.value)
                                                }}
                                                    value={start_date}
                                                />
                                            </div>
                                            <div className='form'>
                                                <label className='custom-label labelName'>To</label>
                                                <input type='date' className='custom-input' onChange={(e) => {
                                                    setSortBy("custom")
                                                    setEnd_date(e.target.value)
                                                }}
                                                    value={end_date}
                                                />
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <ButtonUi cssClass='btnuiRounded' text="Add Project" callBack={() => router.push('projects/addproject')} />
                    </div>
                </div>
                <div className='row'>
                    {filteredProject.length === 0 && <p style={{ textAlign: "center" }}>No Projects Found</p>}
                    {filteredProject.map((proj, key) => (<>
                        <div className="col-lg-4 col-md-6" key={key}>
                            <div className={styles.projectWrap} onClick={() => router.push(`projects/${proj._id}`)}>
                                <ProjectCard
                                    name={proj.name}
                                    department={proj.type}
                                    description={proj.description}
                                    badge={proj.status}
                                    startDate={proj.start_date}
                                    endDate={proj.end_date}
                                    users={proj.employee_data}
                                />
                            </div>
                        </div>
                    </>))}
                </div>
            </div>
        </Layout >
    </>)
}

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoint = '/api/projects';

    try {
        const response = await instance.get(`${baseUrl}${apiEndpoint}`);
        const data = { projects: response.data.filter(d => d.is_deleted !== true) };
        return { props: data };
    } catch (error) {
        console.log(`Error fetching projects:`, error);
        return { props: { projects: null } };
    }
}