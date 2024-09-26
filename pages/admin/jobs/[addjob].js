import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout'
import React, { useEffect, useRef } from 'react'
import styles from "../../../styles/job.module.scss";
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { Editor } from '@tinymce/tinymce-react';
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';

export default function AddJob({ jobData }) {

    const router = useRouter();
    const getQueryParams = router.query.addjob;
    const editorRef = useRef();

    useEffect(() => {
        if (jobData) {
            delete jobData._id
            formData.setValues(jobData)
        }
    }, [getQueryParams])

    const initialValues = {
        jobtitle: '',
        experience: '',
        positions: '',
        location: "Ahemdabad, Gujarat",
        worktype: "Full Time",
        jobslug: '',
        jobdescription: '',
    }

    const formData = useFormik({
        initialValues: initialValues,
        validationSchema: yup.object().shape({
            jobtitle: yup.string().required("Required"),
            experience: yup.string().required("Required"),
            positions: yup.string().required("Required"),
            location: yup.string().required("Required"),
            worktype: yup.string().required("Required"),
            jobslug: yup.string().required("Required").matches(/^\S*$/, "Input must not contain spaces"),
            jobdescription: yup.string().required("Required"),
        }),

        onSubmit: async (values, action) => {
            if (getQueryParams === "addjob") {
                const postData = await instance.post("/api/jobs", values).then((res) => {
                    router.push("/admin/jobs");
                });
            } else {
                const updateData = await instance.put(`/api/jobs?id=${getQueryParams}`, values).then((res) => {
                    router.push("/admin/jobs");
                });
            }
        },
    })

    const { errors, handleChange, handleBlur, handleSubmit, values, touched } = formData;

    const handleEditorChange = (content, editorRef) => {
        formData.setFieldValue("jobdescription", content);
        const editorInstance = editorRef.current;
        if (editorInstance) {
            const editorContainer = editorInstance.editor.container;
            if (editorContainer) {
                if (content === "") {
                    editorContainer.style.border = "1px solid red";
                    touched.jobdescription = 'Required'
                    errors.jobdescription = 'Required'
                }
                else {
                    editorContainer.style.border = "";
                    delete touched.jobdescription
                    delete errors.jobdescription
                }
            }
        }
    };

    return (<>
        <Head>
            <title>Portal || Jobs </title>
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
            <h2 className="page-title"> {getQueryParams !== 'addjob' ? 'Edit Jobs Here' : 'Add New Jobs Here'} </h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.projectBox}>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Job Title</label>
                                <input type="text" placeholder="Job Title"
                                    name='jobtitle'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.jobtitle}
                                    id='jobtitle'
                                    aria-describedby="jobtitle"
                                    className={`custom-input ${touched.jobtitle && errors.jobtitle ? 'border-danger' : ''}`}
                                    required="" />
                                {touched.jobtitle && errors.jobtitle && <div className="invalid-tooltip">{errors?.jobtitle}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Experiencee</label>
                                <input type="text" placeholder="Experience" name='experience'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.experience}
                                    id='experience'
                                    className={`custom-input ${touched.experience && errors.experience ? 'border-danger' : ''}`} required="" />
                                {touched.experience && errors.experience && <div className="invalid-tooltip">{errors?.experience}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Positions</label>
                                <input type="text" placeholder="Positions" name='positions'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.positions}
                                    id='positions'
                                    className={`custom-input ${touched.positions && errors.positions ? 'border-danger' : ''}`} required="" />
                                {touched.positions && errors.positions && <div className="invalid-tooltip">{errors?.positions}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Location</label>
                                <input type="text" placeholder="Ahemdabad,Gujarat" className={`custom-input ${touched.location && errors.location ? "border-danger" : ''}`} required="" name='location'
                                    id='location'
                                    value={values.location}
                                    onBlur={handleBlur}
                                    onChange={handleChange} />
                                {touched.location && errors.location && <div className="invalid-tooltip">{errors?.location}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Work Type</label>
                                <input type="text" placeholder="Work Type" className={`custom-input ${touched.worktype && errors.worktype ? 'border-danger' : ''}`}
                                    required=""
                                    name='worktype'
                                    id='worktype'
                                    value={values.worktype}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {touched.worktype && errors.worktype && <div className="invalid-tooltip">{errors?.worktype}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Job Slug</label>
                                <input type="text" placeholder="Job Slug" className={`custom-input ${touched.jobslug && errors.jobslug ? 'border-danger' : ''}`}
                                    required=""
                                    name='jobslug'
                                    id='jobslug'
                                    value={values.jobslug}
                                    onChange={handleChange}
                                    onBlur={handleBlur} />
                                {touched.jobslug && errors.jobslug && <div className="invalid-tooltip">{errors?.jobslug}</div>}
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <div className="form_control">
                                <label className="custom-label">Job Description</label>
                                <Editor
                                    ref={editorRef}
                                    apiKey="qozm3c4ib5cxqh7q8cbqze45sk3dyix57ueeuatqpveo2wpt"
                                    init={{
                                        height: 500,
                                        menubar: true,
                                        menubar: "file edit view insert format tools table",
                                        plugins: "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
                                        toolbar: "undo redo | formatselect | bold italic |  alignleft aligncenter alignright alignjustify |  bullist numlist outdent indent | removeformat | ",
                                        searchreplace: {
                                            searchreplace_inline_elements: true,
                                            searchreplace_placeholder: "Search and replace",
                                        },
                                        relative_urls: false,
                                        convert_urls: false,
                                        remove_script_host: false,
                                    }}
                                    onEditorChange={(content) => handleEditorChange(content, editorRef)}
                                    value={values.jobdescription}
                                />
                                {touched.jobdescription && errors.jobdescription ? (<div className="invalid-tooltip">Required</div>) : null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.btns}>
                        <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={() => router.push('/admin/jobs')} />
                        <ButtonUi cssClass="btnuiRounded" text={getQueryParams !== 'addjob' ? 'Save Changes' : 'Add Job '} type='submit' />
                    </div>
                </div>
            </form>
        </Layout>
    </>)
}


export async function getServerSideProps(context) {

    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const id = context.query.addjob
    const apiEndpoints = [
        { key: 'jobData', endpoint: `/api/jobs?id=${id}` },
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