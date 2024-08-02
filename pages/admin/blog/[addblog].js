import Layout from '@/components/Layout/Layout'
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import * as yup from "yup";
import style from '../../../styles/blog.module.scss'
import { Editor } from "@tinymce/tinymce-react";
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import { instance } from '@/utils/Apiconfig';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';

export default function AddBlog({ blogData, categories }) {

  const router = useRouter();
  const [blogFill, setBlogFill] = useState(blogData || null)
  const [blogCategoryList, setBlogCategoryList] = useState(categories || []);
  const getQueryParams = router.query.addblog;
  const editorRef = useRef();
  const [featuredImage, setFeaturedImage] = useState([])

  useEffect(() => {
    if (blogFill) {
      formik.setValues(blogFill)
    }
  }, [getQueryParams])

  const initialValues = { blogText: "", blogUrl: "", readTime: "", author: "", keyword: "", shortDes: "", featureImg: "", imageAlt: "", metaTitle: "", metaDes: "", date: "", category: "First", blogdescription: "", blogTags: "", }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: yup.object().shape({
      blogText: yup.string().required("Required"),
      blogUrl: yup.string().required("Required"),
      readTime: yup.string().required("Required"),
      author: yup.string().required("Required"),
      keyword: yup.string().required("Required"),
      shortDes: yup.string().required("Required"),
      featureImg: yup.string().required("Required"),
      imageAlt: yup.string().required("Required"),
      metaTitle: yup.string().required("Required"),
      metaDes: yup.string().required("Required"),
      date: yup.date().required(),
      category: yup.string().required("required"),
      blogTags: yup.string().required("Required"),
      blogdescription: yup.string().required("Required")
    }),

    onSubmit: async (values, action) => {
      delete values._id;
      if (getQueryParams === "addblog") {
        const postData = instance.post("/api/blog", values).then((res) => {
          action.resetForm();
          router.push("/admin/blog");
        });
      } else {
        const updateData = instance.put(`/api/blog?id=${getQueryParams}`, values).then((res) => {
          action.resetForm();
          router.push("/admin/blog");
        });
      }
    },
  });

  const handleEditorChange = (content, editorRef) => {
    formik.setFieldValue("blogdescription", content);
    const editorInstance = editorRef.current;
    if (editorInstance) {
      const editorContainer = editorInstance.editor.container;
      if (editorContainer) {
        if (content === "") {
          editorContainer.style.border = "2px solid red";
          touched.blogdescription = true
          errors.blogdescription = true
        }
      }
      else {
        if (editorContainer) {
          editorContainer.style.border = "";
        }
        touched.blogdescription = false
        delete errors.blogdescription;
      }
    }
  };

  const { errors, handleChange, handleBlur, handleSubmit, values, touched } = formik;

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
  return (<>
    <Head>
      <title>Portal || Add Blog</title>
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
      <section className={style.CreateBlogSection}>
        <div className={`${style.categoryHead} ${style.blogHead}`}>Blog page <Image className={style.arrow} src="/images/project-right.png" width={5} height={9} alt='category' /><span className={style.categoryName}>{getQueryParams !== 'addblog' ? `${blogData?.blogText}` : 'Create blog'}</span></div>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-xl-8 col-lg-6">
              <div className={style.bloagDetails}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Blog Title</label>
                      <input id="blogText" name="blogText" type="text" className={touched.blogText && errors.blogText ? `border-danger custom-input` : `custom-input`} placeholder="Blog Title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.blogText}
                      />
                      {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Blog URL</label>
                      <input id="blogUrl" name="blogUrl" type="text" className={touched.blogUrl && errors.blogUrl ? `border-danger custom-input` : `custom-input`} placeholder="URL is being generated from blog Title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.blogUrl}
                      />
                      {touched.blogUrl && errors.blogUrl ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-12 col-md-12">
                    <div className="form_control">
                      <label className="custom-label">Read Time</label>
                      <input id="readTime" name="readTime" type="text" className={touched.readTime && errors.readTime ? `border-danger custom-input` : `custom-input`} placeholder="Add read time like : 3 min"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.readTime}
                      />
                      {touched.readTime && errors.readTime ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-12 col-md-12">
                    <div className="form_control">
                      <label className="custom-label">Blog Author</label>
                      <input id="author" name="author" type="text" className={touched.author && errors.author ? `border-danger custom-input` : `custom-input`} placeholder="Blog Author"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.author}
                      />
                      {touched.author && errors.author ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Focused Keyword</label>
                      <input id="keyword" name="keyword" type="text" className={touched.keyword && errors.keyword ? `border-danger custom-input` : `custom-input`} placeholder="Enter focused keyword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.keyword}
                      />
                      {touched.keyword && errors.keyword ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label htmlFor="name" className="custom-label">Short Description</label>
                      <textarea name="shortDes" id="shortDes" className={touched.shortDes && errors.shortDes ? `border-danger custom-input` : `custom-input`} rows="5" placeholder="Short description limit 220 characters"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.shortDes}
                      ></textarea>
                      {touched.shortDes && errors.shortDes ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Blog Featured Image</label>
                      <div className="form input-group flex-nowrap">
                        <input id="file" name="file" readOnly type="text" multiple className={touched.file && errors.file ? `danger form-control` : `form-control`} placeholder="Select Featured Image"
                          onBlur={handleBlur}
                          value={values.featureImg}
                          required
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={() => openFileManager("featureImg")}>Select Image</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Featured Image Alt</label>
                      <input id="imageAlt" name="imageAlt" type="text" className={touched.imageAlt && errors.imageAlt ? `border-danger custom-input` : `custom-input`} placeholder="Enter alt text for featured image"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.imageAlt}
                      />
                      {touched.imageAlt && errors.imageAlt ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Add Description</label>
                      <Editor
                        ref={editorRef}
                        apiKey="ug1wqqg3fqn3g407nylwz3jl7p2oiqpvhum0vr6kbvlsyhrx"
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
                        onEditorChange={(content) => handleEditorChange(content, editorRef)}
                        value={values.blogdescription}

                      />
                      {touched.blogdescription && errors.blogdescription ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label className="custom-label">Meta Title</label>
                      <input id="metaTitle" name="metaTitle" type="text" className={touched.metaTitle && errors.metaTitle ? `border-danger custom-input` : `custom-input`} placeholder="Meta title limit 70 characters"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.metaTitle}
                      />
                      {touched.metaTitle && errors.metaTitle ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_control">
                      <label htmlFor="name" className="custom-label">Meta Description</label>
                      <textarea name="metaDes" className={touched.metaDes && errors.metaDes ? `border-danger custom-input` : `custom-input`} placeholder="Enter Short Description"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.metaDes}
                      ></textarea>
                      {touched.metaDes && errors.metaDes ? (<p className="invalid-tooltip">Required</p>) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6">
              <div className={style.bloagDetails}>
                <div className="form_control">
                  <label htmlFor="name" className="custom-label">Blog Category</label>
                  <select className={touched.category && errors.category ? `border-danger custom-input` : `custom-input`} id="category" name="category"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.category}
                  >
                    <option value="Select Category" disabled>Select Category</option>
                    {blogCategoryList.map((d, i) => {
                      return <option value={d.name} key={i}>{d.name}</option>;
                    })}
                  </select>
                  {touched.category && errors.category ? (<p className="invalid-tooltip">Required</p>) : null}
                </div>
                <div className="form_control">
                  <label htmlFor="name" className="custom-label">Blog Tags{" "}<span className={style.LabelSpan}>(Max. 20 tag)</span></label>
                  <textarea name="blogTags" id="blogTags" className={touched.blogTags && errors.blogTags ? `border-danger custom-input` : `custom-input`} rows="1" placeholder="Add tags"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.blogTags}
                  ></textarea>
                  {touched.blogTags && errors.blogTags ? (<p className="invalid-tooltip">Required</p>) : null}
                  <p className={style.TagsSuggation}>Suggested:{" "}<span className={style.TagsSpan}>Design, Illustration, Logo, UI...</span></p>
                </div>
                <div className="form_control">
                  <label htmlFor="name" className="custom-label">Timeline Date</label>
                  <input id="date" name="date" type="date" className={touched.date && errors.date ? `border-danger custom-input` : `custom-input`} placeholder="Meta title limit 70 characters"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.date}
                  />
                  {touched.date && errors.date ? (<p className="invalid-tooltip">Required</p>) : null}
                </div>
              </div>
            </div>
            <div className={style.SaveDeleteBtn}>
              <ButtonUi text={getQueryParams != "addblog" && getQueryParams != undefined ? "Update" : "Publish"} mode="textOnly" cssClass="btnuiplain" callBack={handleSubmit} />
              <ButtonUi text="Cancel" mode="textOnly" cssClass="btnui-black" callBack={() => router.push("/admin/blog")} />
            </div>
          </div>
        </form>
      </section>
    </Layout>
  </>)
}

export async function getServerSideProps(context) {

  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  const ID = context.query.addblog
  const apiEndpoints = [
    { key: 'blogData', endpoint: `/api/blog?id=${ID}` },
    { key: 'categories', endpoint: `/api/blogcategory` }
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