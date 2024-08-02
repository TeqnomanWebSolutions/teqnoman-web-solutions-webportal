import Layout from "@/components/Layout/Layout";
import Head from "next/head";
import 'react-tabs/style/react-tabs.css';
import style from '../../../styles/profile.module.scss'
import { useEffect, useState } from "react";
import Image from "next/image";
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { useFormik } from "formik";
import * as yup from "yup";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { instance } from "@/utils/Apiconfig";
import { useRouter } from "next/router";
import bcrypt from 'bcryptjs';
export default function Profile() {
  const [profileImg, setProfileImg] = useState();
  const [currentProfileImg, setCurrentProfileImg] = useState("");
  const user = useSession().data?.user;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      instance.get(`/api/admins?id=${user?.id}`).then((res) => {
        if (res.data) {
          delete res.data.password;
          delete res.data._id;
          formik.setValues(res.data);
          setProfileImg(res.data?.profileImage || "/images/dummy-profile.png")
        }
      })
    }
  }, [user?.id]);

  const handleImageUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImg(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };


  function showImage(fileObj) {
    if (fileObj instanceof File) {
      return URL.createObjectURL(fileObj)
    } else {
      return fileObj.url;
    }
  }

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    },
    validationSchema: yup.object().shape({
      first_name: yup.string().required("Required"),
      last_name: yup.string().required("Required"),
      email: yup.string().email().required('Required'),
      password: yup.string().required('Required')
    }),

    onSubmit: async (values) => {
      try {
        const emailCheck = await instance.get(`/api/employees`);
        const isEmailExists = emailCheck.data.some(employee => employee.email === formik.values.email);
        if (isEmailExists) {
          alert('Email already exists!!');
          return;
        }
        setLoading(true);
        await instance.put(`/api/admins?id=${user.id}`, values);
        toast.success('Profile updated successfully');
        if (user.id) {
          try {
            if (values.profileImage instanceof File) {
              if (profileImg != "/images/dummy-profile.png" && currentProfileImg.startsWith("https://files.teqnomanweb.com")) {
                let params = Object.fromEntries(new URLSearchParams(currentProfileImg));
                let fileName = params.fileName;
                await instance.delete(`https://files.teqnomanweb.com/media?path=admin/${user.id}&fileName=${fileName}`);
              }
              let formik = new FormData();
              formik.append("image", values.profileImage);
              let fileRes = await instance.post(`https://files.teqnomanweb.com/upload?path=admin/${user.id}`, formik, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
              if (fileRes.status === 200) {
                values.profileImage = fileRes.data.image.uploaded_url
              }
            }
            const hashedPassword = await bcrypt.hash(values.password, 10);
            let res = await instance.put(`/api/admins?id=${user.id}`, { ...values, password: hashedPassword });

          } catch (error) {
            toast.error("Error while updating Admin profile");
            console.error('Error:', error);
          }
        }


      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile. Please try again.');
      } finally {
        setLoading(false);
      }

    },
  });


  return (<>
    <Head>
      <title>Portal || Admin Profile</title>
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
    <Layout>
      {loading ? (<div className="spinner-container">
        <div className="spinner"></div>
      </div>) : <>
        <h2 className="page-title">Admin Profile</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className={style.borderBox}>
            <div className={style.profileImage}>
              <div className={style.profileInfo}>
                <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                  e.target.src = `https://placehold.co/100x100/ff701f/fff?text=${formik.values.first_name.charAt(0).toUpperCase()}${formik.values.last_name.charAt(0).toUpperCase()}`;
                }} />

                <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={(e) => { formik.setValues({ ...formik.values, profileImage: e.target.files[0] }); handleImageUpload(e) }} />
                <label htmlFor="profile-image-upload">
                  <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                </label>
              </div>
              <div className={style.aboutProfile}>
                <p className={style.profileName}>{formik.values.first_name} {formik.values.last_name}</p>
                <p className={style.profileDesignation}>{formik.values.designation}</p>
              </div>
            </div>
            <div className='row'>
              <div className="col-lg-6 col-sm-6 position-relative">
                <div className="form_control">
                  <label htmlFor='first_name' className="custom-label">First Name</label>
                  <input
                    name="first_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.first_name}
                    placeholder="First name"
                    id='first_name'
                    aria-describedby="first_name"
                    className={`custom-input ${formik.touched.first_name && formik.errors.first_name ? 'border-danger' : ''}`} type="text"
                  />
                  {formik.touched.first_name && formik.errors.first_name && <div className="invalid-tooltip">{formik.errors?.first_name}</div>}
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="form_control">
                  <label htmlFor='last_name' className="custom-label">Last Name</label>
                  <input
                    name="last_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.last_name}
                    className={`custom-input ${formik.touched.last_name && formik.errors?.last_name ? 'border-danger' : ''}`}
                    type="text"
                    placeholder="Last name"
                  />
                  {formik.touched.last_name && formik.errors?.last_name ? <div className="invalid-tooltip">{formik.errors?.last_name}</div> : <></>}
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="form_control">
                  <label htmlFor="email" className="custom-label">Email</label>
                  <input
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`custom-input ${formik.touched.email && formik.errors?.email ? 'border-danger' : ''}`}
                    type="email"
                    placeholder="Enter your email"
                  />
                  {formik.touched.email && formik.errors?.email ? <div className="invalid-tooltip">{formik.errors.email}</div> : <></>}
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="form_control">
                  <label htmlFor="password" className="custom-label">Password</label>
                  <input
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`custom-input ${formik.touched.password && formik.errors?.password ? 'border-danger' : ''}`}
                    type="password"
                    placeholder="Password"
                  />
                  {formik.touched.password && formik.errors?.password ? <div className="invalid-tooltip">{formik.errors?.password}</div> : <></>}
                </div>
              </div>


            </div>
          </div>
          <div className={style.save}>
            <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' callBack={formik.handleSubmit} />
          </div>
        </form>
      </>}
    </Layout>
  </>);
}
