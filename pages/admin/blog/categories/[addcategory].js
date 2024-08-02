import React, { useEffect, useState } from 'react'
import styles from "../../../../styles/blog.module.scss"
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Image from 'next/image';
import { useFormik } from 'formik';
import * as yup from "yup";
import { instance } from '@/utils/Apiconfig';
import Head from 'next/head';

const AddCategory = ({ categories }) => {

  const router = useRouter();
  const categorySlug = router.query.addcategory;
  const [categoryData] = useState(categories || [])

  useEffect(() => {
    if (categories) {
      delete categories._id
      formik.setValues(categories)
    }
  }, [categorySlug])

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Required"),
    }),
    onSubmit: async (values, action) => {
      if (categorySlug === "addcategory") {
        const postData = instance.post("/api/blogcategory", values).then((res) => {
          action.resetForm();
          router.push("/admin/blog/categories");
        });
      } else {
        const updateData = instance.put(`/api/blogcategory?id=${categorySlug}`, values).then((res) => {
          action.resetForm();
          router.push("/admin/blog/categories");
        });
      }
    },
  });

  return (<>
    <Head>
      <title>Portal || Add Category</title>
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
      <div>
        <div className={styles.categoryHead}>Categories Page <Image className={styles.arrow} src="/images/project-right.png" width={5} height={9} alt='category' /><span className={styles.categoryName}>{
          categorySlug !== 'addcategory' ? `${categoryData.name}` : 'Add categories'
        }</span></div>
        <div>
          <form onSubmit={formik.handleSubmit}>
            <div className={styles.categoryBox}>
              <div className="row">
                <div className="col-lg-12 col-md-12 col-12">
                  <div className="form_control">
                    <label className="custom-label">Name</label>
                    <input
                      type="text"
                      placeholder='Enter category name'
                      name="name"
                      id='name'
                      aria-describedby="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`custom-input ${formik.touched.name && formik.errors?.name ? 'border-danger' : ''}`}
                    />
                    {formik.touched.name && formik.errors?.name ? <div className="invalid-tooltip">{formik.errors?.name}</div> : <></>}
                    <p className={styles.line}>The name is how it appears on your site.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.submitBtn}>
              <ButtonUi cssClass="btnuiplain" text="Cancel" type='button' callBack={() => router.push("/admin/blog/categories")} />
              <div>
                <ButtonUi cssClass="btnuiRounded" text={`${categorySlug === 'addcategory' ? "Add category" : "Save Changes"}`} type='submit' />
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  </>
  )
}
export default AddCategory
export async function getServerSideProps(context) {

  const ID = context.query.addcategory

  if (ID !== "addcategory" && ID !== "undefined") {
    const req = context.req;
    const dev = process.env.NODE_ENV !== 'production';
    const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
    const apiEndpoints = [
      { key: 'categories', endpoint: `/api/blogcategory?id=${ID}` }
    ];

    const data = {};
    let errorOccurred = false;

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
    return { props: {} };
  }
}