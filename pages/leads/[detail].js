import Layout from '@/components/Layout/Layout'
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import styles from "../../styles/inquiry.module.scss";
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Head from 'next/head';
import { instance } from '@/utils/Apiconfig';
import { useRouter } from 'next/router';
import { Editor } from '@tinymce/tinymce-react';
import { useFormik } from 'formik';
import Multiselect from 'multiselect-react-dropdown';
import axios from 'axios';

export default function Careerinquiry({ blogData, employeeList }) {
  const editorRef = useRef();
  const [employees, setEmployeeList] = useState([]);
  const router = useRouter();
  const id = router.query.detail;
  useEffect(() => {
    let empLists = employeeList.map((emp) => { return { id: emp._id, name: `${emp.first_name} ${emp.last_name}` } });
    setEmployeeList(empLists);
    if (blogData) {
      let assign = [];
      blogData.assignee.map((d) => {
        let data = empLists.filter((emp) => emp.id === d);
        if (data.length != 0) {
          assign.push(data[0]);
        }
      })
      formik.setValues(blogData);
      formik.setFieldValue("assignee", assign);
    }
  }, [])

  const formik = useFormik({
    initialValues: {
      client_name: "",
      client_email: "",
      client_phone: "",
      project_name: "",
      project_description: "",
      project_type: "",
      assignee: [],
      project_files: [],
      inquiry_date: "",
      created_date: ""
    },
    onSubmit: async () => {
      if (id === "addlead") {
        values.created_date = new Date();
        values.assignee = values.assignee.map((assn) => assn.id);
        let res = instance.post(`/api/leads`, values);
      } else {
        delete values._id;
        values.assignee = values.assignee.map((assn) => assn.id);
        let res = instance.put(`/api/leads?id=${id}`, values);
      }
      router.push("/admin/leads");
    }
  })

  const { values, touched, errors, handleChange, handleBlur } = formik;

  const openFileManager = (field = null) => {
    const Flmngr = require("@flmngr/flmngr-react").default;
    if (Flmngr) {
      Flmngr.open({
        apiKey: "WrYOVz2j",
        urlFileManager: "https://files.teqnomanweb.com/flmngr",
        urlFiles: "https://files.teqnomanweb.com/files",
        isMultiple: false,
        acceptExtensions: [],
        onFinish: (files) => {
          if (typeof field === "string") {
            let filesData = values.project_files;
            formik.setFieldValue(field, [...filesData, files[0].url]);
          } else {
            editorRef.current.editor.insertContent(`<img src='${files[0].url}' />`);
          }
        },
      });
    }
  }
  const handleEditorChange = (content, editorRef) => {
    formik.setFieldValue("project_description", content);
    const editorInstance = editorRef.current;
    if (editorInstance) {
      const editorContainer = editorInstance.editor.container;
      if (editorContainer) {
        if (content === "") {
          editorContainer.style.border = "2px solid red";
        }
      }
      else {
        if (editorContainer) {
          editorContainer.style.border = "";
        }
        touched.project_description = false
        delete errors.project_description;
      }
    }
  };

  const setFile = (file) => {
    let paths = file.split(".");
    return paths[paths.length - 1];
  }

  return (<>
    <Head>
      <title>Portal || Career Inquiry</title>
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
      <h2 className="page-title">Lead Detail</h2>
      <div className='border p-3 rounded mb-5'>
        <form onSubmit={formik.handleSubmit}>
          <div className='row'>
            <div className='col-lg-4'>
              <div className="form_control">
                <label className="custom-label">Client Name</label>
                <input type="text" className={`custom-input`} placeholder="Client Name" value={values.client_name} id='client_name' name="client_name" onChange={handleChange} onBlur={handleBlur} disabled />
                {/* {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-4'>
              <div className="form_control">
                <label className="custom-label">Client Email</label>
                <input id='client_email' name="client_email" onChange={handleChange} value={values.client_email} onBlur={handleBlur} type="email" className={`custom-input`} placeholder="Blog Title" disabled />
                {/* {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-4'>
              <div className="form_control">
                <label className="custom-label">Client Phone</label>
                <input id='client_phone' name="client_phone" onChange={handleChange} onBlur={handleBlur} value={values.client_phone} type="number" className={`custom-input`} placeholder="Blog Title" disabled />
                {/* {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-3'>
              <div className="form_control">
                <label className="custom-label">Project Name</label>
                <input id='project_name' name="project_name" onChange={handleChange} onBlur={handleBlur} value={values.project_name} type="text" className={`custom-input`} placeholder="Blog Title" disabled />
                {/* {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-3'>
              <div className="form_control">
                <label className="custom-label">Project Type</label>
                <select className={`custom-input`} id='project_type' name="project_type" onChange={handleChange} onBlur={handleBlur} value={values.project_type} disabled>
                  <option value={''}>Select Project Type</option>
                  <option value={'design'}>Design</option>
                  <option value={'development'}>Development</option>
                  <option value={'both'}>Both</option>
                </select>
                {/* {touched.author && errors.author ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-3'>
              <div className="form_control">
                <label className="custom-label">Assignee</label>
                <Multiselect
                  options={employees}
                  selectedValues={values.assignee}
                  onSelect={(e) => formik.setFieldValue("assignee", e)}
                  onRemove={(e) => formik.setFieldValue("assignee", e)}
                  displayValue="name"
                  disable={true}
                />
              </div>
            </div>
            <div className='col-lg-3'>
              <div className="form_control">
                <label className="custom-label">Inquiry Date</label>
                <input id='inquiry_date' name="inquiry_date" onChange={handleChange} onBlur={handleBlur} type="date" value={values.inquiry_date} className={`custom-input`} placeholder="Blog Title" disabled />
                {/* {touched.blogText && errors.blogText ? (<p className="invalid-tooltip">Required</p>) : null} */}
              </div>
            </div>
            <div className='col-lg-12'>
              <label className="custom-label">Files</label>
              <div className='uploadFileContainer'>
                {values.project_files.length != 0 && values.project_files.map((file) => <div className='upload'>
                  <a href={file} target='_blank'>
                    <img src={setFile(file) === "pdf" ? '/images/pdf.svg' : file} alt='' />
                  </a>
                  {/* <div className='delete'>
                    <img src='/images/delete-icon.svg' alt='' />
                  </div> */}
                </div>)}
                {/* <div className='upload' onClick={() => openFileManager("project_files")}>UPLOAD FILE</div> */}
              </div>
            </div>
            <div className="col-lg-12">
              <label className="custom-label">Project Description</label>
              <div className="form_control">
                <Editor
                  ref={editorRef}
                  apiKey="hmp8mbko6xq891862esmnorncaghdz5lds2hril3tbn7wp1v"
                  disabled={true}
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
                  value={values.project_description}
                />
                {touched.blogdescription && errors.blogdescription ? (<p className="invalid-tooltip">Required</p>) : null}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  </>)
}

export async function getServerSideProps(context) {

  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  const ID = context.query.detail;
  let result = null;
  if (ID != "addlead" && ID != undefined) {
    result = await instance.get(`${baseUrl}/api/leads?id=${ID}`);
  }
  let empRes = await instance.get(`${baseUrl}/api/employees`);

  return {
    props: {
      blogData: result && result.data,
      employeeList: empRes && empRes.data
    }
  }
}
