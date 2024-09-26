import React, { useEffect, useState } from 'react';
import style from '../../styles/onboard.module.scss'
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';
import FileThumbnail from '@/components/FileThumbnail/FileThumbnail';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useAuth } from '@/Hooks/useAuth';

export default function UploadDocuments() {
    const router = useRouter();
    const { loading, user } = useAuth();
    const [uploadedDocuments, setUploadedDocuments] = useState(null);

    useEffect(() => {
        if (user?.id) {
            getAllDocuments()
        }
    }, [user]);

    async function getAllDocuments() {
        let res = await instance.get(`/api/employee_documents?id=${user.id}`);
        if (res.status === 200) {
            let aadhar = res.data.filter((d) => d.name === "aadhar")[0];
            let PAN = res.data.filter((d) => d.name === "PAN")[0];
            let resume = res.data.filter((d) => d.name === "resume")[0];
            let certificate = res.data.filter((d) => d.name === "certificate").length != 0 ? res.data.filter((d) => d.name === "certificate")[0] : null;
            setUploadedDocuments({ aadhar, PAN, resume, certificate });
            setValues({ aadhar, PAN, resume, certificate });
        }
    }

    function showImage(fileObj) {
        if (fileObj instanceof File) {
            return URL.createObjectURL(fileObj)
        } else {
            return null;
        }
    }

    async function setMedia(data) {
        let mediaObject = [];
        let aadhar = data.filter((d) => d.fieldname === "aadhar");
        let PAN = data.filter((d) => d.fieldname === "PAN");
        let resume = data.filter((d) => d.fieldname === "resume");
        let certificate = data.filter((d) => d.fieldname === "certificate");

        if (aadhar.length != 0) {
            let sendData = {
                type: aadhar[0].mimetype,
                size: aadhar[0].size,
                name: aadhar[0].filename,
                url: aadhar[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaObject.push({ name: "aadhar", mediaId: res.data.insertedId })
            }
        }
        if (PAN.length != 0) {
            let sendData = {
                type: PAN[0].mimetype,
                size: PAN[0].size,
                name: PAN[0].filename,
                url: PAN[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaObject.push({ name: "PAN", mediaId: res.data.insertedId })
            }
        }
        if (resume.length != 0) {
            let sendData = {
                type: resume[0].mimetype,
                size: resume[0].size,
                name: resume[0].filename,
                url: resume[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaObject.push({ name: "resume", mediaId: res.data.insertedId })
            }
        }
        if (certificate.length != 0) {
            let sendData = {
                type: certificate[0].mimetype,
                size: certificate[0].size,
                name: certificate[0].filename,
                url: certificate[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaObject.push({ name: "certificate", mediaId: res.data.insertedId })
            }
        }
        return mediaObject;
    }

    async function deleteDocument(fieldname) {
        let formValue = values[fieldname];
        let isUpload = uploadedDocuments && uploadedDocuments[fieldname];
        if (formValue) {
            formik.setFieldValue(fieldname, "");
        }
        if (isUpload) {
            await instance.delete(`/api/media?id=${isUpload.media_id}`)
            await instance.delete(`/api/employee_documents?id=${isUpload._id}&media_id=${isUpload.media_id}&employee_id=${isUpload.employee_id}`)
            await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${user.id}/documents&fileName=${isUpload.filename}`);
            getAllDocuments();
        }
    }

    const uploadDocumentSchema = yup.object().shape({
        aadhar: yup.mixed().required("Required"),
        PAN: yup.mixed().required("Required"),
        resume: yup.mixed().required("Required")
    });

    const formik = useFormik({
        initialValues: { aadhar: "", PAN: "", resume: "", certificate: "", },
        validationSchema: uploadDocumentSchema,
        onSubmit: async () => {
            let formData = new FormData();
            if (values.aadhar instanceof File) {
                formData.append("aadhar", values.aadhar);
            }
            if (values.PAN instanceof File) {
                formData.append("PAN", values.PAN);
            }
            if (values.resume instanceof File) {
                formData.append("resume", values.resume);
            }
            if (values.certificate instanceof File) {
                formData.append("certificate", values.certificate);
            }
            if (!!formData.entries().next().value) {
                try {
                    let fileRes = await instance.post(`https://files.teqnomanweb.com/documents?path=employees/${user.id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
                    if (fileRes.status === 200) {
                        let mediaIds = await setMedia(fileRes.data.documents);
                        mediaIds.map(async (media) => {
                            let reqData = {
                                employee_id: user.id,
                                media_id: media.mediaId,
                                name: media.name
                            }
                            await instance.post(`/api/employee_documents`, reqData);
                        });
                        toast.success("Enter Bank Information");
                        router.push("/onboard/bank-information");
                    }
                } catch (err) {
                    if (err.response.status === 415) {
                        toast.error(err.response.data.message);
                    } else {
                        toast.error("Error While Uploading Documents");
                    }
                }
            }
            router.push("/onboard/bank-information");
        }
    })
    const { errors, handleBlur, handleSubmit, values, setValues, touched } = formik;

    return (<>
        <Head>
            <title>Portal || Onboard</title>
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
        </Head>{loading ? (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        ) : (<section className={style.onboardForm}>
            <div className={style.stepContainer}>
                <div className={`${style.formSection} ${style.active}`}>
                    <div className={style.uploadDoc}>
                        <h2 className='custom-heading'>Upload Documents</h2>
                        <div className='custom-white-box'>
                            <div className='row'>
                                <div className="col-lg-6 col-md-6">
                                    <label className='custom-label'>Aadhar Card</label>
                                    <div className='form_control'>
                                        {!values?.aadhar?.name && !uploadedDocuments?.aadhar?.url && <label htmlFor="adhaar" className={`${style.upload} ${touched.aadhar && errors.aadhar ? 'border-danger' : ''}`}>
                                            + Choose file
                                        </label>}
                                        {(values?.aadhar?.name || uploadedDocuments?.aadhar?.url) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument("aadhar")}><img src='/images/close-icon.svg' /></button><a href={showImage(values?.aadhar) || uploadedDocuments?.aadhar?.url} target='_blank'><FileThumbnail name={values?.aadhar?.name || uploadedDocuments?.aadhar?.filename} /> {values?.aadhar?.name || uploadedDocuments?.aadhar?.filename}</a></div>}
                                        <input
                                            name='aadhar'
                                            onChange={(e) => setValues({ ...values, aadhar: e.target.files[0] })}
                                            onBlur={handleBlur}
                                            accept="image/jpeg, image/png, application/pdf"
                                            type="file"
                                            hidden
                                            id="adhaar"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <label className='custom-label'>Pan Card</label>
                                    <div className='form_control'>
                                        {!values?.PAN?.name && !uploadedDocuments?.PAN?.url && <label htmlFor="PAN" className={`${style.upload} ${touched.PAN && errors.PAN ? 'border-danger' : ''}`}>
                                            + Choose file
                                        </label>}
                                        {(values?.PAN?.name || uploadedDocuments?.PAN?.url) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument("PAN")}><img src='/images/close-icon.svg' /></button><a href={showImage(values?.aadhar) || uploadedDocuments?.PAN?.url} target='_blank'><FileThumbnail name={values?.PAN?.name || uploadedDocuments?.PAN?.filename} /> {values?.PAN?.name || uploadedDocuments?.PAN?.filename}</a></div>}
                                        <input
                                            name='PAN'
                                            onChange={(e) => setValues({ ...values, PAN: e.target.files[0] })}
                                            onBlur={handleBlur}
                                            accept="image/jpeg, image/png, application/pdf"
                                            type="file"
                                            hidden
                                            id="PAN"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <label className='custom-label'>Resume</label>
                                    <div>
                                        {!values?.resume?.name && !uploadedDocuments?.resume?.url && <label htmlFor="resume" className={`${style.upload} ${touched.resume && errors.resume ? 'border-danger' : ''}`}>
                                            + Choose file
                                        </label>}
                                        {(values?.resume?.name || uploadedDocuments?.resume?.url) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument("resume")}><img src='/images/close-icon.svg' /></button><a href={showImage(values?.aadhar) || uploadedDocuments?.resume?.url} target='_blank'><FileThumbnail name={values?.resume?.name || uploadedDocuments?.resume?.filename} /> {values?.resume?.name || uploadedDocuments?.resume?.filename}</a></div>}
                                        <input
                                            name='resume'
                                            onChange={(e) => setValues({ ...values, resume: e.target.files[0] })}
                                            onBlur={handleBlur}
                                            accept="image/jpeg, image/png, application/pdf"
                                            type="file"
                                            hidden
                                            id="resume"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <label className='custom-label'>Certificate/ Achievement</label>
                                    <div>
                                        {!values?.certificate?.name && !uploadedDocuments?.certificate?.url && <label htmlFor="certificate" className={`${style.upload} ${touched.certificate && errors.certificate ? 'border-danger' : ''}`}>
                                            + Choose file
                                        </label>}
                                        {(values?.certificate?.name || uploadedDocuments?.certificate?.url) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument("certificate")}><img src='/images/close-icon.svg' /></button><a href={showImage(values?.aadhar) || uploadedDocuments?.aadhar?.url} target='_blank'><FileThumbnail name={values?.certificate?.filename || values?.certificate?.name || uploadedDocuments?.certificate?.filename} /> {values?.certificate?.name || uploadedDocuments?.certificate?.filename}</a></div>}
                                        <input
                                            name='certificate'
                                            onChange={(e) => setValues({ ...values, certificate: e.target.files[0] })}
                                            onBlur={handleBlur}
                                            accept="image/jpeg, image/png, application/pdf"
                                            type="file"
                                            hidden
                                            id="certificate"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`nav-buttons ${style.nextPrev}`}>
                            <ButtonUi text="Previous" callBack={() => router.push("/onboard/qualification")} cssClass='btnuiplain' />
                            <ButtonUi text="Next" callBack={() => handleSubmit()} cssClass='btnuiRounded' />
                        </div>
                    </div>
                </div>
            </div>
        </section>)}
    </>
    )
}