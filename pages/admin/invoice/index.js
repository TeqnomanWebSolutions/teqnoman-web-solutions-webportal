import ButtonUi from '@/components/ButtonUi/ButtonUi';
import Layout from '@/components/Layout/Layout';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import styles from '/styles/invoice.module.scss'
import { Tab, Tabs } from 'react-bootstrap';
import currency from '../../../currency-list.json';
import { State } from 'country-state-city';
import Image from 'next/image';
import Head from 'next/head';

export default function AddInvoice() {

  const [projects, setProjects] = useState([{ description: '', price: '' }]);

  const addProject = () => {
    setProjects([...projects, { description: '', price: '' }]);
  };

  const removeProject = (index) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
  };

  const handleInputChange = (index, name, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    setProjects(updatedProjects);
  };

  const [invoiceType, setInvoiceType] = useState('fixed');
  const [selectedState, setSelectedState] = useState('Gujarat');

  const handleRadioChange = (event) => {
    setInvoiceType(event.target.value);
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  const [foreignDataObject, setForeignDataObject] = useState({
    invoice_details: [
      {
        description: "",
        price: ""
      }
    ]
  })
  const [indianDataObject, setIndianDataObject] = useState({
    invoice_details: [
      {
        description: "",
        price: ""
      }
    ]
  })

  const router = useRouter()

  const handleCalculateIndianData = () => {
    router.push({
      pathname: '/admin/invoice/indian-template',
      query: { data: JSON.stringify(indianDataObject) },
    });
  }

  const handleCalculateForeignData = () => {
    router.push({
      pathname: '/admin/invoice/foreign-template',
      query: { data: JSON.stringify(foreignDataObject) },
    });
  }

  const [activeTab, setActiveTab] = useState("Foreign");

  return (<>
    <Head>
      <title>Portal || Invoice</title>
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
      <section className={`invoice ${styles.mainSection}`}>
        <div className="custom-container">
          <div className={styles.projectHead}>Invoice <Image className={styles.arrow} src="/images/project-right.png" width={5} height={9} alt='project' /><span className={styles.projectName}> {activeTab === "Foreign" ? "Foreign" : "Indian"} </span></div>
          <Tabs defaultActiveKey={activeTab} onSelect={(key) => setActiveTab(key)} transition={true} id="noanim-tab-example" className="mb-3">
            <Tab eventKey="Foreign" title="Foreign">
              <section className={styles.invoice}>
                <div className="custom-container">
                  <form className="form">
                    <div>
                      <h2 className="form-title">Company Details</h2>
                      <div className="border-box">
                        <div className="row">
                          <div className="col-lg-4 col-md-6">
                            <div className='spacing'>
                              <label
                                htmlFor="company_name"
                                className="custom-label"
                              >Company Name</label>
                              <input
                                type="text"
                                placeholder="Enter Company Name"
                                name="company_name"
                                className='custom-input'
                                required
                                onChange={(e) => setForeignDataObject({ ...foreignDataObject, company_name: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-lg-8 col-md-6">
                            <div>
                              <label
                                htmlFor="company_address"
                                className="custom-label"
                              >Company Address</label>
                              <input
                                type="text"
                                placeholder="Enter Company Address"
                                name="company_address"
                                className='custom-input'
                                required
                                onChange={(e) => setForeignDataObject({ ...foreignDataObject, company_address: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="form-title">General Details</h2>
                      <div className="border-box">
                        <div className="row">
                          <div className="col-md-4">
                            <div className='spacing'>
                              <label
                                htmlFor="company_name"
                                className="custom-label"
                              >Invoice No.</label>
                              <input
                                type="text"
                                placeholder="Enter Invoice No."
                                name="invoice_number"
                                className='custom-input'
                                required
                                onChange={(e) => setForeignDataObject({ ...foreignDataObject, invoice_number: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className='spacing'>
                              <label
                                htmlFor="company_address"
                                className="custom-label"
                              >Issue date</label>
                              <input
                                type="date"
                                placeholder="Enter Issue date"
                                name="issue_date"
                                className='custom-input'
                                required
                                onChange={(e) => setForeignDataObject({ ...foreignDataObject, issue_date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <label htmlFor="company_address" className="custom-label">Currency</label>
                              <select
                                className='custom-input'
                                name='currency'
                                onChange={(e) => setForeignDataObject({ ...foreignDataObject, currency: e.target.value })}
                              >
                                <option disabled selected>Select Currency</option>
                                {currency.map((d, key) => {
                                  return (<option key={key} value={d.symbol}>{d.name} ({d.code})</option>)
                                })}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="form-title">Invoice Details</h2>
                      <div className="border-box">
                        {foreignDataObject?.invoice_details?.map((project, index) => (<>
                          <div className="row" key={index}>
                            <div className="col-md-8">
                              <div className='form-controls'>
                                <label htmlFor={`project_description_${index}`} className="custom-label">Project Description</label>
                                <input
                                  type="text"
                                  placeholder="Enter Project Description"
                                  name={`project_description_${index}`}
                                  className='custom-input'
                                  onChange={(e) =>
                                    setForeignDataObject((prevData) => ({
                                      ...prevData,
                                      invoice_details: prevData.invoice_details.map((item, i) =>
                                        i === index
                                          ? { ...item, description: e.target.value }
                                          : item
                                      )
                                    }))
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className='form-controls'>
                                <label htmlFor={`price_${index}`} className="custom-label">Price</label>
                                <input
                                  type="number"
                                  placeholder="Enter Price"
                                  name={`price_${index}`}
                                  className='custom-input'
                                  onChange={(e) =>
                                    setForeignDataObject((prevData) => ({
                                      ...prevData,
                                      invoice_details: prevData.invoice_details.map((item, i) =>
                                        i === index ? { ...item, price: e.target.value } : item
                                      )
                                    }))
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          {index !== 0 && (
                            <div className={`${styles.delete}`}>
                              <p onClick={() => setForeignDataObject((prevData) => ({
                                ...prevData,
                                invoice_details: prevData.invoice_details.filter((_, i) => i !== index)
                              }))}>Delete</p>
                            </div>
                          )}
                        </>))}
                        <div className={styles.addMore} >
                          <button type='button' className={styles.button} onClick={() => setForeignDataObject((prevData) => ({
                            ...prevData,
                            invoice_details: [
                              ...prevData.invoice_details,
                              {
                                description: "",
                                price: ""
                              }
                            ]
                          }))}>+ Add more</button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.addMore}>
                      <ButtonUi
                        cssClass='btnuiRounded'
                        text='Calculate & Print'
                        style={{ marginRight: '10px' }}
                        callBack={handleCalculateForeignData}
                      />
                    </div>
                  </form>
                </div>
              </section>
            </Tab>
            <Tab eventKey="Indian" title="Indian">
              <section className={styles.invoice}>
                <div className="custom-container">
                  <form className="form">
                    <div>
                      <h2 className="form-title">Company Details</h2>
                      <div className="border-box">
                        <div className="row">
                          <div className="col-lg-4 col-md-6">
                            <div className='form-controls'>
                              <label htmlFor="company_name" className="custom-label">Company Name</label>
                              <input
                                type="text"
                                placeholder="Enter Company Name"
                                name="company_name"
                                className='custom-input'
                                required
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, company_name: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-lg-8 col-md-6">
                            <div className='form-controls'>
                              <label htmlFor="company_address" className="custom-label">Company Address</label>
                              <input
                                type="text"
                                placeholder="Enter Company Address"
                                name="company_address"
                                className='custom-input'
                                required
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, company_address: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div className='spacing'>
                              <label htmlFor="company_name" className="custom-label">State</label>
                              <select
                                className='custom-input'
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, state: e.target.value })}
                              >
                                <option value='' disabled selected>Select State</option>
                                {State.getStatesOfCountry('IN').map((d, key) => {
                                  return (<option key={key} value={d.name}>{d.name}</option>)
                                })}
                              </select>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div>
                              <label htmlFor="GST_No" className="custom-label">GST No.</label>
                              <input
                                type="text"
                                placeholder="Enter GST No."
                                name="gst_number"
                                className='custom-input'
                                required
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, gst_number: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="form-title">General Details</h2>
                      <div className="border-box">
                        <div className="row">
                          <div className="col-lg-4 col-md-6">
                            <div className='spacing'>
                              <label htmlFor="company_name" className="custom-label">Invoice No.</label>
                              <input
                                type="text"
                                placeholder="Enter Invoice No."
                                name="invoice_number"
                                className='custom-input'
                                required
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, invoice_number: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div>
                              <label htmlFor="company_address" className="custom-label">Issue date</label>
                              <input
                                type="date"
                                placeholder="Enter Issue date"
                                name="issue_date"
                                className='custom-input'
                                required
                                onChange={(e) => setIndianDataObject({ ...indianDataObject, issue_date: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="form-title">Invoice Details</h2>
                      <div className={styles.invoiceBtns}>
                        <div className={styles.inputBtn}>
                          <input
                            type="radio"
                            name="invoice_type"
                            value="fixed"
                            onChange={(e) => { setIndianDataObject({ ...indianDataObject, invoice_type: e.target.value }); handleRadioChange(e) }}
                            id='fixed'
                          />
                          <label htmlFor="fixed"> Fixed</label>
                        </div>
                        <div className={styles.inputBtn}>
                          <input
                            type="radio"
                            name="invoice_type"
                            value="custom"
                            onChange={(e) => { setIndianDataObject({ ...indianDataObject, invoice_type: e.target.value }); handleRadioChange(e) }}
                            id='custom'
                          />
                          <label htmlFor="custom"> Custom</label>
                        </div>
                      </div>
                      {indianDataObject.invoice_type && <div className="border-box">
                        {invoiceType === 'fixed' ? (
                          <div className="row">
                            <div className="col-lg-4 col-sm-6">
                              <div className="form-controls">
                                <label htmlFor="total_price" className="custom-label">Total Project Price</label>
                                <div className='input-rupees'>
                                  <input
                                    type="number"
                                    placeholder="Enter Total Project Price"
                                    name="total_project_price"
                                    className='custom-input'
                                    onChange={(e) => setIndianDataObject({ ...indianDataObject, total_project_price: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6">
                              <div className="form-controls">
                                <label htmlFor="percentage" className="custom-label">Percentage</label>
                                <div className="input-percentage">
                                  <input
                                    type="number"
                                    placeholder="Enter Percentage"
                                    name="project_price_percentage"
                                    className='custom-input'
                                    required
                                    onChange={(e) => setIndianDataObject({ ...indianDataObject, project_price_percentage: e.target.value, subtotal: indianDataObject.total_project_price * e.target.value / 100 })}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6">
                              <div className="form-controls ">
                                <label htmlFor="Sub_Total" className="custom-label">Sub Total</label>
                                <div className='input-rupees'>
                                  <input
                                    type="number"
                                    placeholder="Enter Sub Total"
                                    name="subtotal"
                                    className='custom-input'
                                    value={indianDataObject.subtotal}
                                    readOnly
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-12 col-sm-6">
                              <div>
                                <label htmlFor="Project_Description" className="custom-label">Project Description</label>
                                <input
                                  type="text"
                                  placeholder="Enter Project Description"
                                  name="project_description"
                                  className='custom-input'
                                  required
                                  onChange={(e) => setIndianDataObject({ ...indianDataObject, project_description: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {indianDataObject?.invoice_details?.map((project, index) => (<>
                              <div className="row" key={index}>
                                <div className="col-md-8">
                                  <div className='form-controls'>
                                    <label htmlFor={`project_description_${index}`} className="custom-label">Project Description</label>
                                    <input
                                      type="text"
                                      placeholder="Enter Project Description"
                                      name={`project_description_${index}`}
                                      className='custom-input'
                                      onChange={(e) =>
                                        setIndianDataObject((prevData) => ({
                                          ...prevData,
                                          invoice_details: prevData.invoice_details.map((item, i) =>
                                            i === index
                                              ? { ...item, description: e.target.value }
                                              : item
                                          )
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className='form-controls'>
                                    <label htmlFor={`price_${index}`} className="custom-label">Price</label>
                                    <input
                                      type="number"
                                      placeholder="Enter Price"
                                      name={`price_${index}`}
                                      className='custom-input'
                                      onChange={(e) => {
                                        setIndianDataObject((prevData) => ({
                                          ...prevData,
                                          invoice_details: prevData.invoice_details.map((item, i) =>
                                            i === index
                                              ? { ...item, price: e.target.value }
                                              : item
                                          ),
                                          subtotal: prevData.invoice_details.map((item, i) =>
                                            i === index
                                              ? { ...item, price: e.target.value }
                                              : item
                                          ).map(d => parseInt(d.price)).reduce((acc, val) => acc += val, 0)
                                        }))
                                      }
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                              {index !== 0 && (
                                <div className={`${styles.delete}`}>
                                  <p onClick={() => setIndianDataObject((prevData) => ({
                                    ...prevData,
                                    invoice_details: prevData.invoice_details.filter((_, i) => i !== index)
                                  }))}>Delete</p>
                                </div>
                              )}
                            </>))}
                            <div className={styles.addMore}>
                              <button type='button' className={styles.button} onClick={() => setIndianDataObject((prevData) => ({
                                ...prevData,
                                invoice_details: [
                                  ...prevData.invoice_details,
                                  {
                                    description: "",
                                    price: ""
                                  }
                                ]
                              }))}>+ Add more</button>
                            </div>
                          </div>
                        )}
                      </div>}
                    </div>

                    <div>
                      <h2 className="form-title">GST Calculation</h2>
                      <div className={styles.invoiceBtns}>
                        <div className={styles.inputBtn}>
                          <input
                            type="radio"
                            name="gst_calculation"
                            value="exclusive_gst"
                            id='Exclusive_GST'
                            onChange={(e) => setIndianDataObject({ ...indianDataObject, gst_calculation: e.target.value })}
                          />
                          <label htmlFor="Exclusive_GST"> Exclusive GST</label>
                        </div>
                        <div className={styles.inputBtn}>
                          <input
                            type="radio"
                            name="gst_calculation"
                            value="inclusive_gst"
                            id='Inclusive_GST'
                            onChange={(e) => setIndianDataObject({ ...indianDataObject, gst_calculation: e.target.value })}
                          />
                          <label htmlFor="Inclusive_GST"> Inclusive GST</label>
                        </div>
                      </div>
                      {indianDataObject.gst_calculation && <div className="border-box">
                        {indianDataObject.state === 'Gujarat' ? (
                          <div>
                            <div className={styles.GSTCalc}>
                              <div className={styles.gstDiv}>
                                <div className={styles.gst}>
                                  <p className={styles.gstType}>CGST</p>
                                  <p className={styles.gstAmount}>9% <span>₹{indianDataObject.subtotal * 9 / 100 || 0} </span></p>
                                </div>
                                <div>
                                  <div className={styles.gst}>
                                    <p className={styles.gstType}>SGST</p>
                                    <p className={styles.gstAmount}>9% <span>₹{indianDataObject.subtotal * 9 / 100 || 0}</span></p>
                                  </div>
                                </div>
                              </div>

                              <div className={styles.gstDiv}>
                                <div className={styles.gst}>
                                  <p className={styles.gstType}>Total</p>
                                  <p className={styles.gstAmount}>₹{indianDataObject.gst_calculation == 'exclusive_gst' ? Math.round((indianDataObject.subtotal * 0.18) + indianDataObject.subtotal) : Math.round(indianDataObject.subtotal) || 0}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className={styles.GSTCalc}>
                              <div className={styles.gstDiv}>
                                <div className={styles.gst}>
                                  <p className={styles.gstType}>IGST</p>
                                  <p className={styles.gstAmount}>18% <span>₹
                                    {indianDataObject.invoice_type == "fixed" ? Math.round(indianDataObject.subtotal * 0.18) : Math.round(indianDataObject.invoice_details.map(d => parseInt(d.price)).reduce((acc, val) => acc += val) * 0.18) || 0}
                                  </span></p>
                                </div>
                              </div>

                              <div className={styles.gstDiv}>
                                <div className={styles.gst}>
                                  <p className={styles.gstType}>Total</p>
                                  <p className={styles.gstAmount}>₹{indianDataObject.gst_calculation == 'exclusive_gst' ? Math.round((indianDataObject.subtotal * 0.18) + indianDataObject.subtotal) : Math.round(indianDataObject.subtotal) || 0}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>}
                    </div>

                    <div className={styles.addMore}>
                      <ButtonUi
                        cssClass='btnuiRounded'
                        text='Calculate & Print'
                        style={{ marginRight: '10px' }}
                        callBack={handleCalculateIndianData}
                      />
                    </div>
                  </form>
                </div>
              </section>
            </Tab>
          </Tabs>
        </div>
      </section>
    </Layout>
  </>
  )
}
