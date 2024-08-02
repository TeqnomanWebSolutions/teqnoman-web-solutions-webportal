import Layout from '@/components/Layout/Layout'
import React, { useState } from 'react';
import styles from '../../../../styles/blog.module.scss'
import DataTable from 'react-data-table-component';
import Image from 'next/image';
import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBox from '@/components/SearchBox/SearchBox';
import { instance } from '@/utils/Apiconfig';
import { Modal } from 'react-bootstrap';
import Head from 'next/head';

export default function Category({ categories }) {

  const router = useRouter();
  const [categoryData, setCategoryData] = useState(categories || []);
  const [showModal, setShowModal] = useState([false, null]);

  const deleteModal = (id) => {
    setShowModal([true, id]);
  };

  const deleteJob = async () => {
    const id = showModal[1]
    setShowModal([false, null]);
    const remove = await instance.delete(`/api/blogcategory?id=${id}`).then(res => {
      setCategoryData(categoryData.filter(d => d._id !== id))
      setShowModal([false, null]);
    })
  };

  const clearData = () => {
    setShowModal([false, null]);
  }

  const column = [
    {
      name: "Categories",
      selector: (row) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Image src={"/images/category.svg"} width={18} height={18} alt="category" style={{ marginRight: "10px" }} />
          {row.name}
        </div>
      ),
    },
    { name: "Current blog", selector: (row) => `${row.count || 0}` },
    {
      name: "Action", selector: (row) => (<>
        <div className={styles.action}>
          <div className={styles.delete} onClick={() => { deleteModal(row._id); }} style={{ "cursor": "pointer" }}>
            <Image src='/images/delete-icon.svg' width={15} height={18} alt='delete' />
          </div>
          <div className={styles.edit}>
            <Link href={`categories/${row._id}`}>
              <Image src='/images/edit-icon.svg' width={18} height={18} alt='edit' />
            </Link>
          </div>
        </div>
      </>), grow: 0.5
    },
  ];

  return (<>
    <Head>
      <title>Portal || Categories</title>
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
            <h2 className='page-title'>Category</h2>
            <SearchBox text="Search Categories" onSearch={(e) => setCategoryData(categories.filter(c =>
              c.name.toLowerCase().includes(e.target.value.toLowerCase())
            ))} />
          </div>
          <div className={styles.buttons}>
            <ButtonUi text='Add Categories' cssClass='btnui-black' callBack={() => router.push('categories/addcategory')} />
          </div>
        </div>
        <DataTable columns={column} data={categoryData} fixedHeader sortable pagination />
      </div>
      <Modal show={showModal[0]} className="holiday-modal" centered onHide={clearData}>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete Job
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={styles.remove}>Are you sure you want to Delete this category?</p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonUi cssClass="btnuiplain" text="Cancel" callBack={clearData} />
          <ButtonUi cssClass='btnuiRounded' text="Remove" callBack={deleteJob} />
        </Modal.Footer>
      </Modal>
    </Layout>
  </>)
}

export async function getServerSideProps(context) {

  const req = context.req;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;
  const apiEndpoints = [
    { key: 'categories', endpoint: `/api/blogcategory?type=withCount` }
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