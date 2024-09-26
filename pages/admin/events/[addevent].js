import Layout from '@/components/Layout/Layout'
import React, { useEffect, useRef, useState } from 'react'
import styles from "../../../styles/events.module.scss";
import Image from 'next/image'
import { Editor } from '@tinymce/tinymce-react';
import DataTable from 'react-data-table-component';
import { Dropdown, Modal } from 'react-bootstrap';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { useRouter } from 'next/router';
import { instance } from '@/utils/Apiconfig';
import { useFormik } from 'formik';
import * as yup from "yup";
import Head from 'next/head';
import moment from 'moment';

const EvnetDetails = ({ events, employees }) => {

    const eventsData = events && events[0]
    const participants = eventsData?.employee_data
    const [showModal, setShowModal] = useState(false);
    const [participantModal, setParticipantModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const router = useRouter()
    const getQueryParams = router.query.addevent;
    const editorRef = useRef();
    const [selectedOption, setSelectedOption] = useState([])

    useEffect(() => {
        if (eventsData) {
            delete eventsData._id
            formik.setValues(eventsData)
        }
    }, [getQueryParams])

    const id = router.query.addevent;
    useEffect(() => {
        if (id !== "addevent" && id !== "undefined") {
            formik.setValues({
                ...eventsData,
                start_date: moment(eventsData?.start_date).format('YYYY-MM-DD'),
            })
        }
    }, [id])
    const handleModalToggle = (participant) => {
        setSelectedParticipant(participant);
        setShowModal(!showModal);
    };

    useEffect(() => {
        if (participants) {
            const selected = participants.map(d => {
                return d.employee_id
            })
            setSelectedUser(selected)
        }
    }, [])

    const handleCheckboxClick = (userId) => {
        if (selectedUser.includes(userId)) {
            setSelectedUser(prev => ([...prev.filter(id => id !== userId)]))
        } else {
            setSelectedUser(prev => ([...prev, userId]))
        }
    };

    const handleAddParticipant = () => {
        setParticipantModal(!participantModal)
    }

    const multiselect = (e) => {
        e.stopPropagation();
        const { value, checked } = e.target
        if (!checked) {
            setSelectedOption(selectedOption.filter(prev => prev !== value).filter(prev => prev !== "all"))
        }
        if (value === "all") {
            if (checked) {
                setSelectedUser(employees.map((user) => {
                    return user._id
                }))
                setSelectedOption(['all', 'developers', 'designers', 'girls', 'boys'])
            } else {
                setSelectedOption(prev => selectedOption.filter(prev => prev !== "all"))
            }
        }
        if (value === "designers") {
            if (checked) {
                setSelectedUser(employees
                    .filter(user => user.department === "UI/UX")
                    .map(user => user._id)
                );
                setSelectedOption(prev => [...prev, 'designers'])
            } else {
                setSelectedUser(selectedUser.filter(userId => {
                    const user = employees.find(u => u._id === userId);
                    return user && user.department !== "UI/UX";
                }));
                setSelectedOption(prev => selectedOption.filter(prev => prev !== "designers"))
            }
        }
        if (value === "developers") {
            if (checked) {
                setSelectedUser(employees
                    .filter(user => user.department === "Web Development")
                    .map(user => user._id)
                );
                setSelectedOption(prev => [...prev, 'developers'])
            } else {
                setSelectedUser(selectedUser.filter(userId => {
                    const user = employees.find(u => u._id === userId);
                    return user && user.department !== "Web Development";
                }));
                setSelectedOption(prev => selectedOption.filter(prev => prev !== "developers"))
            }
        }
        if (value === "girls") {
            if (checked) {
                if (selectedOption.includes('boys')) {
                    setSelectedUser(employees
                        .map(user => user._id))
                } else {
                    setSelectedUser(employees
                        .filter(user => user.gender === "Female")
                        .map(user => user._id)
                    );
                }
                setSelectedOption(prev => [...prev, 'girls'])

            } else {
                setSelectedUser(selectedUser.filter(userId => {
                    const user = employees.find(u => u._id === userId);
                    return user && user.gender !== "Female";
                }));
                setSelectedOption(prev => selectedOption.filter(prev => prev !== "girls"))
            }
        }
        if (value === "boys") {
            if (checked) {
                if (selectedOption.includes('girls')) {
                    setSelectedUser(employees
                        .map(user => user._id))
                } else {
                    setSelectedUser(employees
                        .filter(user => user.gender === "Male")
                        .map(user => user._id)
                    );
                }
                setSelectedOption(prev => [...prev, 'boys'])

            } else {

                setSelectedUser(selectedUser.filter(userId => {
                    const user = employees.find(u => u._id === userId);
                    return user && user.gender !== "Male";
                }));
                setSelectedOption(prev => selectedOption.filter(prev => prev !== "boys"))
            }
        }
        if (checked && selectedOption.length === 3) {
            setSelectedOption(prev => [...prev, 'all'])
            setSelectedUser(employees.map((user) => {
                return user._id
            }))
        }
    }

    const participate = [
        {
            name: "Name", selector: (row) => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={row.employee_profile} width={30} height={30} alt="profile" className={styles.tableProfile} onError={(e) => {
                        e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
                    }} />
                    <span style={{ marginLeft: '10px' }}>{row.first_name} {row.last_name}</span>
                </div>
            ),
            wrap: true
        },
        { name: "Department", selector: (row) => `${row.department}`, wrap: true },
        { name: "Designation", selector: (row) => `${row.designation}`, width: '20%', wrap: true },

    ];

    const notParticipate = [
        {
            name: "Name", selector: (row) => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={row.employee_profile} width={30} height={30} alt="profile" className={styles.tableProfile} onError={(e) => {
                        e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${row.first_name.charAt(0).toUpperCase()}${row.last_name.charAt(0).toUpperCase()}`;
                    }} />
                    <span style={{ marginLeft: '10px' }}>{row.first_name} {row.last_name}</span>
                </div>
            ),
            wrap: true
        },
        { name: "Department", selector: (row) => `${row.department}`, wrap: true },
        { name: "Designation", selector: (row) => `${row.designation}`, wrap: true },
        { name: "Reason", selector: (row) => <div style={{ cursor: "pointer" }}><Image src={"/images/eye-icon.svg"} width={15} height={9} alt="eye" onClick={() => handleModalToggle(row)} /></div>, width: '11%', },
    ];

    const participateData = participants?.filter(d => d.participate_status === "approved")
    const notParticipateData = participants?.filter(d => d.participate_status === "rejected")

    const initialValues = { name: "", start_date: "", start_time: "", description: "", duration: "" }
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: yup.object().shape({
            name: yup.string().required("Required"),
            start_date: yup.date().required("Required"),
            start_time: yup.string().required("Required"),
            description: yup.string().required("Required"),
            duration: yup.number().typeError('Duration must be a number').required("Required").positive("Duration must be a positive number").integer("Duration must be an integer"),
        }),

        onSubmit: async (values, action) => {
            const { name, start_date, start_time, description, duration } = values
            let fetchedID, deleteMembers, newMembers;
            if (participants) {
                fetchedID = participants.map(user => {
                    const id = user.employee_id
                    return id
                })
                deleteMembers = participants.filter(user => !(selectedUser.includes(user.employee_id))).map(d => {
                    return {
                        event_id: getQueryParams,
                        employee_id: d.employee_id
                    }
                })
                newMembers = employees.map(d => d._id).filter(d => {
                    if (!fetchedID.includes(d) && selectedUser.includes(d)) {
                        return true;
                    }
                }).map(d => {
                    return {
                        event_id: id,
                        employee_id: d,
                    }
                })
            }

            const data = { name, start_time, description, duration, start_date: new Date(start_date) }
            if (id !== "addevent" && id !== "undefined") {
                try {
                    if (newMembers.length > 0) {
                        const postmembers = await instance.post('/api/event_participants', { newMembers })
                    }
                    if (deleteMembers.length > 0) {
                        const deleteMember = await instance.post('/api/event_participants', { deleteMembers })
                    }
                    const saveData = await instance.put(`/api/events?event_id=${id}`, data)
                } catch (err) {
                    console.log('error', err);
                } finally {
                    router.push("/admin/events")
                }
            } else {
                const addData = instance.post(`/api/events`, data).then((res) => {
                    if (res.data.acknowledged) {
                        const id = res.data.insertedId
                        const newMembers = selectedUser.map(d => {
                            return {
                                event_id: id,
                                employee_id: d
                            }
                        })
                        if (newMembers.length > 0) {
                            const postmembers = instance.post('/api/event_participants', { newMembers })
                        }
                    }
                    router.push("/admin/events")
                })

            }
        }
    });

    const handleEditorChange = (content, editorRef) => {
        formik.setFieldValue("description", content);
        const editorInstance = editorRef.current;
        if (editorInstance) {
            const editorContainer = editorInstance.editor.container;
            if (editorContainer) {
                if (content === "") {
                    editorContainer.style.border = "1px solid red";
                    touched.description = 'Required'
                    errors.description = 'Required'
                }
                else {
                    editorContainer.style.border = "";
                    delete touched.description
                    delete errors.description
                }
            }
        }
    };

    const { errors, handleChange, handleBlur, handleSubmit, values, touched } = formik;

    const openFileManager = (field = null) => {
        const Flmngr = require("@flmngr/flmngr-react").default;
        if (Flmngr) {
            Flmngr.open({
                apiKey: "WrYOVz2j",
                urlFileManager: "https://files.teqnomanweb.com/flmngr",
                urlFiles: "https://files.teqnomanweb.com/files",
                isMultiple: false,
                acceptExtensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
                onFinish: (files) => {
                    if (typeof field === "string") {
                        setProjectFiles([...projectFiles, files[0].url]);
                    } else {
                        editorRef.current.editor.insertContent(`<img src='${files[0].url}' />`);
                    }
                },
            });
        }
    }


    return (<>
        <Head>
            <title>Portal || Events </title>
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
            <div className={styles.eventHead}>Event list <Image className={styles.arrow} src="/images/project-right.png" width={5} height={9} alt='Event Image' /><span className={styles.eventName}>{getQueryParams !== 'addevent' ? `${eventsData?.name}` : "Create Event"}</span></div>
            <div className={styles.eventBox}>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className={`row ${styles.rowAdjust}`}>
                            <div className='col-lg-10'>
                                <div className='row'>
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="form_control">
                                            <label className="custom-label">Event Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter Event Name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.name}
                                                id='name'
                                                aria-describedby="name"
                                                className={`custom-input ${touched.name && errors.name ? 'border-danger' : ''}`}
                                            />
                                            {touched.name && errors.name && <div className="invalid-tooltip">{errors?.name}</div>}
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="form_control">
                                            <label className="custom-label">Date</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.start_date}
                                                id='start_date'
                                                aria-describedby="start_date"
                                                className={`custom-input ${touched.start_date && errors.start_date ? 'border-danger' : ''}`}
                                            />
                                            {touched.start_date && errors.start_date && <div className="invalid-tooltip">{errors?.start_date}</div>}
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="form_control time-input">
                                            <label className="custom-label">Time</label>
                                            <input
                                                type="time"
                                                name="start_time"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.start_time}
                                                id='start_time'
                                                aria-describedby="start_time"
                                                className={`custom-input ${touched.start_time && errors.start_time ? 'border-danger' : ''}`}
                                            />
                                            {touched.start_time && errors.start_time && <div className="invalid-tooltip">{errors?.start_time}</div>}
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="form_control">
                                            <label className="custom-label">Duration</label>
                                            <input
                                                type="number"
                                                placeholder='Add duration of the event'
                                                name="duration"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.duration}
                                                id='duration'
                                                aria-describedby="duration"
                                                className={`custom-input ${touched.duration && errors.duration ? 'border-danger' : ''}`}
                                            />
                                            {touched.duration && errors.duration && <div className="invalid-tooltip">{errors?.duration}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-12 col-12">
                                <div className={`participate-btn ${styles.participateBtn}`}>
                                    <ButtonUi cssClass="btnuiRounded" text="Add participates" callBack={handleAddParticipant} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="form_control">
                                    <label className="custom-label">Add Description</label>
                                    <div className="editor">
                                        <Editor
                                            ref={editorRef}
                                            apiKey="qozm3c4ib5cxqh7q8cbqze45sk3dyix57ueeuatqpveo2wpt"
                                            init={{
                                                height: 500,
                                                menubar: true,
                                                menubar: "file edit view insert format tools table",
                                                plugins: "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen link media template codesample table charmap pagebreak nonbreaking insertdatetime advlist lists wordcount help charmap emoticons",
                                                toolbar: "undo redo | formatselect | bold italic |  alignleft aligncenter alignright alignjustify |  bullist numlist outdent indent | removeformat | flmngr",
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                setup: editor => {
                                                    editor.ui.registry.addButton('flmngr', {
                                                        text: 'Upload Image',
                                                        onAction: openFileManager
                                                    });
                                                },
                                            }}
                                            onEditorChange={(content) => handleEditorChange(content, editorRef)}
                                            value={values.description}
                                        />
                                        {touched.description && errors.description ? (<div className="invalid-tooltip">Required</div>) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.EditBtn}>
                            <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={() => router.push('/admin/events')} />
                            <ButtonUi cssClass="btnuiRounded" text={getQueryParams != "addevent" && getQueryParams != undefined ? "Save changes" : "Add Event"} type='submit' />
                        </div>
                    </form>
                </div>
                <div>
                    <div className="row">
                        {getQueryParams !== "addevent" && getQueryParams !== undefined && (<>
                            <div className="col-lg-6 col-md-12 col-12">
                                <p className={styles.text}>Participate</p>
                                <div className={`${styles.dataTable}`}>
                                    <DataTable columns={participate} data={participateData} fixedHeader />
                                </div>
                            </div>
                            <div className={`col-lg-6 col-md-12 col-12 ${styles.spacing}`}>
                                <p className={styles.text}>Not participate</p>
                                <div className={`${styles.dataTable}`}>
                                    <DataTable columns={notParticipate} data={notParticipateData} fixedHeader />
                                </div>
                            </div>
                        </>)}
                    </div>
                </div>
            </div>

            {showModal && selectedParticipant && (
                <Modal show={showModal} className="notIntrestedModal" centered onHide={handleModalToggle}>
                    <Modal.Header closeButton>
                        <Modal.Title>Reason for not participating</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={styles.profile}>
                            <div><img src={selectedParticipant.employee_profile} width={50} height={50} alt="profile" className={styles.profileImg} onError={(e) => {
                                e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${selectedParticipant.first_name.charAt(0).toUpperCase()}${selectedParticipant.last_name.charAt(0).toUpperCase()}`;
                            }} /></div>
                            <div>
                                <p className={styles.name}>{selectedParticipant.first_name} {selectedParticipant.last_name}</p>
                                <p className={styles.designation}>{selectedParticipant.designation}</p>
                            </div>
                        </div>
                        <div className={styles.reasonDiv}>
                            <p className={styles.title}>Reason</p>
                            <p className={styles.reason}>{selectedParticipant.reject_reason}</p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonUi cssClass="btnuiRounded" text="Close" callBack={handleModalToggle} />
                    </Modal.Footer>
                </Modal>)
            }

            {participantModal && (<Modal show={participantModal} onHide={handleAddParticipant} className="eventModal">
                <Modal.Header closeButton>
                    <Modal.Title>Add Participates</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className='form_control'>
                                <label className="custom-label">Employee type</label>
                                <div className='filter-sorting'>
                                    <div className='dropdown-list'>
                                        <div>
                                            <Dropdown align="end">
                                                <Dropdown.Toggle id="dropdown-basic" className="employeeDropdown">All</Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {['all', 'designers', 'developers', 'girls', 'boys'].map(option => (
                                                        <Dropdown.Item key={option} href="#">
                                                            <div onClick={multiselect} className={styles.dropList}>
                                                                <input type="checkbox" className={styles.checkBox} id={option} name={option} value={option} checked={selectedOption.includes(option)} />
                                                                <label htmlFor={option} className={styles.addressCheck}>{option === 'all' ? 'All' : option}</label>
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className={styles.text}>Employee list</p>
                        {employees?.map((employee, key) => (

                            <div onClick={(e) => e.stopPropagation()} key={key} className={`${styles.dropList} ${styles.employeeList}`}>
                                <div className={styles.empName}>
                                    <input
                                        onChange={() => handleCheckboxClick(employee._id)}
                                        checked={selectedUser.includes(employee._id)} type="checkbox" className={styles.checkBox} id={`userCheckbox+${key}`} />
                                    <label htmlFor={`userCheckbox+${key}`} className={styles.addressCheck}>
                                        <img src={employee.employee_profile || '/images/dummy-profile.png'} width={30} height={30} alt={"image"} onError={(e) => {
                                            e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${employee.first_name.charAt(0).toUpperCase()}${employee.last_name.charAt(0).toUpperCase()}`;
                                        }} />
                                        <span>{employee.first_name} {employee.last_name}</span>
                                    </label>
                                </div>
                                <p className={styles.empName}>{employee.department}</p>
                            </div>))}
                    </div>
                </Modal.Body>
            </Modal>)}
        </Layout>
    </>)
}

export default EvnetDetails;


export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const id = context.query.addevent;
    const data = {};
    let errorOccurred = false;

    if (id !== "addevent" && id !== "undefined") {
        const apiEndpoints = [
            { key: 'events', endpoint: `/api/events?event_id=${id}` },
        ];
        for (const api of apiEndpoints) {
            try {
                const response = await instance.get(`${baseUrl}${api.endpoint}`);
                data[api.key] = response.data;
            } catch (error) {
                console.log(`Error fetching ${api.key}:`, error.message);
                errorOccurred = true;
            }
        }
    }

    try {
        const employeesResponse = await instance.get(`${baseUrl}/api/employees`);
        const allEmployees = employeesResponse.data;
        const activeEmployees = allEmployees.filter(employee => employee.status === 'active');
        data['employees'] = activeEmployees;
    } catch (error) {
        console.log('Error fetching employees:', error.message);
        errorOccurred = true;
    }


    if (errorOccurred) {
        return { props: { ...data } };
    } else {
        return { props: data };
    }
}
