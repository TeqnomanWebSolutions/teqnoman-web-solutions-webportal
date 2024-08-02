import ButtonUi from '@/components/ButtonUi/ButtonUi';
import moment from 'moment';
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

export default function Template() {

  const router = useRouter();
  const handlePrint = () => {
    const element = document.getElementById('invoice-container')
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default(element, {
        margin: 0,
        filename: `TeqnomanWebSolutions_Invoice_${jsonData.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: false,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compressPDF: true,
          autoAddFonts: true,
          images: { jpeg: true, png: true },
        },
        pagebreak: { mode: ['css', 'legacy'], after: "#footer" }
      });
    });
  };

  const [jsonData, setJsonData] = useState({})
  const dataReceived = router.query.data;
  useEffect(() => {

    if (dataReceived) {
      const data = JSON?.parse(dataReceived);
      setJsonData(data)
    }
  }, [dataReceived])

  const getTotalPrice = jsonData?.invoice_details?.map((d) => {
    return parseInt(d.price)
  }).reduce((acc, value) => acc += value, 0)

  return (<>
    <Head>
      <title>Teqnoman Web Solutions Invoice Generator</title>
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
    <section className='template-section'>
      <div className='text-center'>
        <ButtonUi cssClass='btnuiRounded' text='Print' callBack={handlePrint} />
      </div>
      <div className='print-container'>
        <div className="invoice-container" id="invoice-container">
          <div className="main-header">
            <div className="logo-section">
              <img src="/images/invoice-log.png" className="invoice-logo" alt="" />
            </div>
            <div className="info-section">
              <div className="img">
                <img src="/images/building.png" alt="" />
              </div>
              <div className="text">
                <p className="title">Teqnoman Web Solutions</p>
                <address>406, 31FIVE Building,<br />Corporate Rd, Prahlad Nagar,<br />Ahmedabad, Gujarat - 380015<br />Phone: +91 8758431673</address>
              </div>
            </div>
          </div>

          <div className="invoice-header">
            <div className="company-section">
              <p className="info">Invoice To:</p>
              <p className="company-name">{jsonData.company_name}</p>
              <address>{jsonData.company_address}</address>
            </div>
            <div className="date-section">
              <div className="invoice">
                <p className="invoice-title">Invoice</p>
                <p className="invoice-data">{jsonData.invoice_number}</p>
              </div>
              <div className="date">
                <p className="date-title">Date</p>
                <p className="date-data">{moment(jsonData.issue_date, 'YYYY-MM-DD').format('DD-MM-YYYY')}</p>
              </div>
            </div>
          </div>

          <div className="table-section">
            <p className="title">Invoice Details</p>
            <table>
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Item Description</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {jsonData?.invoice_details?.map((d, index) => {
                  return (<>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{d.description}</td>
                      <td>{jsonData.currency}{d.price}</td>
                    </tr>
                  </>)
                })}
              </tbody>
            </table>
          </div>

          <div className="payment-section">
            <div className="teqnoman-web-solutions-detail">
              <p className="title">Payment Info:</p>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Email:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">info@teqnomanweb.com</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Account Name:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">Teqnoman Web Solutions</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Account No:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">072605002317</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Bank Name:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">ICICI Bank</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Account Type:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">Current account</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">SWIFT Code:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">ICICINBBCTS</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">IFSC Code:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">ICIC0000726</p>
                </div>
              </div>
              <div className="info-container">
                <div className="name-section">
                  <p className="name">Branch Name:</p>
                </div>
                <div className="detail-section">
                  <p className="detail">Khodiyar colony Jamnagar</p>
                  <p className="detail">Gujarat. 361006</p>
                </div>
              </div>
            </div>
            <div className="grand-total">
              <div className="grand-total-card">
                <p className="text">Grand Total</p>
                <p className="value">{jsonData.currency}{getTotalPrice}</p>
              </div>
              <div className="owner-detail">
                <img src="/images/mkj-sign.png" alt="" />
                <p className="owner-name">Mayursinh Jadeja</p>
                <p className="designation">Founder & CEO</p>
              </div>
            </div>
          </div>
          <footer id="footer">
            <div className="footer-section">
              <div className="tq-section">
                <p className="thank-you">Thank you</p>
              </div>
              <div className="contact-section">
                <a href="mailto:info@teqnomanweb.com"><img src="/images/email.png" alt="" /> info@teqnomanweb.com</a>
                <a href="https://teqnomanweb.com"><img src="/images/globe.png" alt="" /> teqnomanweb.com</a>
              </div>
            </div>
            <div className="lines">
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
              <div className="line line-4"></div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  </>)
}
