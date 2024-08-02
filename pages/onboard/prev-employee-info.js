import React, { useEffect, useState } from 'react';
import style from '../../styles/onboard.module.scss'
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import FileThumbnail from '@/components/FileThumbnail/FileThumbnail';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useAuth } from '@/Hooks/useAuth';

export default function PrevEmployeeInformation() {

    const router = useRouter();
    const { loading, user } = useAuth()

    async function getPrevData() {
        let res = await instance.get(`/api/employment_history?id=${user.id}`);
        if (res.data) {
            if (res?.data && res.data?.[0] && res.data?.[0]?.is_fresher == "true") {
                formik.setFieldValue("is_fresher", res.data?.[0]?.is_fresher);
                formik.setFieldValue("prevData", [{ company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }]);
            } else {
                formik.setFieldValue("is_fresher", res.data?.[0]?.is_fresher || "true");
                formik.setFieldValue("prevData", [...res.data]);
                if (res.data.length === 0) {
                    formik.setFieldValue("prevData", [{ company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }]);
                }
            }
        }
    }

    useEffect(() => {
        if (user?.id) {
            getPrevData();
        }
    }, [user])

    const initialValues = {
        is_fresher: 'true',
        prevData: [
            { company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }
        ]
    }

    const previousCompanySchema = yup.object().shape({
        is_fresher: yup.string().required("Required"),
        prevData: yup.array().when('is_fresher', {
            is: (value) => value === "false",
            then: () => yup.array().of(
                yup.object().shape({
                    company_name: yup.string().required("Required"),
                    role: yup.string().required("Required"),
                    employment_type: yup.string().required("Required"),
                    annual_package: yup.string().required("Required"),
                    join_date: yup.date().required("Required"),
                    resign_date: yup.date().required("Required"),
                    description: yup.string().required("Required"),
                    salary_slip: yup.mixed().required("Required"),
                    experience_letter: yup.mixed().required("Required")
                })
            ),
            otherwise: () => yup.array().of(
                yup.object().shape({
                    company_name: yup.string().notRequired(),
                    role: yup.string().notRequired(),
                    employment_type: yup.string().notRequired(),
                    annual_package: yup.string().notRequired(),
                    join_date: yup.date().notRequired(),
                    resign_date: yup.date().notRequired(),
                    description: yup.string().notRequired(),
                    salary_slip: yup.mixed().notRequired(),
                    experience_letter: yup.mixed().notRequired()
                })
            )
        })
    });

    function setFile(e, index, fieldName) {
        let prevValues = [...values.prevData];
        prevValues[index] = {
            ...prevValues[index],
            [fieldName]: e.target.files[0]
        };
        formik.setFieldValue("prevData", prevValues);
    }

    const getFieldError = (fieldName, index) => {
        return (
            formik.touched.prevData && formik.touched.prevData[index] &&
            formik.touched.prevData[index][fieldName] &&
            formik.errors.prevData && formik.errors.prevData[index] &&
            formik.errors.prevData[index][fieldName]
        );
    };

    const addMorePrevData = () => {
        formik.setFieldValue("prevData", [...values.prevData, { company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }])
    }

    const deletePrevData = async (index) => {
        let currentValue = formik.values.prevData[index];
        if (currentValue._id) {
            await deleteDocument(index, currentValue, "salary_slip");
            await deleteDocument(index, currentValue, "experience_letter");
            let res = await instance.delete(`/api/employment_history?id=${currentValue._id}`);
            if (res.status === 200) {
                let prevDataCopy = formik.values.prevData;
                prevDataCopy.splice(index, 1);
                formik.setFieldValue("prevData", prevDataCopy);
                toast.success("Experience Detail Deleted");
            }
        } else {
            let prevDataCopy = formik.values.prevData;
            prevDataCopy.splice(index, 1);
            formik.setFieldValue("prevData", prevDataCopy);
            toast.success("Experience Detail Deleted");
        }
        getPrevData();
    }

    async function deleteDocument(index, data, field) {
        let fileData = data[field];
        if (fileData instanceof File) {
            let prevValues = [...values.prevData];
            prevValues[index] = {
                ...prevValues[index],
                [field]: ""
            };
            formik.setFieldValue("prevData", prevValues);
        } else {
            await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${user.id}/documents&fileName=${fileData.name}`);
            await instance.delete(`/api/media?id=${fileData._id}`);
            await getPrevData();
        }
    }

    function showImage(fileObj) {
        if (fileObj instanceof File) {
            return URL.createObjectURL(fileObj)
        } else {
            return fileObj.url;
        }
    }

    async function setMedia(data) {
        let mediaArray = [];
        let salarySlip = data.filter((d) => d.fieldname === "salary_slip");
        let experienceLetter = data.filter((d) => d.fieldname === "experience_letter");
        if (salarySlip.length != 0) {
            let sendData = {
                type: salarySlip[0].mimetype,
                size: salarySlip[0].size,
                name: salarySlip[0].filename,
                url: salarySlip[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaArray.push({ name: "salary_slip", mediaId: res.data.insertedId })
            }
        }
        if (experienceLetter.length != 0) {
            let sendData = {
                type: experienceLetter[0].mimetype,
                size: experienceLetter[0].size,
                name: experienceLetter[0].filename,
                url: experienceLetter[0].uploaded_url
            }
            let res = await instance.post("/api/media", sendData);
            if (res.status) {
                mediaArray.push({ name: "experience_letter", mediaId: res.data.insertedId });
            }
        }
        return mediaArray;
    }

    const formik = useFormik({
        initialValues,
        validationSchema: previousCompanySchema,
        onSubmit: async () => {
            if (values.is_fresher === "true") {
                let reqData = {
                    ...values.prevData[0],
                    is_fresher: values.is_fresher,
                    employee_id: user.id
                }
                let res = await instance.post('/api/employment_history', reqData);
                if (res.status === 200) {
                    toast.success("Previous employment information saved.");
                } else {
                    toast.error("Error while saving previous employment information.");
                }
            } else {
                if (values.prevData.length != 0) {
                    let reqData = values.prevData.map(async (data) => {
                        let sendData = { ...data };
                        let formData = new FormData();
                        if (data.salary_slip instanceof File) {
                            formData.append("salary_slip", data.salary_slip);
                        } else {
                            sendData.salary_slip = data.salary_slip._id;
                        }
                        if (data.experience_letter instanceof File) {
                            formData.append("experience_letter", data.experience_letter);
                        } else {
                            sendData.experience_letter = data.experience_letter._id;
                        }
                        if (!!formData.entries().next().value) {
                            let fileRes = await instance.post(`https://files.teqnomanweb.com/documents?path=employees/${user.id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
                            if (fileRes.status === 200) {
                                let mediaIds = await setMedia(fileRes.data.documents);
                                mediaIds.forEach((media) => {
                                    if (media.name === "salary_slip") {
                                        sendData.salary_slip = media.mediaId;
                                    }
                                    if (media.name === "experience_letter") {
                                        sendData.experience_letter = media.mediaId;
                                    }
                                })
                            }
                        }
                        sendData.is_fresher = values.is_fresher;
                        sendData.employee_id = user.id;
                        return sendData;
                    });
                    reqData.map(async (data) => {
                        let item = await data;
                        if (item._id) {
                            let id = item._id;
                            delete item._id;
                            await instance.put(`/api/employment_history?id=${id}`, item);
                        } else {
                            await instance.post('/api/employment_history', item);
                        }
                    })
                }
            }
            await instance.put(`/api/employees?emp_id=${user.id}`, { status: 'active' }).then(async (res) => {
                await signOut({ redirect: false, });
            })
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
            <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.svg" />
            <link rel="apple-touch-icon-precomposed" href="/images/favicon.svg" />
            <meta name="title" property="og:title" content="Employee management system - Teqnoman Web Solutions" />
            <meta name="image" property="og:image" content="https://files.teqnomanweb.com/files/home/portal-meta-image.png" />
            <meta name="author" content="Teqnoman Web Solutions" />
        </Head>{loading ? (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        ) : (
            <section className={style.onboardForm}>
                <div className={style.stepContainer}>
                    <div className={`${style.formSection} ${style.active}`}>
                        <h2 className='custom-heading'>Previous Employment Information</h2>
                        <div className='custom-white-box'>
                            <div className="form_control">
                                <label className="custom-label">Select Employee History</label>
                            </div>
                            <div className="form_control">
                                <label className="custom-label" htmlFor="fresher">
                                    <input
                                        name="is_fresher"
                                        type="radio"
                                        value={true}
                                        id="fresher"
                                        checked={values.is_fresher == 'true'}
                                        onChange={(e) => {
                                            handleChange(e);
                                        }}
                                    /> Fresher
                                </label>

                                <label className="custom-label" htmlFor="experienced">
                                    <input
                                        type='radio'
                                        name="is_fresher"
                                        id='experienced'
                                        onChange={(e) => handleChange(e)}
                                        value={false}
                                        checked={values.is_fresher == 'false'}
                                    /> Experience
                                </label>
                            </div>
                            {values.is_fresher == 'true' ? (<p className='mb-5'>Well, You&apos;ll get experience here... </p>) :
                                (<>
                                    {formik.values.prevData.map((data, index) => <div className='row' key={`prevDataEmp${index}`}>
                                        {index != 0 && <div className={style.addMore}>
                                            <button type='button' className='btn btnuiOrangeText' onClick={() => deletePrevData(index)}>Delete</button>
                                        </div>}
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Company Name</label>
                                                <input
                                                    name={`prevData[${index}].company_name`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.company_name}
                                                    className={`custom-input ${getFieldError("company_name", index) ? 'border-danger' : ''}`}
                                                    type="text"
                                                    placeholder='Enter company name'
                                                />
                                                {getFieldError("company_name", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.company_name}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Role</label>
                                                <input
                                                    name={`prevData[${index}].role`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.role}
                                                    className={`custom-input ${getFieldError("role", index) ? 'border-danger' : ''}`}
                                                    type="text"
                                                    placeholder='Enter your role'
                                                />
                                                {getFieldError("role", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.role}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Employment Type</label>
                                                <select
                                                    name={`prevData[${index}].employment_type`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.employment_type}
                                                    className={`custom-select ${getFieldError("employment_type", index) ? 'border-danger' : ''}`}
                                                    placeholder="Select employment type"
                                                >
                                                    <option value="">Select Employment Type</option>
                                                    <option value="Part Time">Part Time</option>
                                                    <option value="Full Time">Full Time</option>
                                                    <option value="Freelance">Freelance</option>
                                                </select>
                                                {getFieldError("employment_type", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.employment_type}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Annual Package</label>
                                                <input
                                                    name={`prevData[${index}].annual_package`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.annual_package}
                                                    className={`custom-input ${getFieldError("annual_package", index) ? 'border-danger' : ''}`}
                                                    type="number"
                                                    placeholder='Enter LPA'
                                                />
                                                {getFieldError("annual_package", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.annual_package}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Join Date</label>
                                                <input
                                                    name={`prevData[${index}].join_date`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.join_date}
                                                    type="date"
                                                    className={`custom-input ${getFieldError("join_date", index) ? 'border-danger' : ''}`}
                                                />
                                                {getFieldError("join_date", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.join_date}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label className="custom-label">Resign Date</label>
                                                <input
                                                    name={`prevData[${index}].resign_date`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.resign_date}
                                                    type="date"
                                                    className={`custom-input ${getFieldError("resign_date", index) ? 'border-danger' : ''}`}
                                                />
                                                {getFieldError("resign_date", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.resign_date}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <label className="custom-label">Salary Slip</label>
                                                <div>
                                                    {!data?.salary_slip?.name && <label htmlFor={`salary_slip${index}`} className={`${style.upload} ${getFieldError("salary_slip", index) ? 'border-danger' : ''}`}>{"+ Choose file"}</label>}
                                                    {(data?.salary_slip?.name) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument(index, data, "salary_slip")}><img src='/images/close-icon.svg' /></button><a href={showImage(data?.salary_slip)} target='_blank'><FileThumbnail name={data?.salary_slip?.name} /> {data?.salary_slip?.name}</a></div>}
                                                    <input
                                                        name={`prevData[${index}].salary_slip`}
                                                        onChange={(e) => { setFile(e, index, "salary_slip") }}
                                                        onBlur={handleBlur}
                                                        accept="image/jpeg, image/png, application/pdf"
                                                        type="file"
                                                        hidden
                                                        id={`salary_slip${index}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <label className="custom-label">Experience Letter</label>
                                                <div>
                                                    {!data?.experience_letter?.name && <label htmlFor={`experience_letter${index}`} className={`${style.upload} ${getFieldError("experience_letter", index) ? 'border-danger' : ''}`}>{"+ Choose file"}</label>}
                                                    {(data?.experience_letter?.name) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument(index, data, "experience_letter")}><img src='/images/close-icon.svg' /></button><a href={showImage(data?.experience_letter)} target='_blank'><FileThumbnail name={data?.experience_letter?.name} /> {data?.experience_letter?.name}</a></div>}
                                                    <input
                                                        name={`prevData[${index}].experience_letter`}
                                                        onChange={(e) => { setFile(e, index, "experience_letter") }}
                                                        onBlur={handleBlur}
                                                        accept="image/jpeg, image/png, application/pdf"
                                                        type="file"
                                                        hidden
                                                        id={`experience_letter${index}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <div className="form_control">
                                                <label className="custom-label">Description</label>
                                                <textarea
                                                    name={`prevData[${index}].description`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={data.description}
                                                    rows={4}
                                                    className={`custom-input ${getFieldError("description", index) ? 'border-danger' : ''}`}
                                                    placeholder='Add description'
                                                />
                                                {getFieldError("description", index) ? <div className="invalid-tooltip">{formik.errors.prevData[index]?.description}</div> : <></>}
                                            </div>
                                        </div>
                                    </div>)}
                                    <div className={style.addMore}>
                                        <button type='button' onClick={addMorePrevData} className='btn btnuiOrangeText'>+ Add more employment information</button>
                                    </div>
                                </>)
                            }
                        </div>
                        <div className={`nav-buttons ${style.nextPrev}`}>
                            <ButtonUi text="Previous" callBack={() => router.push('/onboard/upload-documents')} cssClass='btnuiplain' />
                            <ButtonUi text="Submit" callBack={() => { handleSubmit(); }} cssClass='btnuiRounded' />
                        </div>
                    </div>
                </div>
            </section>)}
    </>)
}