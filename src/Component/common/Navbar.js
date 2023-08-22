import React, { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globalcomponent } from '../auth_context/GlobalComponent';
import { AppProvider } from '../context/RouteContext';
import moment from 'moment';
import { useEffect } from 'react';
import Spinner from './Spinner';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import { useState } from 'react';
import { HiOutlineMinus } from "react-icons/hi";
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
// import { Trans } from 'react-i18next';

const Navbar = () => {
  let { handleLogout, loader } = Globalcomponent()
  let { UserData, leaveNotification, getLeave, setLoading, setSidebarToggle, sidebarToggle, sidebarRef, setlogoToggle } = useContext(AppProvider);
  const [dropdownbtnToggle, setdropdownbtnToggle] = useState(false);
  const [sidebar, setsidebar] = useState(false);

  const toggleOffcanvas = () => {
    setSidebarToggle(!sidebarToggle)
  }

  let { getCommonApi } = GlobalPageRedirect();

  let { pathname } = useLocation();

  useEffect(() => {
    // HandleButton()
    let data = localStorage.getItem("sidebarToggle")

    if (!data || data === 'false') {
      document.body.classList.add('sidebar-icon-only');
      setlogoToggle(false)
    } else {
      document.body.classList.remove('sidebar-icon-only');
      setlogoToggle(true)
    }
// eslint-disable-next-line
  }, [sidebar])

  // get leave notification
  useEffect(() => {
    if (GetLocalStorage("token") && UserData?.role?.name.toLowerCase() === "admin") {
      getLeave();
    }
    // eslint-disable-next-line
  }, [pathname])

  // page redirect
  let history = useNavigate();

  // leave status change
  const changeStatus = async (id) => {
    try {
      setLoading(true)
      let token = GetLocalStorage('token');
      const request = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/status`, { id: id, status: "Read" }, request)
      if (res.data.success) {
        getLeave();
        history('/leave')
      } else {
        setLoading(false)
        toast.error("Something went wrong, Please check your details and try again.")
      }
    } catch (error) {
      setLoading(false)
      console.log('error', error)
      if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  }

  // view all click
  const allStatusChange = async () => {
    let record = []
    leaveNotification.forEach((val) => {
      record.push({ id: val.id, status: "read" })
    })

    try {
      setLoading(true)
      let token = GetLocalStorage('token');
      const request = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/allStatus`, { record: JSON.stringify(record) }, request)
      if (res.data.success) {
        getLeave();
        history('/leave')
      } else {
        setLoading(false)
        toast.error("Something went wrong, Please check your details and try again.")
      }
    } catch (error) {
      setLoading(false)
      console.log('error', error)
      if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        } else {
          toast.error(error.response.data.error)
        }
      }
    }
  }

  return (
    <nav className="navbar default-layout-navbar ">
      <div className="navbar-menu-wrapper d-flex align-items-stretch">
        {/* <img src='/Images/d9_logo_black.png' className='logo-none' alt="logo" /> */}
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" >
          <span className="mdi mdi-menu" onClick={() => {
            let data = localStorage.getItem("sidebarToggle")
            if (!data || data === 'false') {
              localStorage.setItem("sidebarToggle", true);
            } else {
              localStorage.setItem("sidebarToggle", false);
            }
            setsidebar(!sidebar)
          }}></span>
        </button>
        <ul className="navbar-nav navbar-nav-right">
          {/* profile drop drown */}
          <li className="nav-item nav-profile">
            <Dropdown alignRight>
              <Dropdown.Toggle className="nav-link" >
                <div className="nav-profile-img">
                  {UserData && <img src={`${UserData.profile_image && process.env.REACT_APP_IMAGE_API}/storage/${UserData.profile_image}`} alt="user" />}
                  <span className="availability-status online"></span>
                </div>
                <div className="nav-profile-text">
                  <p className="mb-1 text-white text-capitalize">{UserData.first_name && UserData.first_name.concat(" ", UserData.last_name)}<i className="fa-solid fa-chevron-down"
                    style={{
                      fontSize: '12px',
                      marginLeft: '5px'
                    }}
                  ></i></p>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="navbar-dropdown">
                <Dropdown.Item className='dropdown-item' onClick={() => history(`/profile/${UserData.id}`)}>
                  <i className="mdi mdi-account-circle mr-2 text-primary"></i>
                  Profile
                </Dropdown.Item>
                <div className="dropdown-divider"></div>
                <Dropdown.Item className='dropdown-item' onClick={handleLogout}>
                  <i className="mdi mdi-logout mr-2 text-primary"></i>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
          {/* notification drop drown */}
          {(UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') &&
            <li className="nav-item">
              <Dropdown alignRight>
                <Dropdown.Toggle className="nav-link count-indicator">
                  <i className="fa-solid fa-bell nav-icons"></i>
                  <span className="badge badge-light">{leaveNotification.length}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu navbar-dropdown preview-list " style={{ width: "26rem" }} >
                  <h6 className="p-3 mb-0 new-message">Notifications</h6>
                  <div className="dropdown-divider"></div>
                  <div className='notification-box'>
                    <div className="accordion" id="accordionExample">
                      <div className="card mb-0">
                        <div className="card-header" style={{ padding: "0.3rem" }} id="headingOne">
                          <h2 className="mb-0 ">
                            <button className="btn btn-link d-flex justify-content-between align-items-center" onClick={() => setdropdownbtnToggle(!dropdownbtnToggle)} type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                              Leave
                              {!dropdownbtnToggle ? <FaAngleDown className='drop-leave-icon' data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" /> : <FaAngleLeft data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" />}
                            </button>
                          </h2>
                        </div>
                        <div className="dropdown-divider"></div>
                        <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                          <div className={` leave-notification-body ${leaveNotification.length === 0 ? "mb-3" : "card-body"}`}>
                            {leaveNotification.sort(function (a, b) {
                              return new Date(b.from_date) - new Date(a.from_date)
                            }).map((elem) => {
                              return (
                                <div key={elem.id}>
                                  <Dropdown.Item className="dropdown-item preview-item" onClick={evt => {
                                    evt.preventDefault()
                                    changeStatus(elem.id)
                                  }}>
                                    <div className="preview-thumbnail">
                                      <div className="preview-icon bg-success">
                                        {elem.user && elem.user.profile_image &&
                                        // eslint-disable-next-line
                                          <img src={`${process.env.REACT_APP_IMAGE_API}/storage/${elem.user.profile_image}`} alt='image' />}
                                      </div>
                                    </div>
                                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                      <div className='d-flex justify-content-between' style={{ gap: "50px" }}>
                                        <h6 className="preview-subject font-weight-normal mb-1">{elem.user ? elem.user.first_name.concat(" ", elem.user.last_name) : <HiOutlineMinus />}</h6>
                                        <small style={{ color: '#aaaa', marginTop: '3px' }}>{moment(elem.from_date).format("DD MMM")}</small>
                                      </div>
                                      <p className="text-gray ellipsis mb-0">
                                        {elem.leave_type.name} Request
                                      </p>
                                    </div>
                                  </Dropdown.Item>
                                  <div className="dropdown-divider"></div>
                                </div>
                              )
                            })}
                            {leaveNotification.length === 0 &&
                              <div className='d-flex align-items-center justify-content-center'>
                                <label>No data avilable</label>
                              </div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {leaveNotification.length > 0 && <>
                    <div className="dropdown-divider"></div>
                    <Dropdown.Item className="dropdown-item preview-item justify-content-center" onClick={evt => {
                      evt.preventDefault()
                      allStatusChange()
                    }}>
                      <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                        <div className='d-flex justify-content-between' style={{ gap: "50px" }}>
                          <h6 className="preview-subject font-weight-normal mb-1">View all</h6>
                        </div>
                      </div>
                    </Dropdown.Item>
                  </>}
                </Dropdown.Menu>
              </Dropdown>
            </li>
          }
        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" ref={sidebarRef} type="button" onClick={toggleOffcanvas}>
          <span className="mdi mdi-menu sider-menu"></span>
        </button>
      </div>
      <div className="nav-standard">
      </div>
      {(loader) && <Spinner />}
    </nav>
  );
}

export default Navbar;
