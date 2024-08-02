import Layout from '@/components/Layout/Layout'
import ProjectDetail from '@/components/ProjectDetail/ProjectDetail'
import React, { useEffect } from 'react'
import styles from "../../components/ProjectDetail/ProjectDetail.module.scss"
import Image from 'next/image'
import { instance } from '@/utils/Apiconfig'
import moment from 'moment'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

const Projectdetail = ({ projects }) => {

  const router = useRouter()

  if (!projects) {
    return <Layout>
      <div style={{ textAlign: 'center' }}>You are not assigned to this project!</div>
    </Layout>
  }

  const fileDownloads = projects.attachments || [];
  const users = projects.employee_data.map(p => {
    return {
      profileImg: p.employee_profile
    }
  })

  return (<>
    <Head>
      <title>Portal || Project Detail</title>
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
      <div className={styles.projectHead}>Projects <Image className={styles.arrow} src="/images/project-right.png" width={5} height={9} alt='arrow' /><span className={styles.projectName}>{projects.name}</span></div>
      <ProjectDetail
        name={projects.name}
        department={projects.type}
        start_date={moment(projects.start_date).format("DD/MM/YYYY")}
        end_date={moment(projects.end_date).format("DD/MM/YYYY")}
        description={projects.description}
        badge={projects.status}
        users={projects.employee_data}
        fileDownloads={fileDownloads}
      />
    </Layout>
  </>)
}

export default Projectdetail;

export async function getServerSideProps(context) {

  const req = context.req;
  const session = await getSession(context)
  const ID = session.user.id
  const project_id = context.query.project;
  const dev = process.env.NODE_ENV !== 'production';
  const baseUrl = dev ? `http://${req.headers.host}` : process.env.HOST;

  const apiEndpoints = [
    { key: 'projects', endpoint: `/api/projects?project_id=${project_id}` },
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

    if (data.projects.employee_data.filter(p => p.employee_id === ID).length === 0) {
      return { props: { mess: "You are not assigned to this project" } };
    }
    return { props: data };
  }
}