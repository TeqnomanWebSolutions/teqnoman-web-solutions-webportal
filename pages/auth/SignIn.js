import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import ButtonUi from "@/components/ButtonUi/ButtonUi";
import { instance } from "@/utils/Apiconfig";
import { toast } from "react-toastify";
import Head from "next/head";
import bcrypt from 'bcryptjs'

export function generateOTP() {
  const length = 6;
  const characters = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }
  return otp;
};

export async function encodeOTP(otp) {
  const hashedOTP = await bcrypt.hash(otp, 10);
  return hashedOTP;
};
export default function Signin() {
  const errors = {
    Signin: 'Try signing with a different account.',
    OAuthSignin: 'Try signing with a different account.',
    OAuthCallback: 'Try signing with a different account.',
    OAuthCreateAccount: 'Try signing with a different account.',
    EmailCreateAccount: 'Try signing with a different account.',
    Callback: 'Try signing with a different account.',
    OAuthAccountNotLinked:
      'To confirm your identity, sign in with the same account you used originally.',
    EmailSignin: 'Check your email address.',
    CredentialsSignin:
      'Sign in failed. Check the details you provided are correct.',
    default: 'Unable to sign in.',
  };

  const router = useRouter();
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeForm, setActiveForm] = useState("login");
  const [newpassword, setNewpassord] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));
  const [otp, setOTP] = useState('')
  const [userId, setUserId] = useState("")
  const [username, setUserName] = useState("")
  const [role, setRole] = useState(null)
  const { error } = router.query;
  useEffect(() => {
    if (error) {
      const errorMessage = error && (errors[error] ?? errors.default);
      toast.error("Username or Password is invalid.");
      setIsLoading(false);
    }
  }, [error]);

  function hideEmail(email) {
    const [username, domain] = email.split('@');
    const hiddenUsername = username.length > 2 ? username[0] + '*'.repeat(username.length - 2) + username.slice(-1) : username;
    return hiddenUsername + '@' + domain;
  }
  const template = (username, otp) => {
    return `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Template</title>
                <style>
                  body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                    color: #333333;
                  }
                  p {
                    font-size: 16px;
                    color: #555555;
                    line-height: 1.5;
                  }
                  strong {
                    font-weight: bold;
                    color: #007bff;
                  }
                  span.otp {
                    font-size: 20px;
                    color: #28a745;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Hello ${username},</h1>
                  <p>Your OTP is <strong><span class="otp">${otp}</span></strong></p>
                </div>
              </body>
            </html>`
  }

  const handleOtpTab = async (e) => {

    e.preventDefault();
    const emailCheckResponse = await instance.post('/api/emailcheck', { email });
    if (emailCheckResponse.data.exists) {
      const OTP = generateOTP();
      setUserId(emailCheckResponse.data.id)
      setUserName(emailCheckResponse.data.username)
      setRole(emailCheckResponse.data.role)
      const htmlData = template(emailCheckResponse.data.username, OTP)

      const otpConfig = {
        to: email,
        subject: `Your One Time Password is ${OTP} for Teqnoman Web Solutions Web-portal Account Recovery`,
        html: htmlData,
      };
      const sendotp = await toast.promise(instance.post('/api/email', otpConfig), {
        success: "Otp has been sent to your email",
        error: "An error occurs while sending otp",
        pending: "Sending OTP to your email address"
      });
      // const hashedotp = await encodeOTP(OTP)
      const storeotp = await instance.put(`/api/otp_verification?email=${email}`, { otp: OTP }).then(res => {
        if (res.data !== null && res.data.ok) {
          setActiveForm("otpVerification");
        }
      })
    } else {
      if (emailCheckResponse.data.deactive) {
        toast.error("Your account is deactivated. Please contact admin.");
      } else {
        toast.error("Email does not exist. Please check your email address.");
      }
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault()
    if (newpassword !== confirmPassword) {
      toast.error("Password doesn't Match")
    } else {
      const hashedPassword = await encodeOTP(newpassword)
      if (role === "admin") {
        const setpassword = toast.promise(instance.put(`/api/admins?id=${userId}`, { password: hashedPassword }).then(() => router.push("/")), {
          success: "Your password has been changed!",
          pending: "Updating Password...",
          error: "Error occurs while updating password!"
        })

      }
      if (role === "employee") {
        const setpassword = toast.promise(instance.put(`/api/employees?emp_id=${userId}`, { password: hashedPassword }).then(() => router.push("/")), {
          success: "Your password has been changed!",
          pending: "Updating Password...",
          error: "Error occurs while updating password!"
        })
      }
    }
  }

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    const newOTP = otp.slice(0, index) + value + otp.slice(index + 1);
    setOTP(newOTP);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault()
    const verifyotp = await instance.get(`/api/otp_verification?email=${email}`).then(async (res) => {
      const isCorrect = await bcrypt.compare(otp, res.data.otp)

      if (res.data.ok) {
        if (res.data.otp) {
          setActiveForm("resetPassword")
          const deleteotp = await instance.delete(`/api/otp_verification?email=${email}`)
          sessionStorage.removeItem("email")
        }
        else {
          toast.error("Invalid OTP")
        }
      } else {
        toast.error("Something went to wrong!")
      }
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await signIn("credentials", {
      email: email,
      password: password,
      redirect: true
    });

    if (res && res.error) {
      toast.error("Username or Password is invalid.");
      setIsLoading(false);
    } else {
      if (data?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data?.user?.role === "employee") {
        if (data?.user?.status === "onboard") {
          router.push("/onboard");
        }
        if (data?.user?.status === "active") {
          router.push("/dashboard");
        }
        if (data?.user?.status === "deactive") {
          signOut({
            redirect: false,
          })
          toast.error("Your account is deactivated. Please contact admin.");
        }
      } else {
        router.push("/auth/SignIn");
      }
      setIsLoading(false);
    }
  };

  return (<>
    <Head>
      <title>Teqnoman Web Solutions | Portal</title>
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
    <section>
      <div className="signin-div">
        <div className="signin-form">
          {activeForm === "login" && (<>
            <form onSubmit={handleSubmit} className="form">
              <h1>Log In  <Image src={'/images/login-icon.png'} height={28} width={18} alt={"login-icon"} /></h1>
              <div className="inputs">
                <label className="custom-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="custom-input"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="inputs">
                <label className="custom-label">Password</label>
                <input
                  type="password"
                  id="password"
                  className="custom-input"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="forget-password">
                <p onClick={() => setActiveForm("forgotPassword")}>
                  Forget password?
                </p>
              </div>
              <ButtonUi
                text={`${isLoading ? "Loading..." : "Login"}`}
                cssClass="btnui-black w-100"
                type={"submit"}
              />
            </form>
          </>)}
          {activeForm === "forgotPassword" && (<>
            <form className="form" onSubmit={handleOtpTab}>
              <h2 className="login-title">Forgot Password</h2>
              <p className="text">
                In order to retrieve your password, please enter registered
                email address
              </p>
              <div className="inputs">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="custom-input"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <ButtonUi
                text="Submit"
                cssClass="btnui-black w-100"
                type="submit"
              />
            </form>
          </>)}

          {activeForm === "otpVerification" && (<>
            <form className='form' onSubmit={verifyOTP}>
              <h2 className="login-title">OTP Verification</h2>
              <p className="text">Please enter the 6-digit code sent to {hideEmail(email)}</p>
              <div className='otpInputs'>
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    className="custom-input"
                    type="text"
                    maxLength={1}
                    required
                    onChange={(e) => handleInputChange(index, e)}
                    onFocus={() => inputRefs[index].current.select()}
                    ref={inputRefs[index]}
                  />
                ))}
              </div>
              <ButtonUi text="Verify OTP" cssClass="btnui-black w-100" type="submit" />
              <div >
                <p className='text resend'>Didn’t receive the OTP? <span onClick={handleOtpTab}>Resend code</span>
                </p>
              </div>
            </form>
            <p></p>
          </>)}
          {activeForm === "resetPassword" && (<>
            <form className="form" onSubmit={resetPassword}>
              <h2 className="login-title">Reset Password</h2>
              <p className="text">Please reset your password here</p>
              <div className="inputs">
                <input
                  type="password"
                  className="custom-input"
                  placeholder="New Password"
                  onChange={(e) => setNewpassord(e.target.value)}
                  required
                />
              </div>
              <div className="inputs">
                <input
                  type="password"
                  className="custom-input"
                  placeholder="Confirm New Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <ButtonUi
                text="Reset"
                cssClass="btnui-black w-100"
                type="submit"
              />
            </form>
          </>)}
        </div>
        <div className="right-side">
          <div className="inner-div">
            <h2 className="inner-content">Login now for excellent opportunities awaiting you.</h2>
            <div className="image">
              <Image src={'/images/girl-image.png'} height={533} width={305} alt="girl-image" />
            </div>
            <div className="handshalke">
              <Image src={"/images/hand-shake.png"} alt="hand-shake" height={50} width={50} />
            </div>
          </div>
        </div>
      </div>
    </section>
  </>);
}
