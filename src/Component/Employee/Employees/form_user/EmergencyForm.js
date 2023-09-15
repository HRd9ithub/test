import React from 'react'
import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';
import axios from 'axios';

const EmergencyForm = (props) => {
    let config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GetLocalStorage('token')}`
        },
    }
    let { userDetail, getEmployeeDetail, handleClose, getuser } = props

    const [emergency, setEmergncy] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
        relationship: ""
    })
    const [nameError, setNameError] = useState("")
    const [emailError, setemailError] = useState("")
    const [addressError, setaddressError] = useState("")
    const [phoneError, setphoneError] = useState("")
    const [relationshipError, setrelationshipError] = useState("")
    const [loader, setLoader] = useState(false);
    const [error, seterror] = useState([]);

    let { pathname } = useLocation();

    useEffect(() => {
        userDetail.emergency_contact.length > 0 &&
            setEmergncy(userDetail.emergency_contact[0])
    }, [userDetail])

    let { getCommonApi } = GlobalPageRedirect();

    // # onchnage function 
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setEmergncy({ ...emergency, [name]: value })
    }

    // # submit button
    const handleSubmit = async (e) => {
        e.preventDefault();
        nameValidation();
        emailValidation();
        phoneVlidation();
        addressValidtion();
        relationshipValidtion();
        seterror([]);

        let { name, email, address, phone, relationship } = emergency;

        if (!name || !email || !address || !phone || !relationship) {
            return false;
        } else if (nameError || emailError || addressError || phoneError || relationshipError) {
            return false;
        } else {
            try {
                setLoader(true)
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/emergency`, { relationship: relationship.charAt(0).toUpperCase() + relationship.slice(1), address, phone, email, user_id: userDetail && userDetail._id, name: name.charAt(0).toUpperCase() + name.slice(1) },config);
                if (response.data.success) {
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail();
                    }
                    toast.success(response.data.message)

                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        seterror(error.response.data.error);
                    }
                }
            } finally { setLoader(false) }
        }
    }


    // # validation for name 
    const nameValidation = () => {
        if (!emergency.name) {
            setNameError("Please enter name.");
        } else if (!emergency.name.match(/^[A-Za-z ]+$/) || emergency.name.trim().length === 0) {
            setNameError("Please enter valid name.");
        } else {
            setNameError("");
        }
    }

    // # validation for email
    const emailValidation = () => {
        // eslint-disable-next-line
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emergency.email) {
            setemailError("Please enter email address.");
        } else if (!emergency.email.match(mailformat)) {
            setemailError("Please enter a valid email address");
        } else {
            setemailError("")
        }
    }

    // # validation phone number
    const phoneVlidation = () => {
        if (!emergency.phone) {
            setphoneError("Please enter a mobile number.");
        } else if (emergency.phone.length !== 10 || !emergency.phone.match(/^[0-9]+$/)) {
            setphoneError("Please enter a valid mobile number.");
        } else {
            setphoneError("")
        }
    }

    // # validation for address
    const relationshipValidtion = () => {
        if (!emergency.relationship) {
            setrelationshipError("Please enter a relation ship.");
        } else if (!emergency.relationship.match(/^[A-Za-z]+$/)) {
            setrelationshipError("Please enter a valid relation ship.");
        } else {
            setrelationshipError("")
        }
    }
    // # validation for address
    const addressValidtion = () => {
        if (!emergency.address) {
            setaddressError("Please enter a address.");
        } else if (!emergency.address.trim()) {
            setaddressError("Please enter a valid address.");
        } else {
            setaddressError("")
        }
    }

    let history = useNavigate();
    // back btn
    const BackBtn = (e) => {
        e.preventDefault();
        if (pathname.toLocaleLowerCase().includes('/employees')) {
            history("/employees")
        } else {
            handleClose();
        }
    }

    return (
        <>
            <form className="forms-sample mt-2">
                <div className='row'>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Name</label>
                            <input type="text" className="form-control text-capitalize" id="2" placeholder="Enter name" name='name' onChange={InputEvent} value={emergency.name} autoComplete='off' onKeyUp={nameValidation} onBlur={nameValidation} />
                            {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Email</label>
                            <input type="text" className="form-control" id="2" placeholder="Enter email address" name='email' onChange={InputEvent} value={emergency.email} autoComplete='off' onKeyUp={emailValidation} onBlur={emailValidation} />
                            {emailError && <small id="emailHelp" className="form-text error">{emailError}</small>}
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Mobile Number</label>
                            <input type="text" className="form-control" id="2" maxLength={10} placeholder="Enter mobile number" name='phone' onChange={InputEvent} value={emergency.phone} autoComplete='off' onKeyUp={phoneVlidation}  onBlur={phoneVlidation}/>
                            {phoneError && <small id="emailHelp" className="form-text error">{phoneError}</small>}
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>relationship</label>
                            <input type="text" className="form-control  text-capitalize" id="2" placeholder="Enter relationship" name='relationship' onChange={InputEvent} value={emergency.relationship} autoComplete='off' onKeyUp={relationshipValidtion} onBlur={relationshipValidtion}  />
                            {relationshipError && <small id="emailHelp" className="form-text error">{relationshipError}</small>}
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className="form-group">
                            <label htmlFor="ADDREESS" className='mt-3'>Address</label>
                            <input type="text" className="form-control" id="ADDRESS" placeholder="Enter address" name='address' onChange={InputEvent} value={emergency.address} autoComplete='off' onKeyUp={addressValidtion} onBlur={addressValidtion} />
                            {addressError && <small id="emailHelp" className="form-text error">{addressError}</small>}
                        </div>
                    </div>
                </div>
                <ol>
                    {error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                    })}
                </ol>
                <div className="submit-section d-flex justify-content-between py-3">
                    <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                    <button className="btn btn-gradient-primary" onClick={handleSubmit}>Save</button>
                </div>
            </form>
            {loader && <Spinner />}
        </>
    )
}


EmergencyForm.propsTypes = {
    getEmployeeDetail: PropTypes.func,
    userDetail: PropTypes.object
}

export default EmergencyForm
