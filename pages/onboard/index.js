import React, { useEffect, useState } from 'react';
import style from '../../styles/onboard.module.scss'
import Head from 'next/head';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Image from 'next/image';
import { useFormik } from 'formik';
import * as yup from "yup";
import { useRouter } from 'next/router';
import { State, City } from 'country-state-city';
import { toast } from 'react-toastify';
import { instance } from '@/utils/Apiconfig';
import { useAuth } from '@/Hooks/useAuth';

const Onboard = () => {

    const router = useRouter();
    const { loading, user } = useAuth()
    const [selectedState, setSelectedState] = useState("");
    const [permanentState, setPermanentState] = useState("");
    const [currentProfileImg, setCurrentProfileImg] = useState("");

    useEffect(() => {
        setSelectedState(State.getStatesOfCountry('IN'));
        setPermanentState(State.getStatesOfCountry('IN'));
        if (user && user?.id) {
            instance.get(`/api/employees?id=${user?.id}`).then((res) => {
                setProfileImg(res.data.employee_profile);
                setCurrentProfileImg(res.data.employee_profile);
                formik.setValues({ ...res.data });
                if (res.data.current_state) {
                    setSelectedState(res.data.current_state);
                    res.data.same_as_current ? setPermanentState(res.data.current_state) : "";
                }
                if (res.data.permanent_state && !res.data.same_as_current) {
                    setPermanentState(res.data.permanent_state);
                }
            })
        }
    }, [user?.id]);

    const [profileImg, setProfileImg] = useState("/images/dummy-profile.png");
    const initialValues = {
        employee_profile: "", first_name: "", middle_name: "", last_name: "", employee_id: null, birth_date: "", contact_number: "", emergency_contact: "", email: "", gender: "", marital_status: "", religion: "", join_date: "", linkedin_profile_url: "", department: "", designation: "", blood_group: "", any_medical_issue: "", current_address_line_1: "", current_address_line_2: "", current_city: "", current_state: "", same_as_current: "", current_pincode: "", permanent_address_line_1: "", permanent_address_line_2: "", permanent_city: "", permanent_state: "", permanent_pincode: ""
    }
    const personalDetailSchema = yup.object().shape({
        first_name: yup.string().required("Required"),
        middle_name: yup.string().required("Required"),
        last_name: yup.string().required("Required"),
        birth_date: yup.date().required("Required"),
        contact_number: yup.string().required("Required"),
        emergency_contact: yup.string().required("Required"),
        gender: yup.string().required("Required"),
        marital_status: yup.string().required("Required"),
        religion: yup.string().required("Required"),
        join_date: yup.date().required("Required"),
        linkedin_profile_url: yup.string().required("Required").url("Enter a valid URL"),
        department: yup.string().required("Required"),
        designation: yup.string().required("Required"),
        blood_group: yup.string().required("Required"),
        any_medical_issue: yup.string().required("Required"),
        current_address_line_1: yup.string().required("Required"),
        current_city: yup.string().required("Required"),
        current_state: yup.string().required("Required"),
        current_pincode: yup.string().required("Required"),
        permanent_address_line_1: yup.string().required("Required"),
        permanent_city: yup.string().required("Required"),
        permanent_state: yup.string().required("Required"),
        permanent_pincode: yup.string().required("Required")
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: personalDetailSchema,
        onSubmit: async () => {
            const personal_detail = {
                same_as_current: values.same_as_current,
                employee_profile: values.employee_profile == undefined ? "" : values.employee_profile,
                first_name: values.first_name,
                middle_name: values.middle_name,
                last_name: values.last_name,
                employee_id: values.employee_id,
                birth_date: values.birth_date,
                contact_number: values.contact_number,
                emergency_contact: values.emergency_contact,
                gender: values.gender,
                marital_status: values.marital_status,
                religion: values.religion,
                join_date: values.join_date,
                linkedin_profile_url: values.linkedin_profile_url,
                department: values.department,
                designation: values.designation,
                blood_group: values.blood_group,
                any_medical_issue: values.any_medical_issue,
                current_address_line_1: values.current_address_line_1,
                current_address_line_2: values.current_address_line_2,
                current_city: values.current_city,
                current_state: values.current_state,
                current_pincode: values.current_pincode,
                permanent_address_line_1: values.permanent_address_line_1,
                permanent_address_line_2: values.permanent_address_line_2,
                permanent_city: values.permanent_city,
                permanent_state: values.permanent_state,
                permanent_pincode: values.permanent_pincode
            }
            if (values.employee_profile instanceof File) {
                if (profileImg != "/images/dummy-profile.png" && currentProfileImg && currentProfileImg?.startsWith("https://files.teqnomanweb.com")) {
                    let params = Object.fromEntries(new URLSearchParams(currentProfileImg));
                    let fileName = params.fileName;
                    await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${user.id}&fileName=${fileName}`);
                }
                let formData = new FormData();
                formData.append("image", values.employee_profile);
                let fileRes = await instance.post(`https://files.teqnomanweb.com/upload?path=employees/${user.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
                if (fileRes.status === 200) {
                    personal_detail.employee_profile = fileRes.data.image.uploaded_url
                }
            }
            if (user.id) {
                try {
                    let res = await instance.put(`/api/employees?emp_id=${user.id}`, { ...personal_detail });
                    if (res.status === 200) {
                        toast.success("Enter Qualification Detail");
                        router.push("/onboard/qualification");
                    }
                } catch (error) {
                    toast.error("Error while updating Personal Information");
                    console.error('Error:', error);
                }
            }
        },
        onReset: (values) => {
        },

    });

    const { errors, handleChange, handleBlur, handleSubmit, values, setValues, touched } = formik;
    const setPermanentData = (e) => {
        if (e.target.checked) {
            formik.setFieldValue("same_as_current", e.target.checked);
            formik.setFieldValue("permanent_address_line_1", values.current_address_line_1);
            formik.setFieldValue("permanent_address_line_2", values.current_address_line_2);
            formik.setFieldValue("permanent_city", values.current_city);
            formik.setFieldValue("permanent_state", values.current_state);
            formik.setFieldValue("permanent_pincode", values.current_pincode);
            setPermanentState(values.current_state);
        } else {
            formik.setFieldValue("same_as_current", '');
            formik.setFieldValue("permanent_address_line_1", '');
            formik.setFieldValue("permanent_address_line_2", '');
            formik.setFieldValue("permanent_city", '');
            formik.setFieldValue("permanent_state", '');
            formik.setFieldValue("permanent_pincode", '');
            setPermanentState('');
        }
    }

    const handleImageUpload = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            setProfileImg(reader.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    };

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
        </Head>
        {loading ? (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        ) : (
            <section className={style.onboardForm}>
                <div className={style.stepContainer}>
                    <div className={style.logo}>
                        <img src="../images/Teqnoman_Logo.svg" alt="onboard" />
                    </div>
                    <form>
                        <div className={`${style.formSection} ${style.active}`}>
                            <div className={style.personalDetail}>
                                <h2 className='custom-heading'>Personal Information</h2>
                                <div className="custom-white-box">
                                    <div className={style.profileImage}>
                                        <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={`${style.profileImg} ${touched.employee_profile && errors.employee_profile ? 'border-danger' : ''}`} />
                                        <input
                                            name='employee_profile'
                                            type="file"
                                            id="profile-image-upload"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => { setValues({ ...values, employee_profile: e.target.files[0] }); handleImageUpload(e) }}
                                            onBlur={handleBlur}
                                        />
                                        <label htmlFor="profile-image-upload">
                                            <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                                        </label>
                                    </div>
                                    <div className='row'>
                                        <div className="col-lg-4 col-md-4 position-relative">
                                            <div className="form_control">
                                                <label htmlFor='first_name' className="custom-label">First Name</label>
                                                <input
                                                    name="first_name"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.first_name}
                                                    placeholder="First name"
                                                    id='first_name'
                                                    aria-describedby="first_name"
                                                    className={`custom-input ${touched.first_name && errors.first_name ? 'border-danger' : ''}`} type="text"
                                                />
                                                {touched.first_name && errors.first_name ? <div className="invalid-tooltip">{errors.first_name}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='middle_name' className="custom-label">Middle Name</label>
                                                <input
                                                    name="middle_name"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.middle_name}
                                                    className={`custom-input ${touched.middle_name && errors.middle_name ? 'border-danger' : ''}`}
                                                    type="text"
                                                    placeholder="Middle name" />
                                                {touched.middle_name && errors.middle_name ? <div className="invalid-tooltip">{errors.middle_name}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='last_name' className="custom-label">Last Name</label>
                                                <input
                                                    name="last_name"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.last_name}
                                                    className={`custom-input ${touched.last_name && errors.last_name ? 'border-danger' : ''}`}
                                                    type="text"
                                                    placeholder="Last name"
                                                />
                                                {touched.last_name && errors.last_name ? <div className="invalid-tooltip">{errors.last_name}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor="birth_date" className="custom-label">Birth Date</label>
                                                <input
                                                    name="birth_date"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.birth_date}
                                                    className={`custom-input ${touched.birth_date && errors.birth_date ? 'border-danger' : ''}`}
                                                    type="date"
                                                />
                                                {touched.birth_date && errors.birth_date ? <div className="invalid-tooltip">{errors.birth_date}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor="email" className="custom-label">E-mail</label>
                                                <input
                                                    name="email"
                                                    value={user?.email}
                                                    className={`custom-input `}
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    readOnly
                                                />
                                                {touched.email && errors.email ? <div className="invalid-tooltip">{errors.email}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='contact_number' className="custom-label">Contact No.</label>
                                                <input
                                                    name="contact_number"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.contact_number}
                                                    className={`custom-input ${touched.contact_number && errors.contact_number ? 'border-danger' : ''}`}
                                                    type="tel"
                                                    placeholder="+91 9876543210"
                                                />
                                                {touched.contact_number && errors.contact_number ? <div className="invalid-tooltip">{errors.contact_number}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='emergency_contact' className="custom-label">Emergency Contact No.</label>
                                                <input
                                                    name="emergency_contact"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.emergency_contact}
                                                    className={`custom-input ${touched.emergency_contact && errors.emergency_contact ? 'border-danger' : ''}`}
                                                    type="tel"
                                                    placeholder="+91 0123456789"
                                                />
                                                {touched.emergency_contact && errors.emergency_contact ? <div className="invalid-tooltip">{errors.emergency_contact}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='gender' className="custom-label">Gender</label>
                                                <select
                                                    name="gender"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.gender}
                                                    className={`custom-select ${touched.gender && errors.gender ? 'border-danger' : ''}`}
                                                >
                                                    <option value={""}>Select Gender</option>
                                                    <option value={"Male"}>Male</option>
                                                    <option value={"Female"}>Female</option>
                                                </select>
                                                {touched.gender && errors.gender ? <div className="invalid-tooltip">{errors.gender}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='marital_status' className="custom-label">Marital Status</label>
                                                <select
                                                    name="marital_status"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.marital_status}
                                                    className={`custom-select ${touched.marital_status && errors.marital_status ? 'border-danger' : ''}`}
                                                >
                                                    <option value={""}>Select Marital Status</option>
                                                    <option value={"Single"}>Single</option>
                                                    <option value={"Married"}>Married</option>
                                                </select>
                                                {touched.marital_status && errors.marital_status ? <div className="invalid-tooltip">{errors.marital_status}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='religion' className="custom-label">Religion</label>
                                                <select
                                                    name="religion"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.religion}
                                                    className={`custom-select ${touched.religion && errors.religion ? 'border-danger' : ''}`}
                                                >
                                                    <option value={""}>Select Religion</option>

                                                    <option value={"Hindu"}>Hindu</option>
                                                    <option value={"Muslim"}>Muslim</option>
                                                    <option value={"Christian"}>Christian</option>
                                                    <option value={"Buddhist"}>Buddhist</option>
                                                    <option value={"Sikh"}>Sikh</option>
                                                    <option value={"Jain"}>Jain</option>
                                                    <option value={"Parsi"}>Parsi</option>
                                                    <option value={"Other"}>Other</option>
                                                </select>
                                                {touched.religion && errors.religion ? <div className="invalid-tooltip">{errors.religion}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='join_date' className="custom-label">Joining Date</label>
                                                <input
                                                    name="join_date"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.join_date}
                                                    type="date"
                                                    className={`custom-input ${touched.join_date && errors.join_date ? 'border-danger' : ''}`}
                                                />
                                                {touched.join_date && errors.join_date ? <div className="invalid-tooltip">{errors.join_date}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='linkedin_profile_url' className="custom-label">LinkedIn Profile</label>
                                                <input
                                                    name="linkedin_profile_url"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.linkedin_profile_url}
                                                    type="url"
                                                    className={`custom-input ${touched.linkedin_profile_url && errors.linkedin_profile_url ? 'border-danger' : ''}`}
                                                    placeholder="Add your profile URL" />
                                                {touched.linkedin_profile_url && errors.linkedin_profile_url ? <div className="invalid-tooltip">{errors.linkedin_profile_url}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='department' className="custom-label">Department</label>
                                                <select
                                                    name="department"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.department}
                                                    className={`custom-select ${touched.department && errors.department ? 'border-danger' : ''}`}
                                                >
                                                    <option value={""}>Select Department</option>

                                                    <option value={"UI/UX"}>UI/UX</option>
                                                    <option value={"Web Development"}>Web Development</option>
                                                    <option value={"Digital Marketing"}>Digital Marketing</option>
                                                    <option value={"Human Resource"}>Human Resource</option>
                                                </select>
                                                {touched.department && errors.department ? <div className="invalid-tooltip">{errors.department}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='designation' className="custom-label">Designation</label>
                                                <input
                                                    name="designation"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.designation}
                                                    type="text"
                                                    className={`custom-input ${touched.designation && errors.designation ? 'border-danger' : ''}`}
                                                    placeholder='Add your designation'
                                                />
                                                {touched.designation && errors.designation ? <div className="invalid-tooltip">{errors.designation}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='blood_group' className="custom-label">Blood Group</label>
                                                <select
                                                    name="blood_group"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.blood_group}
                                                    className={`custom-select ${touched.blood_group && errors.blood_group ? 'border-danger' : ''}`}
                                                >
                                                    <option value={""}>Select Blood Group</option>

                                                    <option value={"A positive (A+)"}>A positive (A+)</option>
                                                    <option value={"A negative (A-)"}>A negative (A-)</option>
                                                    <option value={"B positive (B+)"}>B positive (B+)</option>
                                                    <option value={"B negative (B-)"}>B negative (B-)</option>
                                                    <option value={"AB positive (AB+)"}>AB positive (AB+)</option>
                                                    <option value={"AB negative (AB-)"}>AB negative (AB-)</option>
                                                    <option value={"O positive (O+)"}>O positive (O+)</option>
                                                    <option value={"O negative (O-)"}>O negative (O-)</option>
                                                </select>
                                                {touched.blood_group && errors.blood_group ? <div className="invalid-tooltip">{errors.blood_group}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <label htmlFor='any_medical_issue' className="custom-label">Any Medical Issue?</label>
                                                <input
                                                    name="any_medical_issue"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.any_medical_issue}
                                                    type="text"
                                                    className={`custom-input ${touched.any_medical_issue && errors.any_medical_issue ? 'border-danger' : ''}`}
                                                    placeholder='If yes, expalin in short OR type NO'
                                                />
                                                {touched.any_medical_issue && errors.any_medical_issue ? <div className="invalid-tooltip">{errors.any_medical_issue}</div> : <></>}
                                            </div>
                                        </div>
                                        <label className="custom-label">Current Address</label>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <input
                                                    name="current_address_line_1"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.current_address_line_1}
                                                    className={`custom-input ${touched.current_address_line_1 && errors.current_address_line_1 ? 'border-danger' : ''}`}
                                                    placeholder="Address line 1"
                                                />
                                                {touched.current_address_line_1 && errors.current_address_line_1 ? <div className="invalid-tooltip">{errors.current_address_line_1}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <input
                                                    name="current_address_line_2"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.current_address_line_2}
                                                    className={`custom-input ${touched.current_address_line_2 && errors.current_address_line_2 ? 'border-danger' : ''}`}
                                                    placeholder="Address line 2"
                                                />
                                                {touched.current_address_line_2 && errors.current_address_line_2 ? <div className="invalid-tooltip">{errors.current_address_line_2}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <select
                                                    name="current_state"
                                                    id="current_state"
                                                    value={values.current_state}
                                                    onChange={(e) => { handleChange(e); setSelectedState(e.target.value) }}
                                                    onBlur={(e) => { handleChange(e); setSelectedState(e.target.value) }}
                                                    className={` custom-input ${errors.current_state && touched.current_state ? 'border-danger' : ''}`}
                                                >
                                                    <option value="">Select State</option>
                                                    {State.getStatesOfCountry('IN').map((d, key) => {
                                                        return (<option key={key} value={d.isoCode}>{d.name}</option>)
                                                    })}
                                                </select>
                                                {touched.current_state && errors.current_state ? <div className="invalid-tooltip">{errors.current_state}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <select
                                                    name="current_city"
                                                    id="current_city"
                                                    value={values.current_city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={` custom-input ${errors.current_city && touched.current_city ? 'border-danger' : ''}`}
                                                >
                                                    <option value="" selected disabled>Select City</option>
                                                    {City.getCitiesOfState("IN", selectedState).map((d, key) => {
                                                        return (<option key={key} value={d.name}>{d.name}</option>)
                                                    })}
                                                </select>
                                                {touched.current_city && errors.current_city ? <div className="invalid-tooltip">{errors.current_city}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <input
                                                    name="current_pincode"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.current_pincode}
                                                    type="number"
                                                    className={`custom-input ${touched.current_pincode && errors.current_pincode ? 'border-danger' : ''}`}
                                                    placeholder="Pincode"
                                                />
                                                {touched.current_pincode && errors.current_pincode ? <div className="invalid-tooltip">{errors.current_pincode}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="form_control">
                                            <input
                                                name="same_as_current"
                                                onChange={(e) => { setPermanentData(e) }}
                                                onBlur={(e) => { setPermanentData(e) }}
                                                type="checkbox"
                                                id="same_as_current"
                                                className='custom-checkbox'
                                                checked={values.same_as_current}
                                            />
                                            <label htmlFor="same_as_current" className={style.addressCheck}> Same as current address</label>
                                            {touched.same_address && errors.same_address ? <div className="invalid-tooltip">{errors.same_address}</div> : <></>}
                                        </div>

                                        <label className="custom-label">Permanent Address</label>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <input
                                                    name="permanent_address_line_1"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.permanent_address_line_1}
                                                    className={`custom-input ${touched.permanent_address_line_1 && errors.permanent_address_line_1 ? 'border-danger' : ''}`}
                                                    placeholder="Address line 1"
                                                />
                                                {touched.permanent_address_line_1 && errors.permanent_address_line_1 ? <div className="invalid-tooltip">{errors.permanent_address_line_1}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="form_control">
                                                <input
                                                    name="permanent_address_line_2"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.permanent_address_line_2}
                                                    className={`custom-input ${touched.permanent_address_line_2 && errors.permanent_address_line_2 ? 'border-danger' : ''}`}
                                                    placeholder="Address line 2"
                                                />
                                                {touched.permanent_address_line_2 && errors.permanent_address_line_2 ? <div className="invalid-tooltip">{errors.permanent_address_line_2}</div> : <></>}
                                            </div>
                                        </div>

                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <select
                                                    name="permanent_state"
                                                    id="permanent_state"
                                                    value={values.permanent_state}
                                                    onChange={(e) => { handleChange(e); setPermanentState(e.target.value) }}
                                                    onBlur={(e) => { handleChange(e); setPermanentState(e.target.value) }}
                                                    className={` custom-input ${errors.permanent_state && touched.permanent_state ? 'border-danger' : ''}`}
                                                >
                                                    <option value="">Select State</option>
                                                    {State.getStatesOfCountry('IN').map((d, key) => {
                                                        return (<option key={key} value={d.isoCode}>{d.name}</option>)
                                                    })}
                                                </select>
                                                {touched.permanent_state && errors.permanent_state ? <div className="invalid-tooltip">{errors.permanent_state}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <select
                                                    name="permanent_city"
                                                    id="permanent_city"
                                                    value={values.permanent_city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={` custom-input ${errors.permanent_city && touched.permanent_city ? 'border-danger' : ''}`}
                                                >
                                                    <option value="" selected disabled>Select City</option>
                                                    {City.getCitiesOfState("IN", permanentState).map((d, key) => {
                                                        return (<option key={key} value={d.name}>{d.name}</option>)
                                                    })}
                                                </select>
                                                {touched.permanent_city && errors.permanent_city ? <div className="invalid-tooltip">{errors.permanent_city}</div> : <></>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4">
                                            <div className="form_control">
                                                <input
                                                    name="permanent_pincode"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    value={values.permanent_pincode}
                                                    type="number"
                                                    className={`custom-input ${touched.permanent_pincode && errors.permanent_pincode ? 'border-danger' : ''}`}
                                                    placeholder="Pincode"
                                                />
                                                {touched.permanent_pincode && errors.permanent_pincode ? <div className="invalid-tooltip">{errors.permanent_pincode}</div> : <></>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`nav-buttons ${style.nextBtn}`}>
                                    <ButtonUi text="Next" cssClass="btnuiRounded" callBack={() => handleSubmit()} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>)}
    </>)
}

export default Onboard