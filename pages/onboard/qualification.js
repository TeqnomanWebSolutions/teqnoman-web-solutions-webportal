import React, { useEffect, useState } from 'react';
import style from '../../styles/onboard.module.scss'
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useAuth } from '@/Hooks/useAuth';

export default function Qualification() {

    const router = useRouter();
    const { loading, user } = useAuth()

    function getQualificationData() {
        const fetch = instance.get(`/api/employee_qualification?id=${user?.id}`).then((res) => {
            if (res.data) {
                formik.setFieldValue("qualification", res.data.length === 0 ? [{ institute_name: "", course_name: "", percentage: "", start_year: "", end_year: "" }] : res.data);
            }
        })
    }

    useEffect(() => {
        if (user.id) {
            getQualificationData();
        }
    }, [user]);

    const initialValues = {
        qualification: [{ institute_name: "", course_name: "", percentage: "", start_year: "", end_year: "" }]
    }

    const generalDetailSchema = yup.object().shape({
        qualification: yup.array(
            yup.object().shape({
                institute_name: yup.string().required("Required"),
                course_name: yup.string().required("Required"),
                percentage: yup.number().positive().typeError("Not a valid positive number").required("Required"),
                start_year: yup.date().max(new Date().getFullYear(), "Invalid Year").typeError("Invalid Year").required("Required"),
                end_year: yup.date().max(new Date().getFullYear(), "Invalid Year").typeError("Invalid Year").required("Required"),
            })
        )
    })

    const getFieldError = (fieldName, index) => {
        return (
            formik.touched.qualification && formik.touched.qualification[index] &&
            formik.touched.qualification[index][fieldName] &&
            formik.errors.qualification && formik.errors.qualification[index] &&
            formik.errors.qualification[index][fieldName]
        );
    };

    function addMoreQualification() {
        formik.setFieldValue("qualification", [...values.qualification, { institute_name: "", course_name: "", percentage: "", start_year: "", end_year: "" }]);
    }

    async function deleteQualification(index) {
        let qualificationCopy = [...formik.values.qualification];
        let deletedQualification = qualificationCopy.splice(index, 1)[0];
        if (deletedQualification._id) {
            let res = await instance.delete(`/api/employee_qualification?id=${deletedQualification._id}`);
            if (res.status === 200) {
                formik.setFieldValue("qualification", qualificationCopy);
                toast.success("Qualification Deleted");
            }
        } else {
            formik.setFieldValue("qualification", qualificationCopy);
            toast.success("Qualification Deleted");
        }
    }

    const formik = useFormik({
        initialValues,
        validationSchema: generalDetailSchema,
        onSubmit: async () => {
            if (values.qualification.length != 0) {
                values.qualification.map(async (d) => {
                    let post_id = d._id;
                    if (post_id) {
                        let data = {
                            employee_id: user.id,
                            institute_name: d.institute_name,
                            course_name: d.course_name,
                            percentage: d.percentage,
                            start_year: d.start_year,
                            end_year: d.end_year
                        }
                        let res = await instance.put(`/api/employee_qualification?id=${d._id}`, data);
                    } else {
                        let data = {
                            employee_id: user.id,
                            institute_name: d.institute_name,
                            course_name: d.course_name,
                            percentage: d.percentage,
                            start_year: d.start_year,
                            end_year: d.end_year
                        }
                        let res = await instance.post(`/api/employee_qualification`, data);
                    }
                })
            }
            getQualificationData();
            router.push("/onboard/upload-documents");
        }
    })
    const { errors, handleChange, handleBlur, handleSubmit, values, setValues, touched } = formik;
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
        ) :
            <section className={style.onboardForm}>
                <div className={style.stepContainer}>
                    <div className={`${style.formSection} ${style.active}`}>
                        <div className={style.genralDetail}>
                            <h2 className='custom-heading'>Qualification</h2>
                            <div className='custom-white-box'>
                                {formik.values.qualification.map((q, index) => <div className={`row ${style.newRow}`} key={index}>
                                    {index != 0 && <div className={style.addMore}>
                                        <button type='button' onClick={() => deleteQualification(index)} className='btn btnuiOrangeText'>Delete</button>
                                    </div>}
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Institute Name</label>
                                            <input
                                                name={`qualification[${index}].institute_name`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={q.institute_name}
                                                className={`custom-input ${getFieldError("institute_name", index) ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter institute name"
                                            />
                                            {getFieldError("institute_name", index) ? <div className="invalid-tooltip">{formik.errors.qualification[index]?.institute_name}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Course Name</label>
                                            <input
                                                name={`qualification[${index}].course_name`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={q.course_name}
                                                className={`custom-input ${getFieldError("course_name", index) ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter course name"
                                            />
                                            {getFieldError("course_name", index) ? <div className="invalid-tooltip">{formik.errors.qualification[index]?.course_name}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">CGPA/Percentage</label>
                                            <input
                                                name={`qualification[${index}].percentage`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={q.percentage}
                                                className={`custom-input ${getFieldError("percentage", index) ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter CGPA / percentage"
                                            />
                                            {getFieldError("percentage", index) ? <div className="invalid-tooltip">{formik.errors.qualification[index]?.percentage}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Start Year</label>
                                            <input
                                                name={`qualification[${index}].start_year`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={q.start_year}
                                                className={`custom-input ${getFieldError("start_year", index) ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Start Year"
                                            />
                                            {getFieldError("start_year", index) ? <div className="invalid-tooltip">{formik.errors.qualification[index]?.start_year}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">End Year</label>
                                            <input
                                                name={`qualification[${index}].end_year`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={q.end_year}
                                                className={`custom-input ${getFieldError("end_year", index) ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="End Year"
                                            />
                                            {getFieldError("end_year", index) ? <div className="invalid-tooltip">{formik.errors.qualification[index]?.end_year}</div> : <></>}
                                        </div>
                                    </div>
                                </div>)}
                                <div className={style.addMore}>
                                    <button type='button' onClick={addMoreQualification} className='btn btnuiOrangeText'>+ Add more education detail</button>
                                </div>
                            </div>
                            <div className={`nav-buttons ${style.nextPrev}`}>
                                <ButtonUi text="Previous" cssClass='btnuiplain' callBack={() => router.push("/onboard/")} />
                                <ButtonUi text="Next" cssClass='btnuiRounded' callBack={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>}
    </>)
}