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

export default function BankInformation() {

    const router = useRouter();
    const { loading, user } = useAuth()
    const initialValues = {
        account_holder_name: "", account_number: "", bank_name: "", branch_name: "", ifsc_code: "", pan_number: ""
    }

    const bankInfoSchema = yup.object().shape({
        account_holder_name: yup.string().required("Required"),
        account_number: yup.string().required("Required"),
        bank_name: yup.string().required("Required"),
        branch_name: yup.string().required("Required"),
        ifsc_code: yup.string().required("Required"),
        pan_number: yup.string().required("Required"),
    });

    const formik = useFormik({
        initialValues,
        validationSchema: bankInfoSchema,
        onSubmit: async () => {
            const bank_info = {
                account_holder_name: values.account_holder_name,
                account_number: values.account_number,
                bank_name: values.bank_name,
                branch_name: values.branch_name,
                ifsc_code: values.ifsc_code,
                pan_number: values.pan_number,
                employee_id: user.id
            }
            let res = await instance.put('/api/employee_bank_info', bank_info);
            if (res.status == 200) {
                toast.success("Enter Previous Employment Information");
                router.push("/onboard/prev-employee-info");
            } else {
                toast.error("Error while updating Bank Information");
            }
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
        </Head>   {loading ? (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        ) : (
            <section className={style.onboardForm}>
                <div className={style.stepContainer}>
                    <div className={`${style.formSection} ${style.active}`}>
                        <div className={style.bankInfo}>
                            <h2 className='custom-heading'>Bank Information</h2>
                            <div className='custom-white-box'>
                                <div className='row'>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Account Holder Name</label>
                                            <input
                                                name="account_holder_name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.account_holder_name}
                                                className={`custom-input ${touched.account_holder_name && errors.account_holder_name ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter account holder name"
                                            />
                                            {touched.account_holder_name && errors.account_holder_name ? <div className="invalid-tooltip">{errors.account_holder_name}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Account Number</label>
                                            <input
                                                name="account_number"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.account_number}
                                                className={`custom-input ${touched.account_number && errors.account_number ? 'border-danger' : ''}`}
                                                type="number"
                                                placeholder="Enter account number"
                                            />
                                            {touched.account_number && errors.account_number ? <div className="invalid-tooltip">{errors.account_number}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Bank Name</label>
                                            <input
                                                name="bank_name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.bank_name}
                                                className={`custom-input ${touched.bank_name && errors.bank_name ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter bank name"
                                            />
                                            {touched.bank_name && errors.bank_name ? <div className="invalid-tooltip">{errors.bank_name}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Branch Name</label>
                                            <input
                                                name="branch_name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.branch_name}
                                                className={`custom-input ${touched.branch_name && errors.branch_name ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter branch name"
                                            />
                                            {touched.branch_name && errors.branch_name ? <div className="invalid-tooltip">{errors.branch_name}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">IFSC Code</label>
                                            <input
                                                name="ifsc_code"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.ifsc_code}
                                                className={`custom-input ${touched.ifsc_code && errors.ifsc_code ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter IFSC code"
                                            />
                                            {touched.ifsc_code && errors.ifsc_code ? <div className="invalid-tooltip">{errors.ifsc_code}</div> : <></>}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-4">
                                        <div className='form_control'>
                                            <label className="custom-label">Tax Payer ID (PAN)</label>
                                            <input
                                                name="pan_number"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.pan_number}
                                                className={`custom-input ${touched.pan_number && errors.pan_number ? 'border-danger' : ''}`}
                                                type="text"
                                                placeholder="Enter tax ID"
                                            />
                                            {touched.pan_number && errors.pan_number ? <div className="invalid-tooltip">{errors.pan_number}</div> : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`nav-buttons ${style.nextPrev}`}>
                                <ButtonUi text="Previous" callBack={() => router.back()} cssClass='btnuiplain' />
                                <ButtonUi text="Next" cssClass='btnuiRounded' callBack={() => handleSubmit()} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>)}
    </>)
}