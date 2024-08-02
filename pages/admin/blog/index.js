import Layout from '@/components/Layout/Layout'
import React, { useState } from 'react';
import styles from '../../../styles/blog.module.scss'
import DataTable from 'react-data-table-component';
import moment from 'moment';
import Image from 'next/image';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { instance } from '@/utils/Apiconfig';
import { Modal } from 'react-bootstrap';
import Head from 'next/head';
import SearchBox from '@/components/SearchBox/SearchBox';
import { toast } from 'react-toastify';

export default function Blog(data) {

  const [showModal, setShowModal] = useState([false, null]);
  const deleteModal = (id) => {
    setShowModal([true, id]);
  };

  const [blogData, setBlogData] = useState(data.blogData)
  const [filterBlogs, setFilterBlogs] = useState(blogData)

  const deleteBlog = async () => {
    const id = showModal[1]
    setShowModal([false, null]);
    const remove = await instance.delete(`/api/blog?id=${id}`).then(res => {
      setBlogData(blogData.filter(d => d._id !== id))
      setShowModal([false, null]);
    })
  };

  const clearData = () => {
    setShowModal([false, null]);
  }

  const changeStatus = async (id, status) => {
    if (id && status) {
      const newStatus = status === 'published' ? 'draft' : 'published';
      const change = await instance.put(`/api/blog?id=${id}`, { status: newStatus }).then(res => {
        instance.get('/api/blog').then(res => {
          setBlogData(res.data)
          setFilterBlogs(res.data)
          toast.success(`Blog ${status} successfully`);
        })
      })
    } else {
      toast.error('Something went wrong!')
    }
  }

  const router = useRouter();

  const columns = [
    { name: "Thumbnail", selector: (row) => (<img src={row.featureImg} width={100} height={66} alt={row.imageAlt || "not found"} style={{ borderRadius: '6px', objectFit: "cover" }} />) },
    { name: "Title", selector: (row) => (<div className={styles.userIcon}><p className={styles.name}>{row.blogText}</p></div>), wrap: true },
    { name: "Author", selector: (row) => `${row.author}`, },
    { name: "Categories", selector: (row) => `${row.category}`, },
    {
      name: "Date",
      sortable: true,
      selector: (row) => moment(row.date).format("DD MMM, YYYY"),
    },
    {
      name: "Action", selector: (row) => (<>
        <div className={styles.action}>
          <div className={styles.delete} onClick={() => { deleteModal(row._id); }} style={{ "cursor": "pointer" }}>
            <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
          </div>
          <div className={styles.edit}>
            <Link href={`blog/${row._id}`}>
              <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
            </Link>
          </div>
          <button className={styles.btn + ' ' + (row.status === 'published' ? styles.published : styles.draft)}
            onClick={() => changeStatus(row._id, row.status)}
          >{
              row.status === 'published' ? 'Publish' : 'Draft'
            }</button>
        </div>
      </>), grow: 1,
    },
  ];

  return (<>
    <Head>
      <title>Portal || Blogs</title>
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
      <div className={styles.blogList}>
        <div className={styles.blogBtn}>
          <div className={styles.title}>
            <h2 className='page-title'>Blog</h2>
            <p className={styles.blogDesc}>Create, edit and manage the blogs on your site.</p>
          </div>
          <div className={styles.buttons}>
            <ButtonUi text='category' cssClass='btnuiplain' callBack={() => router.push('/admin/blog/categories')} />
            <ButtonUi text='Add Blog' cssClass='btnui-black' callBack={() => router.push('/admin/blog/addblog')} />
          </div>
        </div>
        <SearchBox text="Search Blogs" onSearch={(e) => setFilterBlogs(blogData.filter(b =>
          b?.blogText?.toLowerCase().includes(e.target.value.toLowerCase())
        ))} /><br />
        <DataTable columns={columns} data={filterBlogs} pagination responsive />
        <Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
          <Modal.Header closeButton>
            <Modal.Title>
              Delete Blogs
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className={styles.remove}>Are you sure you want to Delete Blog?</p>
          </Modal.Body>
          <Modal.Footer>
            <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
            <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deleteBlog} />
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  </>)
}
export async function getServerSideProps(context) {

  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  const apiEndpoints = [
    { key: 'blogData', endpoint: '/api/blog' }
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
