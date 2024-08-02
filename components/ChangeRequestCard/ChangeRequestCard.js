import React, { useState } from 'react';
import styles from './ChangeRequestCard.module.scss'
import { Modal } from "react-bootstrap";
import ButtonUi from '../ButtonUi/ButtonUi';
import { instance } from '@/utils/Apiconfig';
import moment from 'moment';

export const ChangeRequestCard = ({ changes, refreshData }) => {
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleClose = () => {
        setShowModal(false);
        setShowProfileModal(false);
    };

    const handleFieldClick = async (data) => {
        if (data.collectionName === "employee_qualification" || data.collectionName === "employment_history") {
            let res = await instance.get(`/api/${data.collectionName}?row_id=${data.row_id}`);
            data.extraInfo = res.data;
        }
        setShowModal(data);
    };

    const handleProfileClick = (data) => {
        setShowProfileModal(data);
    };

    const getFieldDetails = (fieldName) => {
        let result = changes.change_request.filter((c) => c.fieldName === fieldName);
        return result.length === 0 ? false : result[0];
    }

    const handleAction = async (action, data) => {
        if (action === "approve") {
            if (data.collectionName === "employee_bank_info") {
                let reqData = {
                    [data.fieldName]: data.newValue,
                    employee_id: data.user_id
                }
                await instance.put(data.apiURL, reqData);
            } else if (data.collectionName === "employees") {
                if (data.fieldName === "employee_profile") {
                    if (data.oldValue != "/images/dummy-profile.png" && data.oldValue.startsWith("https://files.teqnomanweb.com")) {
                        let params = Object.fromEntries(new URLSearchParams(data.oldValue));
                        let fileName = params.fileName;
                        await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${data.user_id}&fileName=${fileName}`);
                    }
                }
                let reqData = {
                    [data.fieldName]: data.newValue,
                }
                await instance.put(data.apiURL, reqData);
            } else {
                let reqData = {
                    employee_id: data.user_id,
                    [data.fieldName]: data.newValue,
                }
                await instance.put(data.apiURL, reqData);
            }
            await instance.delete(`/api/change_request?id=${data._id}`)
        } else {
            if (data.fieldName === "employee_profile") {
                if (data.newValue != "/images/dummy-profile.png" && data.newValue.startsWith("https://files.teqnomanweb.com")) {
                    let params = Object.fromEntries(new URLSearchParams(data.newValue));
                    let fileName = params.fileName;
                    await instance.delete(`https://files.teqnomanweb.com/media?path=employees/${data.user_id}&fileName=${fileName}`);
                }
            }
            await instance.delete(`/api/change_request?id=${data._id}`)
        }
        setShowModal(false);
        setShowProfileModal(false);
        refreshData(true);
    }

    const getModule = (module) => {
        switch (module) {
            case "employees":
                return "Personal Information"

            case "employee_qualification":
                return "Qualification Detail"

            case "employee_bank_info":
                return "Bank Information"

            case "employment_history":
                return "Past Experience"

            default:
                return ""
        }
    }

    return (<>
        <div className={styles.requestCard}>
            <p className='pb-3'><strong>Employee id: {changes.employee_id}</strong></p>
            <div className={styles.fieldInputs}>
                {/* if changed profile */}
                {getFieldDetails("employee_profile") && <div className={styles.profile} onClick={() => handleProfileClick(getFieldDetails("employee_profile"))}>
                    <img src={getFieldDetails("employee_profile").newValue} width={35} height={35} alt='profile' />
                </div>}
                {/* if changed profile */}

                {
                    changes.change_request.map((f, key) => {
                        if (f.fieldName != "employee_profile") {
                            return <>
                                <div className={styles.field} key={key} onClick={() => handleFieldClick(f)}>
                                    <p className={styles.label}>{f.fieldName} ({getModule(f.collectionName)})</p>
                                    <p className={styles.input}>{f.newValue}</p>
                                </div>
                            </>
                        }
                    })
                }
            </div>
        </div>

        <Modal show={showModal} className="holiday-modal" centered onHide={handleClose}>
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Change Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showModal && showModal?.collectionName === "employee_qualification" && <div className='fieldInputs mb-5'>
                        <div className={"field"}>
                            <p className={"label"}>Institute Name</p>
                            <p className={`input ${showModal?.fieldName === "institute_name" ? "text-danger" : ""}`}>{showModal?.extraInfo?.institute_name}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Course Name</p>
                            <p className={`input ${showModal?.fieldName === "course_name" ? "text-danger" : ""}`}>{showModal?.extraInfo?.course_name}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>CGPA/Percentage</p>
                            <p className={`input ${showModal?.fieldName === "percentage" ? "text-danger" : ""}`}>{showModal?.extraInfo?.percentage}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Start Year</p>
                            <p className={`input ${showModal?.fieldName === "start_year" ? "text-danger" : ""}`}>{showModal?.extraInfo?.start_year}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>End Year</p>
                            <p className={`input ${showModal?.fieldName === "end_year" ? "text-danger" : ""}`}>{showModal?.extraInfo?.end_year}</p>
                        </div>
                    </div>}
                    {showModal.collectionName === "employment_history" && <div className='fieldInputs mb-5'>
                        <div className={"field"}>
                            <p className={"label"}>Company Name</p>
                            <p className={`input ${showModal?.fieldName === "company_name" ? "text-danger" : ""}`}>{showModal?.extraInfo?.company_name}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Role</p>
                            <p className={`input ${showModal?.fieldName === "role" ? "text-danger" : ""}`}>{showModal?.extraInfo?.role}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Employment Type</p>
                            <p className={`input ${showModal?.fieldName === "employment_type" ? "text-danger" : ""}`}>{showModal?.extraInfo?.employment_type}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Annual Package</p>
                            <p className={`input ${showModal?.fieldName === "annual_package" ? "text-danger" : ""}`}>{showModal?.extraInfo?.annual_package}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Join Date</p>
                            <p className={`input ${showModal?.fieldName === "join_date" ? "text-danger" : ""}`}>{moment(showModal?.extraInfo?.join_date).format("DD MMM YYYY")}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Resign Date</p>
                            <p className={`input ${showModal?.fieldName === "resign_date" ? "text-danger" : ""}`}>{moment(showModal?.extraInfo?.resign_date).format("DD MMM YYYY")}</p>
                        </div>
                        <div className={"field"}>
                            <p className={"label"}>Description</p>
                            <p className={`input ${showModal?.fieldName === "description" ? "text-danger" : ""}`}>{showModal?.extraInfo?.description}</p>
                        </div>
                    </div>}
                    <div className='form-controls'>
                        <label className='custom-label'>Old Value input</label>
                        <input type='text' className='custom-input' value={showModal?.oldValue} readOnly />
                    </div>
                    <div className='form-controls'>
                        <label className='custom-label'>New Value input</label>
                        <input type='text' className='custom-input' value={showModal?.newValue} readOnly />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Reject" callBack={() => handleAction("reject", showModal)} />
                    <ButtonUi cssClass='btnuiRounded' text="Approve" callBack={() => handleAction("approve", showModal)} />
                </Modal.Footer>
            </form>
        </Modal>

        {/* Profile Modal */}
        <Modal show={showProfileModal} className="profile-modal" centered onHide={handleClose}>
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        User want to change Profile
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Profile Modal Content */}
                    <div className='profileUpdate'>
                        <div className='profileField'>
                            <label className='custom-label'>Old Profile</label>
                            <img src={showProfileModal.oldValue} width={80} height={80} alt='profile' />
                        </div>
                        <div className='profileField'>
                            <label className='custom-label'>New Profile</label>
                            <img src={showProfileModal.newValue} width={80} height={80} alt='profile' />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonUi cssClass="btnuiplain" text="Reject" callBack={() => handleAction("reject", showProfileModal)} />
                    <ButtonUi cssClass='btnuiRounded' text="Approve" callBack={() => handleAction("approve", showProfileModal)} />
                </Modal.Footer>
            </form>
        </Modal>
    </>)
}
