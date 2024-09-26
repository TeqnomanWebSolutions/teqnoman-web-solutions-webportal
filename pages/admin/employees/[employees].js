import Layout from "@/components/Layout/Layout";
import Head from "next/head";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import style from '../../../styles/profile.module.scss'
import { useEffect, useState } from "react";
import Image from "next/image";
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { useFormik } from "formik";
import * as yup from "yup";
import { instance } from "@/utils/Apiconfig";
import { useRouter } from "next/router";
import { State, City } from 'country-state-city';
import { toast } from "react-toastify";
import FileThumbnail from "@/components/FileThumbnail/FileThumbnail";

export default function Profile({ employeeData, employeeDocuments }) {

  const router = useRouter()
  const id = router.query.employees

  const [profileImg, setProfileImg] = useState("/images/dummy-profile.png");
  const [currentProfileImg, setCurrentProfileImg] = useState("");

  const [selectedState, setSelectedState] = useState("");
  const [permanentState, setPermanentState] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState(null);
  const handleImageUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImg(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  async function getPrevData() {
    let res = await instance.get(`/api/employment_history?id=${id}`);
    if (res.data) {
      experience.setFieldValue("is_fresher", res.data?.[0]?.is_fresher);
      experience.setFieldValue("prevData", [...res.data]);
    }
  }


  function getQualificationData() {
    const fetchData = instance.get(`/api/employee_qualification?id=${id}`).then((res) => {
      if (res.data) {
        qualificationFormik.setFieldValue("qualification", res.data);
      }
    })
  }
  const personalInfoFormik = useFormik({
    initialValues: {
      employee_profile: "", first_name: "", middle_name: "", last_name: "", employee_id: null, birth_date: "", contact_number: "", emergency_contact: "", email: "", gender: "", marital_status: "", religion: "", join_date: "", linkedin_profile_url: "", department: "", designation: "", blood_group: "", any_medical_issue: "", current_address_line_1: "", current_address_line_2: "", current_city: "", current_state: "", same_as_current: "", current_pincode: "", permanent_address_line_1: "", permanent_address_line_2: "", permanent_city: "", permanent_state: "", permanent_pincode: ""
    },
    validationSchema: yup.object().shape({
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
    }),

    onSubmit: async (values) => {
      const personal_detail = {
        same_as_current: values.same_as_current,
        employee_profile: values.employee_profile,
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

      if (id) {
        try {
          if (values.employee_profile instanceof File) {
            if (currentProfileImg && profileImg != "/images/dummy-profile.png" && currentProfileImg.startsWith("https://files.teqnomanweb.com")) {
              let params = Object.fromEntries(new URLSearchParams(currentProfileImg));
              let fileName = params.fileName;
              const deleteMedia = await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${id}&fileName=${fileName}`);
            }
            let formData = new FormData();
            formData.append("image", values.employee_profile);
            let fileRes = await instance.post(`https://files.teqnomanweb.com/upload?path=employees/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
            if (fileRes.status === 200) {
              personal_detail.employee_profile = fileRes.data.image.uploaded_url
            }
          }
          let res = await instance.put(`/api/employees?emp_id=${id}`, { ...personal_detail });
          if (res.status === 200) {
            toast.success("Personal Detail is updated!");
          }
        } catch (error) {
          toast.error("Error while updating Personal Information");
          console.error('Error:', error);
        }
      }
      instance.get(`/api/employees?id=${id}`).then((res) => {
        personalInfoFormik.setValues({ ...res.data });
        setProfileImg(res.data.employee_profile);
        setCurrentProfileImg(res.data.employee_profile);
        if (res.data.current_state) {
          setSelectedState(res.data.current_state);
          res.data.same_as_current ? setPermanentState(res.data.current_state) : "";
        }
        if (res.data.permanent_state && !res.data.same_as_current) {
          setPermanentState(res.data.permanent_state);
        }
      });
    },
  });

  const qualificationFormik = useFormik({
    initialValues: {
      qualification: [{ institute_name: "", course_name: "", percentage: "", start_year: "", end_year: "" }]
    },
    validationSchema: yup.object().shape({
      qualification: yup.array(
        yup.object().shape({
          institute_name: yup.string().required("Required"),
          course_name: yup.string().required("Required"),
          percentage: yup.number().positive().typeError("Not a valid positive number").required("Required"),
          start_year: yup.date().max(new Date().getFullYear(), "Invalid Year").typeError("Invalid Year").required("Required"),
          end_year: yup.date().max(new Date().getFullYear(), "Invalid Year").typeError("Invalid Year").required("Required"),
        })
      )
    }),

    onSubmit: async (values) => {
      if (values.qualification.length != 0) {
        values.qualification.map(async (d) => {
          let post_id = d._id;
          if (post_id) {
            let data = {
              employee_id: id,
              institute_name: d.institute_name,
              course_name: d.course_name,
              percentage: d.percentage,
              start_year: d.start_year,
              end_year: d.end_year
            }
            let res = await instance.put(`/api/employee_qualification?id=${d._id}`, data);
            if (res.status === 200) {
              toast.success(" Qualification Detail is updated!!");
            }
          } else {
            let data = {
              employee_id: id,
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
    },
  });

  const getQualificationFieldError = (fieldName, index) => {
    return (
      qualificationFormik.touched.qualification && qualificationFormik.touched.qualification[index] &&
      qualificationFormik.touched.qualification[index][fieldName] &&
      qualificationFormik.errors.qualification && qualificationFormik.errors.qualification[index] &&
      qualificationFormik.errors.qualification[index][fieldName]
    );
  };

  function addMoreQualification() {
    qualificationFormik.setFieldValue("qualification", [...qualificationFormik.values.qualification, { institute_name: "", course_name: "", percentage: "", start_year: "", end_year: "" }])
  }

  function showImage(fileObj) {
    if (fileObj instanceof File) {
      return URL.createObjectURL(fileObj)
    } else {
      return fileObj.url;
    }
  }

  async function deleteQualification(index) {
    let values = qualificationFormik.values.qualification[index];
    if (values._id) {
      let res = await instance.delete(`/api/employee_qualification?id=${values._id}`);
      if (res.status === 200) {
        let qualificationCopy = qualificationFormik.values.qualification;
        qualificationCopy.splice(index, 1);
        qualificationFormik.setFieldValue("qualification", qualificationCopy);
        toast.success("Qualification Deleted");
      }
    } else {
      let qualificationCopy = qualificationFormik.values.qualification;
      qualificationCopy.splice(index, 1);
      qualificationFormik.setFieldValue("qualification", qualificationCopy);
      toast.success("Qualification Deleted");
    }
    getQualificationData()
  }

  const bank_info = useFormik({
    initialValues: {
      account_holder_name: "", account_number: "", bank_name: "", branch_name: "", ifsc_code: "", pan_number: ""
    },
    validationSchema: yup.object().shape({
      account_holder_name: yup.string().required("Required"),
      account_number: yup.string().required("Required"),
      bank_name: yup.string().required("Required"),
      branch_name: yup.string().required("Required"),
      ifsc_code: yup.string().required("Required"),
      pan_number: yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      const bank_info = {
        account_holder_name: values.account_holder_name,
        account_number: values.account_number,
        bank_name: values.bank_name,
        branch_name: values.branch_name,
        ifsc_code: values.ifsc_code,
        pan_number: values.pan_number,
        employee_id: id
      }
      let res = await instance.put('/api/employee_bank_info', bank_info);
      if (res.status == 200) {
        toast.success("Bank Information is saved");
      } else {
        toast.error("Error while updating Bank Information");
      }
    },
  });

  const experience = useFormik({
    initialValues: {
      is_fresher: '',
      prevData: [
        { company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }
      ]
    },

    validationSchema: yup.object().shape({
      is_fresher: yup.string().notRequired(),
      prevData: yup.array().when('is_fresher', {
        is: (value) => value === "false",
        then: () => yup.array().of(
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
        ),
      })
    }),
    onSubmit: async (values) => {
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
            let fileRes = await instance.post(`https://files.teqnomanweb.com/documents?path=employees/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
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
          sendData.is_fresher = "false";
          sendData.employee_id = id;
          return sendData;
        });
        reqData.map(async (data) => {
          let item = await data;
          if (item._id) {
            let id = item._id;
            delete item._id;
            await instance.put(`/api/employment_history?id=${id}`, item)
              .then((res) => {
                if (res.status === 200) {
                  toast.success("Experience is updated!!");
                }
              })
          } else {
            await instance.post('/api/employment_history', item);
          }
        })
      }
    },
  });

  function setFile(e, index, fieldName) {
    let prevValues = [...experience.values.prevData];
    prevValues[index] = {
      ...prevValues[index],
      [fieldName]: e.target.files[0]
    };
    experience.setFieldValue("prevData", prevValues);
  }

  async function deleteDocument(index, data, field) {
    let fileData = data[field];
    if (fileData instanceof File) {
      let prevValues = [...experience.values.prevData];
      prevValues[index] = {
        ...prevValues[index],
        [field]: ""
      };
      experience.setFieldValue("prevData", prevValues);
    } else {
      await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${id}/documents&fileName=${fileData.name}`);
      await instance.delete(`/api/media?id=${fileData._id}`);
      await getPrevData();
    }
  }

  const getFieldError = (fieldName, index) => {
    return (
      experience.touched.prevData && experience.touched.prevData[index] &&
      experience.touched.prevData[index][fieldName] &&
      experience.errors.prevData && experience.errors.prevData[index] &&
      experience.errors.prevData[index][fieldName]
    );
  };

  const addMorePrevData = () => {
    experience.setFieldValue("prevData", [...experience.values.prevData, { company_name: null, role: null, employment_type: null, annual_package: null, join_date: null, resign_date: null, salary_slip: null, experience_letter: null, description: null }])
  }

  const deletePrevData = async (index) => {
    let currentValue = experience.values.prevData[index];
    if (currentValue._id) {
      await deleteDocument(index, currentValue, "salary_slip");
      await deleteDocument(index, currentValue, "experience_letter");
      let res = await instance.delete(`/api/employment_history?id=${currentValue._id}`);
      if (res.status === 200) {
        let prevDataCopy = experience.values.prevData;
        prevDataCopy.splice(index, 1);
        experience.setFieldValue("prevData", prevDataCopy);
        toast.success("Experience Detail Deleted");
      }
    } else {
      let prevDataCopy = experience.values.prevData;
      prevDataCopy.splice(index, 1);
      experience.setFieldValue("prevData", prevDataCopy);
      toast.success("Experience Detail Deleted");
    }
    getPrevData();
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
  useEffect(() => {
    setSelectedState(State.getStatesOfCountry('IN'));
    setPermanentState(State.getStatesOfCountry('IN'));
    if (id) {
      instance.get(`/api/employees?id=${id}`).then((res) => {
        personalInfoFormik.setValues({ ...res.data });
        setProfileImg(res.data.employee_profile);
        setCurrentProfileImg(res.data.employee_profile);
        if (res.data.current_state) {
          setSelectedState(res.data.current_state);
          res.data.same_as_current ? setPermanentState(res.data.current_state) : "";
        }
        if (res.data.permanent_state && !res.data.same_as_current) {
          setPermanentState(res.data.permanent_state);
        }
      });
      instance.get(`/api/employee_bank_info?id=${id}`).then((res) => {
        if (res.data) {
          bank_info.setValues(res.data);
        }
      });
      getAllDocuments()
      getQualificationData();
      getPrevData();
    }
  }, [id]);

  async function getAllDocuments() {
    let res = await instance.get(`/api/employee_documents?id=${id}`);
    if (res.status === 200) {
      let aadhar = res.data.filter((d) => d.name === "aadhar")[0];
      let PAN = res.data.filter((d) => d.name === "PAN")[0];
      let resume = res.data.filter((d) => d.name === "resume")[0];
      let certificate = res.data.filter((d) => d.name === "certificate").length != 0 ? res.data.filter((d) => d.name === "certificate")[0] : null;
      setUploadedDocuments({ aadhar, PAN, resume, certificate });
    }
  }

  const uploadDocumentsForm = useFormik({
    initialValues: { aadhar: "", PAN: "", resume: "", certificate: "", },
    onSubmit: async () => {
      let formData = new FormData();
      if (uploadDocumentsForm.values.aadhar instanceof File) {
        formData.append("aadhar", uploadDocumentsForm.values.aadhar);
      }
      if (uploadDocumentsForm.values.PAN instanceof File) {
        formData.append("PAN", uploadDocumentsForm.values.PAN);
      }
      if (uploadDocumentsForm.values.resume instanceof File) {
        formData.append("resume", uploadDocumentsForm.values.resume);
      }
      if (uploadDocumentsForm.values.certificate instanceof File) {
        formData.append("certificate", uploadDocumentsForm.values.certificate);
      }
      if (!!formData.entries().next().value) {
        try {
          let fileRes = await instance.post(`https://files.teqnomanweb.com/documents?path=employees/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' } });
          if (fileRes.status === 200) {
            let mediaIds = await setDocsMedia(fileRes.data.documents);
            mediaIds.map(async (media) => {
              let reqData = {
                employee_id: id,
                media_id: media.mediaId,
                name: media.name
              }
              await instance.post(`/api/employee_documents`, reqData);
            });
          }
        } catch (err) {
          if (err.response.status === 415) {
            toast.error(err.response.data.message);
          } else {
            toast.error("Error While Uploading Documents");
          }
        }
      }
      toast.success("Documents Updated");
    }
  })

  async function setDocsMedia(data) {
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

  async function deleteDocuments(fieldname) {
    let formValue = uploadDocumentsForm.values[fieldname];
    let isUpload = uploadedDocuments && uploadedDocuments[fieldname];
    if (formValue) {
      uploadDocumentsForm.setFieldValue(fieldname, "");
    }
    if (isUpload) {
      await instance.delete(`/api/media?id=${isUpload.media_id}`)
      await instance.delete(`/api/employee_documents?id=${isUpload._id}&media_id=${isUpload.media_id}&employee_id=${isUpload.employee_id}`)
      await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${id}/documents&fileName=${isUpload.filename}`);
      getAllDocuments();
    }
  }

  return (<>
    <Head>
      <title>Portal || Profile</title>
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
      <h2 className="page-title">Profile</h2>
      <Tabs>
        <TabList>
          {['Personal info', 'Qualification', 'Bank Info', 'Experience', 'Documents'].map((tab, i) => <Tab key={i}>{tab}</Tab>)}
        </TabList>
        <form onSubmit={personalInfoFormik.handleSubmit}>
          <TabPanel>
            <div className={style.borderBox}>
              <div className={style.profileImage}>
                <div className={style.profileInfo}>
                  <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${personalInfoFormik.values.first_name.charAt(0).toUpperCase()}${personalInfoFormik.values.last_name.charAt(0).toUpperCase()}`;
                  }} />
                  <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={(e) => { personalInfoFormik.setValues({ ...personalInfoFormik.values, employee_profile: e.target.files[0] }); handleImageUpload(e) }} />
                  <label htmlFor="profile-image-upload">
                    <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                  </label>
                </div>
                <div className={style.aboutProfile}>
                  <p className={style.profileName}>{personalInfoFormik.values.first_name} {personalInfoFormik.values.last_name}</p>
                  <p className={style.profileDesignation}>{personalInfoFormik.values.designation}</p>
                </div>
              </div>
              <div className='row'>
                <div className="col-lg-4 col-md-4 position-relative">
                  <div className="form_control">
                    <label htmlFor='first_name' className="custom-label">First Name</label>
                    <input
                      name="first_name"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.first_name}
                      placeholder="First name"
                      id='first_name'
                      aria-describedby="first_name"
                      className={`custom-input ${personalInfoFormik.touched.first_name && personalInfoFormik.errors.first_name ? 'border-danger' : ''}`} type="text"
                    />
                    {personalInfoFormik.touched.first_name && personalInfoFormik.errors.first_name && <div className="invalid-tooltip">{personalInfoFormik.errors?.first_name}</div>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='middle_name' className="custom-label">Middle Name</label>
                    <input
                      name="middle_name"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.middle_name}
                      className={`custom-input ${personalInfoFormik.touched.middle_name && personalInfoFormik.errors?.middle_name ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Middle name" />
                    {personalInfoFormik.touched.middle_name && personalInfoFormik.errors?.middle_name ? <div className="invalid-tooltip">{personalInfoFormik.errors?.middle_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='last_name' className="custom-label">Last Name</label>
                    <input
                      name="last_name"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.last_name}
                      className={`custom-input ${personalInfoFormik.touched.last_name && personalInfoFormik.errors?.last_name ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Last name"
                    />
                    {personalInfoFormik.touched.last_name && personalInfoFormik.errors?.last_name ? <div className="invalid-tooltip">{personalInfoFormik.errors?.last_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor="employee_id" className="custom-label">Employee ID</label>
                    <input
                      type='text'
                      name="employee_id"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.employee_id}
                      className={`custom-input ${personalInfoFormik.touched.employee_id && personalInfoFormik.errors?.employee_id ? 'border-danger' : ''}`}
                      placeholder="0001"
                    />
                    {personalInfoFormik.touched.employee_id && personalInfoFormik.errors?.employee_id ? <div className="invalid-tooltip">{personalInfoFormik.errors?.employee_id}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor="birth_date" className="custom-label">Birth Date</label>
                    <input
                      name="birth_date"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.birth_date}
                      className={`custom-input ${personalInfoFormik.touched.birth_date && personalInfoFormik.errors?.birth_date ? 'border-danger' : ''}`}
                      type="date"
                    />
                    {personalInfoFormik.touched.birth_date && personalInfoFormik.errors?.birth_date ? <div className="invalid-tooltip">{personalInfoFormik.errors?.birth_date}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor="email" className="custom-label">E-mail</label>
                    <input
                      name="email"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.email}
                      className={`custom-input ${personalInfoFormik.touched.email && personalInfoFormik.errors?.email ? 'border-danger' : ''}`}
                      type="email"
                      placeholder="Enter your email"
                    />
                    {personalInfoFormik.touched.email && personalInfoFormik.errors?.email ? <div className="invalid-tooltip">{personalInfoFormik.errors.email}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='contact_number' className="custom-label">Contact No.</label>
                    <input
                      name="contact_number"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.contact_number}
                      className={`custom-input ${personalInfoFormik.touched.contact_number && personalInfoFormik.errors?.contact_number ? 'border-danger' : ''}`}
                      type="tel"
                      placeholder="+91 9876543210"
                    />
                    {personalInfoFormik.touched.contact_number && personalInfoFormik.errors?.contact_number ? <div className="invalid-tooltip">{personalInfoFormik.errors?.contact_number}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='emergency_contact' className="custom-label">Emergency Contact No.</label>
                    <input
                      name="emergency_contact"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.emergency_contact}
                      className={`custom-input ${personalInfoFormik.touched.emergency_contact && personalInfoFormik.errors?.emergency_contact ? 'border-danger' : ''}`}
                      type="tel"
                      placeholder="+91 0123456789"
                    />
                    {personalInfoFormik.touched.emergency_contact && personalInfoFormik.errors?.emergency_contact ? <div className="invalid-tooltip">{personalInfoFormik.errors?.emergency_contact}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='gender' className="custom-label">Gender</label>
                    <select
                      name="gender"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.gender}
                      className={`custom-select ${personalInfoFormik.touched.gender && personalInfoFormik.errors?.gender ? 'border-danger' : ''}`}
                    >
                      <option value={"Male"} selected>Male</option>
                      <option value={"Female"}>Female</option>
                    </select>
                    {personalInfoFormik.touched.gender && personalInfoFormik.errors?.gender ? <div className="invalid-tooltip">{personalInfoFormik.errors?.gender}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='marital_status' className="custom-label">Marital Status</label>
                    <select
                      name="marital_status"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.marital_status}
                      className={`custom-select ${personalInfoFormik.touched.marital_status && personalInfoFormik.errors?.marital_status ? 'border-danger' : ''}`}
                    >
                      <option value={"Single"}>Single</option>
                      <option value={"Married"}>Married</option>
                    </select>
                    {personalInfoFormik.touched.marital_status && personalInfoFormik.errors?.marital_status ? <div className="invalid-tooltip">{personalInfoFormik.errors?.marital_status}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='religion' className="custom-label">Religion</label>
                    <select
                      name="religion"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.religion}
                      className={`custom-select ${personalInfoFormik.touched.religion && personalInfoFormik.errors?.religion ? 'border-danger' : ''}`}
                    >
                      <option value={"Hindu"}>Hindu</option>
                      <option value={"Muslim"}>Muslim</option>
                      <option value={"Christian"}>Christian</option>
                      <option value={"Buddhist"}>Buddhist</option>
                      <option value={"Sikh"}>Sikh</option>
                      <option value={"Jain"}>Jain</option>
                      <option value={"Parsi"}>Parsi</option>
                      <option value={"Other"}>Other</option>
                    </select>
                    {personalInfoFormik.touched.religion && personalInfoFormik.errors?.religion ? <div className="invalid-tooltip">{personalInfoFormik.errors?.religion}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='join_date' className="custom-label">Joining Date</label>
                    <input
                      name="join_date"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.join_date}
                      type="date"
                      className={`custom-input ${personalInfoFormik.touched.join_date && personalInfoFormik.errors?.join_date ? 'border-danger' : ''}`}
                    />
                    {personalInfoFormik.touched.join_date && personalInfoFormik.errors?.join_date ? <div className="invalid-tooltip">{personalInfoFormik.errors?.join_date}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='linkedin_profile_url' className="custom-label">LinkedIn Profile</label>
                    <input
                      name="linkedin_profile_url"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.linkedin_profile_url}
                      type="url"
                      className={`custom-input ${personalInfoFormik.touched.linkedin_profile_url && personalInfoFormik.errors?.linkedin_profile_url ? 'border-danger' : ''}`}
                      placeholder="Add your profile URL" />
                    {personalInfoFormik.touched.linkedin_profile_url && personalInfoFormik.errors?.linkedin_profile_url ? <div className="invalid-tooltip">{personalInfoFormik.errors?.linkedin_profile_url}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='department' className="custom-label">Department</label>
                    <select
                      name="department"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.department}
                      className={`custom-select ${personalInfoFormik.touched.department && personalInfoFormik.errors?.department ? 'border-danger' : ''}`}
                    >
                      <option value={"UI/UX"}>UI/UX</option>
                      <option value={"Web Development"}>Web Development</option>
                      <option value={"Digital Marketing"}>Digital Marketing</option>
                      <option value={"Human Resource"}>Human Resource</option>
                    </select>
                    {personalInfoFormik.touched.department && personalInfoFormik.errors?.department ? <div className="invalid-tooltip">{personalInfoFormik.errors?.department}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='designation' className="custom-label">Designation</label>
                    <input
                      name="designation"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.designation}
                      type="text"
                      className={`custom-input ${personalInfoFormik.touched.designation && personalInfoFormik.errors?.designation ? 'border-danger' : ''}`}
                      placeholder='Add your designation'
                    />
                    {personalInfoFormik.touched.designation && personalInfoFormik.errors?.designation ? <div className="invalid-tooltip">{personalInfoFormik.errors?.designation}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='blood_group' className="custom-label">Blood Group</label>
                    <select
                      name="blood_group"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.blood_group}
                      className={`custom-select ${personalInfoFormik.touched.blood_group && personalInfoFormik.errors?.blood_group ? 'border-danger' : ''}`}
                    >
                      <option value={"A positive (A+)"}>A positive (A+)</option>
                      <option value={"A negative (A-)"}>A negative (A-)</option>
                      <option value={"B positive (B+)"}>B positive (B+)</option>
                      <option value={"B negative (B-)"}>B negative (B-)</option>
                      <option value={"AB positive (AB+)"}>AB positive (AB+)</option>
                      <option value={"AB negative (AB-)"}>AB negative (AB-)</option>
                      <option value={"O positive (O+)"}>O positive (O+)</option>
                      <option value={"O negative (O-)"}>O negative (O-)</option>
                    </select>
                    {personalInfoFormik.touched.blood_group && personalInfoFormik.errors?.blood_group ? <div className="invalid-tooltip">{personalInfoFormik.errors?.blood_group}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <label htmlFor='any_medical_issue' className="custom-label">Any Medical Issue?</label>
                    <input
                      name="any_medical_issue"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.any_medical_issue}
                      type="text"
                      className={`custom-input ${personalInfoFormik.touched.any_medical_issue && personalInfoFormik.errors?.any_medical_issue ? 'border-danger' : ''}`}
                      placeholder='If yes, expalin in short OR type NO'
                    />
                    {personalInfoFormik.touched.any_medical_issue && personalInfoFormik.errors?.any_medical_issue ? <div className="invalid-tooltip">{personalInfoFormik.errors?.any_medical_issue}</div> : <></>}
                  </div>
                </div>
                <label className="custom-label">Current Address</label>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <input
                      name="current_address_line_1"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.current_address_line_1}
                      className={`custom-input ${personalInfoFormik.touched.current_address_line_1 && personalInfoFormik.errors?.current_address_line_1 ? 'border-danger' : ''}`}
                      placeholder="Address line 1"
                    />
                    {personalInfoFormik.touched.current_address_line_1 && personalInfoFormik.errors?.current_address_line_1 ? <div className="invalid-tooltip">{personalInfoFormik.errors?.current_address_line_1}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <input
                      name="current_address_line_2"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.current_address_line_2}
                      className={`custom-input ${personalInfoFormik.touched.current_address_line_2 && personalInfoFormik.errors?.current_address_line_2 ? 'border-danger' : ''}`}
                      placeholder="Address line 2"
                    />
                    {personalInfoFormik.touched.current_address_line_2 && personalInfoFormik.errors?.current_address_line_2 ? <div className="invalid-tooltip">{personalInfoFormik.errors?.current_address_line_2}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className="form_control">
                    <select
                      name="current_state"
                      id="current_state"
                      placeholder="Select your state"
                      value={personalInfoFormik.values.current_state}
                      onChange={(e) => { personalInfoFormik.handleChange(e); setSelectedState(e.target.value) }}
                      onBlur={(e) => { personalInfoFormik.handleChange(e); setSelectedState(e.target.value) }}
                      className={`custom-input ${personalInfoFormik.touched.current_state && personalInfoFormik.errors?.current_state ? 'border-danger' : ''}`}
                    >
                      <option value="">Select State</option>
                      {State.getStatesOfCountry('IN').map((d, key) => {
                        return (<option key={key} value={d.isoCode}>{d.name}</option>)
                      })}
                    </select>
                    {personalInfoFormik.touched.current_state && personalInfoFormik.errors?.current_state ? <div className="invalid-tooltip">{personalInfoFormik.errors?.current_state}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className="form_control">
                    <select
                      name="current_city"
                      id="current_city"
                      value={personalInfoFormik.values.current_city}
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      className={` custom-input ${personalInfoFormik.errors.current_city && personalInfoFormik.touched.current_city ? 'border-danger' : ''}`}
                    >
                      <option value="" selected disabled>Select City</option>
                      {City.getCitiesOfState("IN", selectedState).map((d, key) => {
                        return (<option key={key} value={d.name}>{d.name}</option>)
                      })}
                    </select>
                    {personalInfoFormik.touched.current_city && personalInfoFormik.errors.current_city ? <div className="invalid-tooltip">{personalInfoFormik.errors.current_city}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <input
                      name="current_pincode"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.current_pincode}
                      type="number"
                      className={`custom-input ${personalInfoFormik.touched.current_pincode && personalInfoFormik.errors?.current_pincode ? 'border-danger' : ''}`}
                      placeholder="Pincode"
                    />
                    {personalInfoFormik.touched.current_pincode && personalInfoFormik.errors?.current_pincode ? <div className="invalid-tooltip">{personalInfoFormik.errors?.current_pincode}</div> : <></>}
                  </div>
                </div>
                <label className="custom-label">Permanent Address</label>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <input
                      name="permanent_address_line_1"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.permanent_address_line_1}
                      className={`custom-input ${personalInfoFormik.touched.permanent_address_line_1 && personalInfoFormik.errors?.permanent_address_line_1 ? 'border-danger' : ''}`}
                      placeholder="Address line 1"
                    />
                    {personalInfoFormik.touched.permanent_address_line_1 && personalInfoFormik.errors?.permanent_address_line_1 ? <div className="invalid-tooltip">{personalInfoFormik.errors?.permanent_address_line_1}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <input
                      name="permanent_address_line_2"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.permanent_address_line_2}
                      className={`custom-input ${personalInfoFormik.touched.permanent_address_line_2 && personalInfoFormik.errors?.permanent_address_line_2 ? 'border-danger' : ''}`}
                      placeholder="Address line 2"
                    />
                    {personalInfoFormik.touched.permanent_address_line_2 && personalInfoFormik.errors?.permanent_address_line_2 ? <div className="invalid-tooltip">{personalInfoFormik.errors?.permanent_address_line_2}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className="form_control">
                    <select
                      name="permanent_state"
                      id="permanent_state"
                      onChange={(e) => { personalInfoFormik.handleChange(e); setPermanentState(e.target.value) }}
                      onBlur={(e) => { personalInfoFormik.handleChange(e); setPermanentState(e.target.value) }}
                      value={personalInfoFormik.values.permanent_state}
                      className={`custom-select ${personalInfoFormik.touched.permanent_state && personalInfoFormik.errors?.permanent_state ? 'border-danger' : ''}`}
                      placeholder="Select your state"
                    >
                      <option value="">Select State</option>
                      {State.getStatesOfCountry('IN').map((d, key) => {
                        return (<option key={key} value={d.isoCode}>{d.name}</option>)
                      })}
                    </select>
                    {personalInfoFormik.touched.permanent_state && personalInfoFormik.errors?.permanent_state ? <div className="invalid-tooltip">{personalInfoFormik.errors?.permanent_state}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className="form_control">
                    <select
                      name="permanent_city"
                      id="permanent_city"
                      value={personalInfoFormik.values.permanent_city}
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      className={` custom-input ${personalInfoFormik.errors.permanent_city && personalInfoFormik.touched.permanent_city ? 'border-danger' : ''}`}
                    >
                      <option value="" selected disabled>Select City</option>
                      {City.getCitiesOfState("IN", permanentState).map((d, key) => {
                        return (<option key={key} value={d.name}>{d.name}</option>)
                      })}
                    </select>
                    {personalInfoFormik.touched.permanent_city && personalInfoFormik.errors?.permanent_city ? <div className="invalid-tooltip">{personalInfoFormik.errors?.permanent_city}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="form_control">
                    <input
                      name="permanent_pincode"
                      onChange={personalInfoFormik.handleChange}
                      onBlur={personalInfoFormik.handleBlur}
                      value={personalInfoFormik.values.permanent_pincode}
                      type="number"
                      className={`custom-input ${personalInfoFormik.touched.permanent_pincode && personalInfoFormik.errors?.permanent_pincode ? 'border-danger' : ''}`}
                      placeholder="Pincode"
                    />
                    {personalInfoFormik.touched.permanent_pincode && personalInfoFormik.errors?.permanent_pincode ? <div className="invalid-tooltip">{personalInfoFormik.errors?.permanent_pincode}</div> : <></>}
                  </div>
                </div>
              </div>
            </div>
            <div className={style.save}>
              <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' callBack={personalInfoFormik.handleSubmit} />
            </div>
          </TabPanel>
        </form>


        <form onSubmit={qualificationFormik.handleSubmit}>
          <TabPanel>
            <div className={style.borderBox}>
              <div className={style.profileImage}>
                <div className={style.profileInfo}>
                  <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${personalInfoFormik.values.first_name.charAt(0).toUpperCase()}${personalInfoFormik.values.last_name.charAt(0).toUpperCase()}`;
                  }} />
                  <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <label htmlFor="profile-image-upload">
                    <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                  </label>
                </div>
                <div className={style.aboutProfile}>
                  <p className={style.profileName}>{personalInfoFormik.values.first_name} {personalInfoFormik.values.last_name}</p>
                  <p className={style.profileDesignation}>{personalInfoFormik.values.designation}</p>
                </div>
              </div>
              {qualificationFormik.values.qualification.map((q, index) => <div className={`row ${style.newRow}`} key={index}>
                {index != 0 && <div className={style.addMore}>
                  <button type='button' onClick={() => deleteQualification(index)} className='btn btnuiOrangeText'>Delete</button>
                </div>}
                <div className="col-lg-4 col-md-4">
                  <div className='form_control'>
                    <label className="custom-label">Institute Name</label>
                    <input
                      name={`qualification[${index}].institute_name`}
                      onChange={qualificationFormik.handleChange}
                      onBlur={qualificationFormik.handleBlur}
                      value={q.institute_name}
                      className={`custom-input ${getQualificationFieldError("institute_name", index) ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter institute name"
                    />
                    {getQualificationFieldError("institute_name", index) ? <div className="invalid-tooltip">{qualificationFormik.errors.qualification[index]?.institute_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className='form_control'>
                    <label className="custom-label">Course Name</label>
                    <input
                      name={`qualification[${index}].course_name`}
                      onChange={qualificationFormik.handleChange}
                      onBlur={qualificationFormik.handleBlur}
                      value={q.course_name}
                      className={`custom-input ${getQualificationFieldError("course_name", index) ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter course name"
                    />
                    {getQualificationFieldError("course_name", index) ? <div className="invalid-tooltip">{qualificationFormik.errors.qualification[index]?.course_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className='form_control'>
                    <label className="custom-label">CGPA/Percentage</label>
                    <input
                      name={`qualification[${index}].percentage`}
                      onChange={qualificationFormik.handleChange}
                      onBlur={qualificationFormik.handleBlur}
                      value={q.percentage}
                      className={`custom-input ${getQualificationFieldError("percentage", index) ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter CGPA / percentage"
                    />
                    {getQualificationFieldError("percentage", index) ? <div className="invalid-tooltip">{qualificationFormik.errors.qualification[index]?.percentage}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className='form_control'>
                    <label className="custom-label">Start Year</label>
                    <input
                      name={`qualification[${index}].start_year`}
                      onChange={qualificationFormik.handleChange}
                      onBlur={qualificationFormik.handleBlur}
                      value={q.start_year}
                      className={`custom-input ${getQualificationFieldError("start_year", index) ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Start Year"
                    />
                    {getQualificationFieldError("start_year", index) ? <div className="invalid-tooltip">{qualificationFormik.errors.qualification[index]?.start_year}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className='form_control'>
                    <label className="custom-label">End Year</label>
                    <input
                      name={`qualification[${index}].end_year`}
                      onChange={qualificationFormik.handleChange}
                      onBlur={qualificationFormik.handleBlur}
                      value={q.end_year}
                      className={`custom-input ${getQualificationFieldError("end_year", index) ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="End Year"
                    />
                    {getQualificationFieldError("end_year", index) ? <div className="invalid-tooltip">{qualificationFormik.errors.qualification[index]?.end_year}</div> : <></>}
                  </div>
                </div>
              </div>)}
              <div className={style.addMore}>
                <button type='button' onClick={addMoreQualification} className='btn btnuiOrangeText'>+ Add more education detail</button>
              </div>
            </div>
            <div className={style.save}>
              <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' />
            </div>
          </TabPanel>
        </form>

        <form onSubmit={bank_info.handleSubmit}>
          <TabPanel>
            <div className={style.borderBox}>
              <div className={style.profileImage}>
                <div className={style.profileInfo}>
                  <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${personalInfoFormik.values.first_name.charAt(0).toUpperCase()}${personalInfoFormik.values.last_name.charAt(0).toUpperCase()}`;
                  }} />
                  <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <label htmlFor="profile-image-upload">
                    <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                  </label>
                </div>
                <div className={style.aboutProfile}>
                  <p className={style.profileName}>{personalInfoFormik.values.first_name} {personalInfoFormik.values.last_name}</p>
                  <p className={style.profileDesignation}>{personalInfoFormik.values.designation}</p>
                </div>
              </div>
              <div className='row'>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">Account Holder Name</label>
                    <input
                      name="account_holder_name"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.account_holder_name}
                      className={`custom-input ${bank_info.touched.account_holder_name && bank_info.errors.account_holder_name ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter account holder name"
                    />
                    {bank_info.touched.account_holder_name && bank_info.errors.account_holder_name ? <div className="invalid-tooltip">{bank_info.errors.account_holder_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">Account Number</label>
                    <input
                      name="account_number"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.account_number}
                      className={`custom-input ${bank_info.touched.account_number && bank_info.errors.account_number ? 'border-danger' : ''}`}
                      type="number"
                      placeholder="Enter account number"
                    />
                    {bank_info.touched.account_number && bank_info.errors.account_number ? <div className="invalid-tooltip">{bank_info.errors.account_number}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">Bank Name</label>
                    <input
                      name="bank_name"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.bank_name}
                      className={`custom-input ${bank_info.touched.bank_name && bank_info.errors.bank_name ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter bank name"
                    />
                    {bank_info.touched.bank_name && bank_info.errors.bank_name ? <div className="invalid-tooltip">{bank_info.errors.bank_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">Branch Name</label>
                    <input
                      name="branch_name"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.branch_name}
                      className={`custom-input ${bank_info.touched.branch_name && bank_info.errors.branch_name ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter branch name"
                    />
                    {bank_info.touched.branch_name && bank_info.errors.branch_name ? <div className="invalid-tooltip">{bank_info.errors.branch_name}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">IFSC Code</label>
                    <input
                      name="ifsc_code"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.ifsc_code}
                      className={`custom-input ${bank_info.touched.ifsc_code && bank_info.errors.ifsc_code ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter IFSC code"
                    />
                    {bank_info.touched.ifsc_code && bank_info.errors.ifsc_code ? <div className="invalid-tooltip">{bank_info.errors.ifsc_code}</div> : <></>}
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6">
                  <div className='form_control'>
                    <label className="custom-label">Tax Payer ID (PAN)</label>
                    <input
                      name="pan_number"
                      onChange={bank_info.handleChange}
                      onBlur={bank_info.handleBlur}
                      value={bank_info.values.pan_number}
                      className={`custom-input ${bank_info.touched.pan_number && bank_info.errors.pan_number ? 'border-danger' : ''}`}
                      type="text"
                      placeholder="Enter tax ID"
                    />
                    {bank_info.touched.pan_number && bank_info.errors.pan_number ? <div className="invalid-tooltip">{bank_info.errors.pan_number}</div> : <></>}
                  </div>
                </div>
              </div>
            </div>
            <div className={style.save}>
              <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' />
            </div>
          </TabPanel>
        </form>

        <form onSubmit={experience.handleSubmit}>
          <TabPanel>
            <div className={style.borderBox}>
              <div className={style.profileImage}>
                <div className={style.profileInfo}>
                  <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${personalInfoFormik.values.first_name.charAt(0).toUpperCase()}${personalInfoFormik.values.last_name.charAt(0).toUpperCase()}`;
                  }} />
                  <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <label htmlFor="profile-image-upload">
                    <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                  </label>
                </div>
                <div className={style.aboutProfile}>
                  <p className={style.profileName}>{personalInfoFormik.values.first_name} {personalInfoFormik.values.last_name}</p>
                  <p className={style.profileDesignation}>{personalInfoFormik.values.designation}</p>
                </div>
              </div>
              {experience.is_fresher == true && (<p className={style.note}>Please add data when you gain more experience.</p>)}

              {experience.values.prevData.map((data, index) =>
                <>  <div className='row' key={index}>
                  {index != 0 && <div className={style.addMore}>
                    <button type='button' className='btn btnuiOrangeText' onClick={() => deletePrevData(index)}>Delete</button>
                  </div>}
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Company Name</label>
                      <input
                        name={`prevData[${index}].company_name`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.company_name}
                        className={`custom-input ${getFieldError("company_name", index) ? 'border-danger' : ''}`}
                        type="text"
                        placeholder='Enter company name'
                      />
                      {getFieldError("company_name", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.company_name}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Role</label>
                      <input
                        name={`prevData[${index}].role`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.role}
                        className={`custom-input ${getFieldError("role", index) ? 'border-danger' : ''}`}
                        type="text"
                        placeholder='Enter your role'
                      />
                      {getFieldError("role", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.role}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Employment Type</label>
                      <select
                        name={`prevData[${index}].employment_type`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.employment_type}
                        className={`custom-select ${getFieldError("employment_type", index) ? 'border-danger' : ''}`}
                        placeholder="Select employment type"
                      >
                        <option value="">Select Employment Type</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                      {getFieldError("employment_type", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.employment_type}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Annual Package</label>
                      <input
                        name={`prevData[${index}].annual_package`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.annual_package}
                        className={`custom-input ${getFieldError("annual_package", index) ? 'border-danger' : ''}`}
                        type="number"
                        placeholder='Enter LPA'
                      />
                      {getFieldError("annual_package", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.annual_package}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Join Date</label>
                      <input
                        name={`prevData[${index}].join_date`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.join_date}
                        type="date"
                        className={`custom-input ${getFieldError("join_date", index) ? 'border-danger' : ''}`}
                      />
                      {getFieldError("join_date", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.join_date}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4">
                    <div className="form_control">
                      <label className="custom-label">Resign Date</label>
                      <input
                        name={`prevData[${index}].resign_date`}
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.resign_date}
                        type="date"
                        className={`custom-input ${getFieldError("resign_date", index) ? 'border-danger' : ''}`}
                      />
                      {getFieldError("resign_date", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.resign_date}</div> : <></>}
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <div className="form_control">
                      <label className="custom-label">Salary Slip</label>
                      <div>
                        {!data?.salary_slip?.name && <label htmlFor={`salary_slip${index}`} className={`${style.upload} ${getFieldError("salary_slip", index) ? 'border-danger' : ''}`}>{"+ Choose file"}</label>}
                        {(data?.salary_slip?.name) && <div className={style.upload}><button className={`btn ${style.closeIcon}`} onClick={() => deleteDocument(index, data, "salary_slip")}><img src='/images/close-icon.svg' /></button>
                          <a href={showImage(data?.salary_slip)} target='_blank'>
                            <FileThumbnail name={data?.salary_slip?.name} /> <p> {data?.salary_slip?.name}</p></a>
                        </div>}
                        <input
                          name={`prevData[${index}].salary_slip`}
                          onChange={(e) => { setFile(e, index, "salary_slip") }}
                          onBlur={experience.handleBlur}
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
                          onBlur={experience.handleBlur}
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
                        onChange={experience.handleChange}
                        onBlur={experience.handleBlur}
                        value={data.description}
                        rows={4}
                        className={`custom-input ${getFieldError("description", index) ? 'border-danger' : ''}`}
                        placeholder='Add description'
                      />
                      {getFieldError("description", index) ? <div className="invalid-tooltip">{experience.errors.prevData[index]?.description}</div> : <></>}
                    </div>
                  </div>
                </div>
                </>)}
              <div className={style.addMore}>
                <button type='button' onClick={addMorePrevData} className='btn btnuiOrangeText'>+ Add more education detail</button>
              </div>
            </div>
            <div className={style.save}>
              <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' />
            </div>
          </TabPanel>
        </form>

        <form>
          <TabPanel>
            <div className={style.borderBox}>
              <div className={style.profileImage}>
                <div className={style.profileInfo}>
                  <img src={profileImg || "/images/dummy-profile.png"} width={100} height={100} alt="profile" className={style.profileImg} onError={(e) => {
                    e.target.src = `https://placehold.co/38x38/ff701f/fff?text=${personalInfoFormik.values.first_name.charAt(0).toUpperCase()}${personalInfoFormik.values.last_name.charAt(0).toUpperCase()}`;
                  }} />
                  <input type="file" id="profile-image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <label htmlFor="profile-image-upload">
                    <Image src="/images/camera.png" width={23} height={23} alt="camera" className={style.cameraIcon} />
                  </label>
                </div>
                <div className={style.aboutProfile}>
                  <p className={style.profileName}>{personalInfoFormik.values.first_name} {personalInfoFormik.values.last_name}</p>
                  <p className={style.profileDesignation}>{personalInfoFormik.values.designation}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <label className='custom-label'>Aadhar Card</label>
                    <div>
                      {!uploadDocumentsForm.values?.aadhar?.name && !uploadedDocuments?.aadhar?.url && <label htmlFor="aadhar" className={`${style.upload} ${uploadDocumentsForm.touched.aadhar && uploadDocumentsForm.errors.aadhar ? 'border-danger' : ''}`}>
                        + Choose file
                      </label>}
                      {(uploadDocumentsForm.values?.aadhar?.name || uploadedDocuments?.aadhar?.url) && <div className={style.upload}><button type="button" className={`btn ${style.closeIcon}`} onClick={() => deleteDocuments("aadhar")}><img src='/images/close-icon.svg' /></button><a href={showImage(uploadDocumentsForm.values?.aadhar) || uploadedDocuments?.aadhar?.url} target='_blank'><FileThumbnail name={uploadDocumentsForm.values?.aadhar?.name || uploadedDocuments?.aadhar?.filename} /> {uploadDocumentsForm.values?.aadhar?.name || uploadedDocuments?.aadhar?.filename}</a></div>}
                      <input
                        name='aadhar'
                        onChange={(e) => uploadDocumentsForm.setValues({ ...uploadDocumentsForm.values, aadhar: e.target.files[0] })}
                        onBlur={uploadDocumentsForm.handleBlur}
                        accept="image/jpeg, image/png, application/pdf"
                        type="file"
                        hidden
                        id="aadhar"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <label className='custom-label'>Pan Card</label>
                    <div>
                      {!uploadDocumentsForm.values?.PAN?.name && !uploadedDocuments?.PAN?.url && <label htmlFor="PAN" className={`${style.upload} ${uploadDocumentsForm.touched.PAN && uploadDocumentsForm.errors.PAN ? 'border-danger' : ''}`}>
                        + Choose file
                      </label>}
                      {(uploadDocumentsForm.values?.PAN?.name || uploadedDocuments?.PAN?.url) && <div className={style.upload}><button type="button" className={`btn ${style.closeIcon}`} onClick={() => deleteDocuments("PAN")}><img src='/images/close-icon.svg' /></button><a href={showImage(uploadDocumentsForm.values?.PAN) || uploadedDocuments?.PAN?.url} target='_blank'><FileThumbnail name={uploadDocumentsForm.values?.PAN?.name || uploadedDocuments?.PAN?.filename} /> {uploadDocumentsForm.values?.PAN?.name || uploadedDocuments?.PAN?.filename}</a></div>}
                      <input
                        name='PAN'
                        onChange={(e) => uploadDocumentsForm.setValues({ ...uploadDocumentsForm.values, PAN: e.target.files[0] })}
                        onBlur={uploadDocumentsForm.handleBlur}
                        accept="image/jpeg, image/png, application/pdf"
                        type="file"
                        hidden
                        id="PAN"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <label className='custom-label'>Resume</label>
                    <div>
                      {!uploadDocumentsForm.values?.resume?.name && !uploadedDocuments?.resume?.url && <label htmlFor="resume" className={`${style.upload} ${uploadDocumentsForm.touched.resume && uploadDocumentsForm.errors.resume ? 'border-danger' : ''}`}>
                        + Choose file
                      </label>}
                      {(uploadDocumentsForm.values?.resume?.name || uploadedDocuments?.resume?.url) && <div className={style.upload}><button type="button" className={`btn ${style.closeIcon}`} onClick={() => deleteDocuments("resume")}><img src='/images/close-icon.svg' /></button><a href={showImage(uploadDocumentsForm.values?.resume) || uploadedDocuments?.resume?.url} target='_blank'><FileThumbnail name={uploadDocumentsForm.values?.resume?.name || uploadedDocuments?.resume?.filename} /> {uploadDocumentsForm.values?.resume?.name || uploadedDocuments?.resume?.filename}</a></div>}
                      <input
                        name='resume'
                        onChange={(e) => uploadDocumentsForm.setValues({ ...uploadDocumentsForm.values, resume: e.target.files[0] })}
                        onBlur={uploadDocumentsForm.handleBlur}
                        accept="image/jpeg, image/png, application/pdf"
                        type="file"
                        hidden
                        id="resume"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form_control">
                    <label className='custom-label'>Certificate/ Achievement</label>
                    <div>
                      {!uploadDocumentsForm.values?.certificate?.name && !uploadedDocuments?.certificate?.url && <label htmlFor="certificate" className={`${style.upload} ${uploadDocumentsForm.touched.certificate && uploadDocumentsForm.errors.certificate ? 'border-danger' : ''}`}>
                        + Choose file
                      </label>}
                      {(uploadDocumentsForm.values?.certificate?.name || uploadedDocuments?.certificate?.url) && <div className={style.upload}><button type="button" className={`btn ${style.closeIcon}`} onClick={() => deleteDocuments("certificate")}><img src='/images/close-icon.svg' /></button><a href={showImage(uploadDocumentsForm.values?.certificate) || uploadedDocuments?.certificate?.url} target='_blank'><FileThumbnail name={uploadDocumentsForm.values?.certificate?.name || uploadedDocuments?.certificate?.filename} /> {uploadDocumentsForm.values?.certificate?.name || uploadedDocuments?.certificate?.filename}</a></div>}
                      <input
                        name='certificate'
                        onChange={(e) => uploadDocumentsForm.setValues({ ...uploadDocumentsForm.values, certificate: e.target.files[0] })}
                        onBlur={uploadDocumentsForm.handleBlur}
                        accept="image/jpeg, image/png, application/pdf"
                        type="file"
                        hidden
                        id="certificate"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={style.save}>
              <ButtonUi cssClass='btnuiRounded' text='Save' type='submit' callBack={uploadDocumentsForm.handleSubmit} />
            </div>
          </TabPanel>
        </form>
      </Tabs>
    </Layout>
  </>);
}