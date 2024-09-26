import ButtonUi from '@/components/ButtonUi/ButtonUi'
import Layout from '@/components/Layout/Layout'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "../../../styles/job.module.scss";
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';
import { instance } from '@/utils/Apiconfig';

export default function AddPortfolio({ portfolioList }) {

    const router = useRouter()
    const getQueryParams = router.query['add-portfolio'];
    const [featured, setFeatured] = useState(false);

    useEffect(() => {
        if (portfolioList) {
            formik.setValues(portfolioList)
        }
    }, [getQueryParams])

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
                        formik.setFieldValue(field, files[0].url);
                    } else {
                        editorRef.current.editor.insertContent(`<img src='${files[0].url}' />`);
                    }
                },
            });
        }
    }

    const initialValues = {
        name: '',
        order: '',
        image: '',
        featured: false
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: yup.object().shape({
            name: yup.string().required("Required"),
            order: yup.number().required("Required"),
            featured: yup.string().required("Required"),
        }),

        onSubmit: async (values, action) => {
            if (getQueryParams === "add-portfolio" && getQueryParams !== 'undefined') {
                values.status = 'draft'
                const postData = instance.post("/api/portfolio", values).then((res) => {
                    router.push("/admin/portfolio");
                })
            }
            else {
                delete values._id
                const updateData = instance.put(`/api/portfolio?id=${getQueryParams}`, values).then((res) => {
                    router.push("/admin/portfolio");
                });
            }
        },

    })

    const { errors, handleChange, handleBlur, handleSubmit, values, touched } = formik;

    const handleToggleFeatured = () => {
        const newFeatured = !featured;
        setFeatured(newFeatured);
        formik.setFieldValue('featured', newFeatured);
    };

    return (<>
        <Head>
            <title>Portal || Portfolio </title>
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
            <h2 className="page-title">{getQueryParams === "add-portfolio" ? 'Add Portfolio' : 'Edit Portfolio'}</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.projectBox}>
                    <div className='row'>
                        <div className="col-lg-12">
                            <div className="toggleSwitch">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={values.featured}
                                    onChange={handleToggleFeatured}
                                    value={values.featured}
                                />
                                <label htmlFor="featured"></label>
                                <p>Featured</p>
                            </div>
                        </div>
                        <div className='col-lg-8'>
                            <div className="form_control">
                                <label className="custom-label">Name</label>
                                <input type="text" placeholder="Name"
                                    name='name'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.name}
                                    id='name'
                                    aria-describedby="name"
                                    className={`custom-input ${touched.name && errors.name ? 'border-danger' : ''}`}
                                    required="" />
                                {touched.name && errors.name && <div className="invalid-tooltip">{errors?.name}</div>}
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className="form_control">
                                <label className="custom-label">Order</label>
                                <input type="number" name='order'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.order}
                                    id='order'
                                    className={`custom-input ${touched.order && errors.order ? 'border-danger' : ''}`} required="" />
                                {touched.order && errors.order && <div className="invalid-tooltip">{errors?.order}</div>}
                            </div>
                        </div>

                        <div className='col-lg-12'>
                            <div className="form_control">
                                <label className="custom-label">Image</label>
                                <div className="form input-group flex-nowrap">
                                    <input id="file" name="file" readOnly type="text" multiple className={touched.file && errors.file ? `danger form-control` : `form-control`} placeholder="Select Featured Image"
                                        onBlur={handleBlur}
                                        value={values.image}
                                        required
                                    />
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => openFileManager("image")}>Select Image</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.btns}>
                        <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={() => router.push('/admin/portfolio')} />
                        <ButtonUi cssClass="btnuiRounded" text={getQueryParams === "add-portfolio" ? "Add Portfolio" : "Update Portfolio"} type='submit' />
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
    const id = context.query['add-portfolio']
    const apiEndpoints = [
        { key: 'portfolioList', endpoint: `/api/portfolio?id=${id}` },
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