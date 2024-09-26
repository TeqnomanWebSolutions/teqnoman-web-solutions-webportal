import Layout from '@/components/Layout/Layout'
import React, { useEffect, useRef, useState } from 'react'
import styles from "../../../styles/project.module.scss"
import Image from 'next/image'
import ButtonUi from '@/components/ButtonUi/ButtonUi'
import { Editor } from '@tinymce/tinymce-react'
import { Button, Dropdown, Modal } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { instance } from '@/utils/Apiconfig'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import moment from 'moment'
import FileThumbnail from '@/components/FileThumbnail/FileThumbnail'
import Head from 'next/head'

const Addproject = ({ projectData, employeeList, invoiceData }) => {

    const fetchedMembers = projectData?.employee_data;
    const [assingees, setAssignees] = useState(employeeList || [])
    const router = useRouter();
    const editorRef = useRef();
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false)
    const [selectedAssignees, setSelectedAssignees] = useState([])
    const [deleteModal, setDeleteModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFiles, setProjectFiles] = useState([]);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [invoiceList, setInvoiceList] = useState([]);

    const handleModalToggle = () => {
        setDeleteModal(!deleteModal)
    }

    const handleInvoiceModal = (type = "add", invoice = null) => {
        setShowInvoiceModal(true);
        setActionType("Add")
        if (type == "edit") {
            invoiceForm.setValues({ ...invoice });
            setActionType("Update");
        }
    }

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

    const getFileName = (filePath) => {
        let slices = filePath.split("/");
        return slices[slices.length - 1];
    }

    const closeInvoiceModal = () => {
        invoiceForm.resetForm();
        setShowInvoiceModal(false);
    }

    const deleteProject = async (action) => {
        if (action === "cancel") {
            router.push("/admin/projects");
            return;
        }
        await instance.put(`/api/projects?project_id=${ID}`, { is_deleted: true });
        router.push("/admin/projects");
    }

    useEffect(() => {
        if (fetchedMembers) {
            const selected = fetchedMembers.map(d => {
                return d.employee_id
            })
            setSelectedAssignees(selected)
        }
        if (invoiceData) {
            setInvoiceList(invoiceData);
        }
        setProjectFiles(projectData?.attachments || [])
    }, [])

    const deleteProjectAttachment = async (e, file, index) => {
        e.preventDefault();
        let files = [...projectFiles];
        files.splice(index, 1);
        setProjectFiles(files);
    }

    const checkbadge = (key) => {
        switch (key) {
            case 'successful':
                return 'badge-completed'

            case 'pending':
                return 'badge-inprogress'

            case 'remaining':
                return 'badge-todo'
            default:
                return 'completed'
        }
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
        }
    };

    const handleCheckboxClick = (userId) => {
        if (selectedAssignees.includes(userId)) {
            setSelectedAssignees(prev => ([...prev.filter(id => id !== userId)]))
        } else {
            setSelectedAssignees(prev => ([...prev, userId]))
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const projectTypes = ["Wordpress", "Graphic Design", "UI/UX", "Frontend Development", "Web Development", "React JS", "Next JS"]
    const ID = router.query.project;
    async function getProjectInvoices() {
        let res = await instance.get(`/api/project_invoices?project_id=${ID}`);
        setInvoiceList(res.data);
    }

    async function deleteInvoice(invoice) {
        await instance.delete(`/api/project_invoices?id=${invoice._id}`);
        await getProjectInvoices();
    }

    const invoiceForm = useFormik({
        initialValues: {
            payment_number: "",
            payment_status: "",
            invoice_number: "",
            amount_percent: "",
            project_id: ""
        },
        validationSchema: Yup.object().shape({
            payment_number: Yup.number().integer().required("Required"),
            payment_status: Yup.string().required("Required"),
            invoice_number: Yup.string().required("Required"),
            amount_percent: Yup.number().integer().required("Required"),
        }),
        onSubmit: async (values) => {
            values.project_id = ID;
            if (actionType === "Update") {
                let id = values._id;
                delete values._id;
                await instance.put(`/api/project_invoices?id=${id}`, values);
            } else {
                await instance.post(`/api/project_invoices`, values);
            }
            invoiceForm.resetForm();
            closeInvoiceModal();
            getProjectInvoices();

        }
    })

    useEffect(() => {
        if (ID !== "addproject" && ID !== "undefined") {
            formik.setValues({
                ...projectData,
                start_date: moment(projectData.start_date).format('YYYY-MM-DD'),
                end_date: moment(projectData.end_date).format('YYYY-MM-DD')
            })
        }
    }, [ID])

    const handleEditorChange = (content, editorRef) => {
        formik.setFieldValue("description", content);
        const editorInstance = editorRef.current;
        if (editorInstance) {
            const editorContainer = editorInstance.editor.container;
            if (editorContainer) {
                if (content === "") {
                    editorContainer.style.border = "1px solid red";
                    touched.description = "Required"
                    errors.description = "Required"
                }
                else {
                    editorContainer.style.border = "";
                    delete touched.description
                    delete errors.description
                }
            }
        }
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            type: "",
            start_date: "",
            end_date: "",
            status: "",
            description: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            type: Yup.string().required('Required'),
            start_date: Yup.date().required('Required'),
            end_date: Yup.date()
                .required('Required')
                .min(Yup.ref('start_date'), 'End date must be later than start date'),
            status: Yup.string().required('Required'),
            description: Yup.string().required('Required'),
        }),
        onSubmit: async (values, action) => {
            const { type, name, description, end_date, start_date, status } = values;
            let fetchedID, deleteMembers, newMembers;
            if (fetchedMembers) {
                fetchedID = fetchedMembers.map(user => {
                    const id = user.employee_id
                    return id
                })
                deleteMembers = fetchedMembers.map(d => {
                    return {
                        project_id: ID,
                        employee_id: d.employee_id
                    }
                }).filter(user => !(selectedAssignees.includes(user.employee_id)))
                newMembers = assingees.map(d => d._id).filter(d => {
                    if (!fetchedID.includes(d) && selectedAssignees.includes(d)) {
                        return true;
                    }
                }).map(d => {
                    return {
                        project_id: ID,
                        employee_id: d
                    }
                })
            }
            const data = { type, name, description, end_date: new Date(end_date), start_date: new Date(start_date), status }
            if (ID !== "addproject" && ID !== "undefined") {
                try {
                    if (newMembers.length > 0) {
                        const postmembers = await instance.post('/api/project_members', { newMembers })

                    }
                    if (deleteMembers.length > 0) {
                        const deleteMember = await instance.post('/api/project_members', { deleteMembers })
                    }
                    data.attachments = projectFiles;
                    const saveData = await instance.put(`/api/projects?project_id=${ID}`, data)
                } catch (err) {
                    console.log(err);
                } finally {
                    router.push("/admin/projects")

                }
            } else {
                data.attachments = projectFiles;
                const addData = instance.post(`/api/projects`, data).then(async (res) => {
                    if (res.data.acknowledged) {
                        const id = res.data.insertedId
                        const newMembers = selectedAssignees.map(d => {
                            return {
                                project_id: id,
                                employee_id: d
                            }
                        })
                        if (newMembers.length > 0) {
                            const postmembers = instance.post('/api/project_members', { newMembers })
                        }
                    }
                    router.push("/admin/projects")
                })

            }
        }
    })

    const { values, handleChange, handleSubmit, handleBlur, errors, touched } = formik

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
            <div>
                <div className={styles.projectHead}>Projects <Image className={styles.arrow} src="/images/project-right.png" width={5} height={9} alt='project' /><span className={styles.projectName}> {values.name}</span></div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.projectBox}>
                            <div className="row">
                                <div className="col-lg-4 col-md-6 col-12">
                                    <div className="form_control">
                                        <label className="custom-label">Project name</label>
                                        <input
                                            type="text"
                                            placeholder='Enter project name'
                                            name="name"
                                            id='name'
                                            aria-describedby="project_name"
                                            className={`custom-input ${touched.name && errors.name ? 'border-danger' : ''}`}
                                            value={values.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                        />
                                        {touched.name && errors.name ? <div className="invalid-tooltip">{errors.name}</div> : <></>}
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-12">
                                    <div className="form_control">
                                        <label className="custom-label">Project Type</label>
                                        <select name="type" id="type"
                                            className={`custom-select ${touched.type && errors.type ? 'border-danger' : ''}`}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.type}
                                        >
                                            <option value={""} disabled>Select Project Type</option>
                                            {projectTypes.map((d, key) => {
                                                return <option key={key} value={d}>{d}</option>
                                            })}
                                        </select>
                                        {touched.type && errors.type ? <div className="invalid-tooltip">{errors.type}</div> : <></>}
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-12">
                                    <div className="form_control">
                                        <label className="custom-label">Assignees</label>
                                        <div ref={dropdownRef} className={`${styles.assigneeToggle}`} onClick={() => { setOpen(!open); }}>
                                            <p className='custom-label'>Select Assignees</p>
                                            <div className={`${styles['custom-list']} ${open ? styles.open : styles.close}`}>
                                                <div className={styles.searchDiv}>
                                                    <div className={styles.search}>
                                                        <Image src="/images/search-icon.svg" alt="search-icon" height={14} width={14} />
                                                        <input type="text" className={styles.searchTerm} placeholder='Search' onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} onClick={(e) => e.stopPropagation()} />
                                                    </div>
                                                    <ul>{assingees?.filter(user =>
                                                        `${user.name}`.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).map((user, key) => (<>
                                                        <li onClick={(e) => e.stopPropagation()} key={key}>
                                                            <input
                                                                onChange={() => handleCheckboxClick(user._id)}
                                                                checked={selectedAssignees.includes(user._id)} type="checkbox" className={styles.checkBox} id={`userCheckbox+${key}`} />
                                                            <label htmlFor={`userCheckbox+${key}`} className={styles.addressCheck}>
                                                                <img src={user.employee_profile || "/images/dummy-profile.png"} width={30} height={30} alt={"image"} className={styles.profileImg} onError={(e) => {
                                                                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${user.name.charAt(0).toUpperCase()}`;
                                                                }} />
                                                                <span>{user.name}</span>
                                                            </label>
                                                        </li>
                                                    </>))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="form_control">
                                        <label className="custom-label">Start date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            id='start_date'
                                            className={`custom-input ${touched.start_date && errors.start_date ? 'border-danger' : ''}`}
                                            value={values.start_date}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                        />
                                        {touched.start_date && errors.start_date ? <div className="invalid-tooltip">{errors.start_date}</div> : <></>}
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="form_control">
                                        <label className="custom-label">End date</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            id='end_date'
                                            className={`custom-input ${touched.end_date && errors.end_date ? 'border-danger' : ''}`}
                                            value={values.end_date}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                        />
                                        {touched.end_date && errors.end_date ? <div className="invalid-tooltip">{errors.end_date}</div> : <></>}
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="form_control">
                                        <label className="custom-label">Status</label>
                                        <select name="status" id="status"
                                            className={`custom-select ${touched.status && errors.status ? 'border-danger' : ''}`}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.status}
                                        >
                                            <option value={""} disabled>Select Status</option>
                                            <option value={"todo"}>To Do</option>
                                            <option value={"inprogress"}>In Progress</option>
                                            <option value={"completed"}>Completed</option>
                                            <option value={"hold"}>Hold</option>
                                        </select>
                                        {touched.status && errors.status ? <div className="invalid-tooltip">{errors.status}</div> : <></>}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="form_control">
                                        <label className="custom-label">Add Description</label>
                                        <div className="editor">
                                            <Editor
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
                                                    }
                                                }}
                                                ref={editorRef}
                                                tagName='description'
                                                onBlur={handleBlur}
                                                value={values.description}
                                                onEditorChange={(content) => handleEditorChange(content, editorRef)}
                                            />
                                            {touched.description && errors.description ? (<p className="invalid-tooltip">{errors.description}</p>) : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.fileDownload}>
                                {projectFiles.map((file, index) =>
                                    <div className={styles.flexFile} key={`ProjectFiles${index}`}>
                                        <a className={styles.file} target='_blank' href={file}>
                                            <img src='/images/close-icon.svg' className={styles.icon1} onClick={(e) => deleteProjectAttachment(e, file, index)} />
                                            <FileThumbnail height={24} width={25} className={styles.icon} name={getFileName(file)} />
                                            <p>{getFileName(file)}</p>
                                        </a>
                                    </div>)}
                            </div>
                            <div className="col-lg-12 col-12">
                                <label className='custom-label'>Attached File</label>
                                <div className='form_control'>
                                    <label htmlFor="attachment" className={`${styles.upload} `}>{"+ Choose file"}</label>
                                    <input
                                        name='attachment'
                                        accept="image/jpeg, image/png, application/pdf"
                                        hidden
                                        id="attachment"
                                        multiple
                                        onClick={() => openFileManager("project")}
                                    />
                                </div>
                            </div>
                            {ID === 'addproject' ? '' :
                                <div>
                                    <p className="custom-label">Invoice</p>
                                    <ButtonUi cssClass="btnuiplain float-left" text="Add Invoice" callBack={handleInvoiceModal} />
                                    <div className={styles.invoiceBox}>
                                        <div className="row">
                                            {invoiceList.map((invoice, index) => (
                                                <div className="col-lg-3 col-md-6" key={index}>
                                                    <div className={styles.projBox}>
                                                        <div className={styles.project}>
                                                            <Dropdown className={styles.actionMenu}>
                                                                <Dropdown.Toggle className="drop bg-white border-0 p-0" variant='none' id="dropdown-basic">
                                                                    <img src="/images/3dots.svg" />
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item href="#" onClick={() => deleteInvoice(invoice)}>Delete</Dropdown.Item>
                                                                    <Dropdown.Item href="#" onClick={() => handleInvoiceModal("edit", invoice)}>Edit</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <div className={styles.head}>
                                                                <div className={styles.leftheading}>
                                                                    <h3 className={styles.heading}>Payment</h3>
                                                                    <span className={styles.paymentNo}>{invoice.payment_number > 9 ? invoice.payment_number : `0${invoice.payment_number}`}</span>
                                                                </div>
                                                                <div className={styles.rightheading}>
                                                                    <span className={`badge ${checkbadge(invoice.payment_status)}`}>{invoice.payment_status}</span>
                                                                </div>
                                                            </div>
                                                            <div className={styles.number}>
                                                                <div className={styles.invoiceNo}>
                                                                    <p>Invoice No.</p>
                                                                    <span>{invoice.invoice_number}</span>
                                                                </div>
                                                                <div className={styles.percentage}>
                                                                    <p>{invoice.amount_percent}%</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className={styles.submitEventBtn}>
                            {<ButtonUi cssClass="btnuiplain" text={ID === 'addproject' ? "Cancel" : "Delete"} type='button' callBack={ID === 'addproject' ? () => router.push('/admin/projects') : handleModalToggle} />}
                            {<ButtonUi cssClass="btnuiRounded" text={ID === 'addproject' ? "Add Project" : "Save"} type='submit' />}
                        </div>
                    </form>
                </div>
            </div>

            {deleteModal && (<Modal show={handleModalToggle} className="holiday-modal" centered onHide={handleModalToggle}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className={styles.remove}>Are you sure you want to Delete this Project?</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={handleModalToggle} />
                    <ButtonUi cssClass='btnuiRounded' text="Delete" callBack={() => deleteProject(ID === 'addproject' ? "cancel" : "delete")} />
                </Modal.Footer>
            </Modal>)}

            {showInvoiceModal && (<Modal show={closeInvoiceModal} className="holiday-modal" centered onHide={closeInvoiceModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {actionType} Invoice
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className="col-lg-6 col-md-6">
                            <div className="form-input">
                                <label className="custom-label">Payment No</label>
                                <input onChange={invoiceForm.handleChange} name="payment_number" type="number" className={`custom-input ${invoiceForm.touched.payment_number && invoiceForm.errors.payment_number ? 'border-danger' : ''}`} id="payment_number" value={invoiceForm.values.payment_number} required min={0} />
                                {invoiceForm.touched.payment_number && invoiceForm.errors.payment_number ? <div className="invalid-tooltip">{invoiceForm.errors.payment_number}</div> : <></>}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                            <div className="form-input">
                                <label className="custom-label">Invoice No.</label>
                                <input onChange={invoiceForm.handleChange} name="invoice_number" id="invoice_number" type="text" value={invoiceForm.values.invoice_number} required className={`custom-input ${invoiceForm.touched.invoice_number && invoiceForm.errors.invoice_number ? 'border-danger' : ''}`} />
                                {invoiceForm.touched.invoice_number && invoiceForm.errors.invoice_number ? <div className="invalid-tooltip">{invoiceForm.errors.invoice_number}</div> : <></>}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                            <div className="form-input">
                                <label className="custom-label">Amount (%)</label>
                                <input onChange={invoiceForm.handleChange} name="amount_percent" id="amount_percent" type="number" max={100} min={0} className={`custom-input ${invoiceForm.touched.amount_percent && invoiceForm.errors.amount_percent ? 'border-danger' : ''}`} value={invoiceForm.values.amount_percent} required />
                                {invoiceForm.touched.amount_percent && invoiceForm.errors.amount_percent ? <div className="invalid-tooltip">{invoiceForm.errors.amount_percent}</div> : <></>}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                            <div className="form-input">
                                <label className="custom-label">Invoice Status</label>
                                <select name="payment_status" id="payment_status" onBlur={invoiceForm.handleBlur} onChange={invoiceForm.handleChange} value={invoiceForm.values.payment_status} className={`custom-input ${invoiceForm.touched.payment_status && invoiceForm.errors.payment_status ? 'border-danger' : ''}`} required>
                                    <option value="">Select</option>
                                    <option value="pending">Pending</option>
                                    <option value="successful">Successful</option>
                                    <option value="remaining">Remaining</option>
                                </select>
                                {invoiceForm.touched.payment_status && invoiceForm.errors.payment_status ? <div className="invalid-tooltip">{invoiceForm.errors.payment_status}</div> : <></>}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={closeInvoiceModal} />
                    <ButtonUi cssClass='btnuiRounded' text={actionType} callBack={() => invoiceForm.submitForm()} />
                </Modal.Footer>
            </Modal>)}
        </Layout>
    </>)
}

export default Addproject;

export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const ID = context.query.project
    const data = {};

    let errorOccurred = false;
    try {
        const response = await instance.get(`${baseUrl}${"/api/employees"}`);
        const filter = response.data.filter(d => d.status === "active").map(d => {
            return {
                _id: d._id,
                employee_profile: d.employee_profile,
                name: d.first_name + " " + d.last_name,
            }
        })
        data['employeeList'] = filter
        if (ID === "addproject") {
            return { props: data }
        }
    } catch (error) {
        console.log(`Error fetching Employees:`, error);
    }

    if (ID !== "addproject" && ID !== "undefined") {
        const apiEndpoints = [
            { key: 'projectData', endpoint: `/api/projects?project_id=${ID}` },
            { key: 'invoiceData', endpoint: `/api/project_invoices?project_id=${ID}` },
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

        if (errorOccurred) {
            return { props: { ...data } };
        } else {
            return { props: data };
        }
    } else {
        return { props: data };
    }
}
