/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import { Table, TableBody, TableCell, TableContainer, TableHead, Collapse, TablePagination, IconButton, TableRow, TableSortLabel } from "@mui/material";
import ranges from '../../../helper/calcendarOption';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Spinner from '../../common/Spinner';
import Error403 from '../../error_pages/Error403';
import Error500 from '../../error_pages/Error500';
import Swal from 'sweetalert2';
import MinimizeIcon from '@mui/icons-material/Minimize';

const InvoiceComponent = () => {
  const [clientData, setClientData] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [permission, setpermission] = useState("");
  const [serverError, setServerError] = useState(false);
  const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
  const [endDate, setendtDate] = useState(moment().clone().endOf('month'));
  const [open, setOpen] = useState("");
  const [client_id, setClient_id] = useState("");
  const [searchItem, setsearchItem] = useState("");

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("issue_date")
  const navigate = useNavigate();

  /*--------------------
     get invoice data
  ----------------------*/
  const fetchInvoice = async () => {
    setServerError(false)
    setisLoading(true);

    customAxios().get(`/invoice/?startDate=${moment(startDate).format("YYYY-MM-DD")}&endDate=${moment(endDate).format("YYYY-MM-DD")}&id=${client_id}`).then((res) => {
      if (res.data.success) {
        const { data, permissions } = res.data;
        setpermission(permissions);
        setRecords(data);
        setisLoading(false);
      }
    }).catch((error) => {
      setisLoading(false);
      if (!error.response) {
        setServerError(true)
        toast.error(error.message);
      } else {
        if (error.response.status === 500) {
          setServerError(true)
        }
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    });
  }

  /*--------------------
    get client name
  ----------------------*/
  const fetchClientName = async () => {
    setisLoading(true)
    try {
      const res = await customAxios().get('/invoice/client');

      if (res.data.success) {
        setClientData(res.data.data);
      }
    } catch (error) {
      if (!error.response) {
        toast.error(error.message);
      } else if (error.response.data.message) {
        toast.error(error.response.data.message);
      }
    } finally {
      setisLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoice();
    fetchClientName();
  }, [])


  /*--------------------
     Delete invoice funcation
  ----------------------*/
  const deleteInvoice = (id) => {
    Swal.fire({
      title: "Delete Invoice",
      text: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1bcfb4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      width: "450px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setisLoading(true);
        const res = await customAxios().delete(`/invoice/${id}`);
        if (res.data.success) {
          fetchInvoice();
          toast.success(res.data.message);
        }
      }
    }).catch((error) => {
      setisLoading(false);
      if (!error.response) {
        toast.error(error.message)
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  }

  // pagination function
  const onChangePage = (e, page) => {
    setpage(page)
  }

  const onChangeRowsPerPage = (e) => {
    setCount(e.target.value)
  }

  // sort function
  const handleRequestSort = (name) => {
    const isAsc = (orderBy === name && order === "asc");

    setOrderBy(name)
    setOrder(isAsc ? "desc" : "asc")
  }

  const descedingComparator = (a, b, orderBy) => {
    if (orderBy === "invoiceClient") {
      if (b[orderBy]["name"] < a[orderBy]["name"]) {
        return -1
      }
      if (b[orderBy]["name"] > a[orderBy]["name"]) {
        return 1
      }
      return 0
    } else {
      if (b[orderBy] < a[orderBy]) {
        return -1
      }
      if (b[orderBy] > a[orderBy]) {
        return 1
      }
      return 0
    }
  }

  const getComparator = (order, orderBy) => {
    return order === "desc" ? (a, b) => descedingComparator(a, b, orderBy) : (a, b) => -descedingComparator(a, b, orderBy)
  }

  const sortRowInformation = (array, comparator) => {
    const rowArray = array.map((elem, ind) => [elem, ind])

    rowArray.sort((a, b) => {
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return rowArray.map((el) => el[0])
  }

  // Collapse onchange
  const handleCollapse = (id) => {
    if (open === id) {
      setOpen("");
    } else {
      setOpen(id);
    }
  }

  // date range change function
  const handleCallback = (start, end, label) => {
    setStartDate(start._d)
    setendtDate(end._d);
  }

  const filterInvoice = () => {
    fetchInvoice()
  }

  // client onchange
  const clientChange = (event) => {
    setClient_id(event.target.value);
  }

  // search filter 
    // memoize filtered items
    const recordsFilter = useMemo(() => {
      return records.filter((item) => {
        return (
           (item.issue_date && moment(item.issue_date).format("DD MMM YYYY").toLowerCase().includes(searchItem.toLowerCase())) ||
           item.invoiceId.toLowerCase().includes(searchItem.toLowerCase()) ||
           item.invoiceClient?.name.toLowerCase().includes(searchItem.toLowerCase()) ||
           item.totalAmount.includes(searchItem.toLowerCase())
          )
      })
    }, [records, searchItem]);

  //  search onchange funcation
  const handleSearch = (event) =>{
    setsearchItem(event.target.value);
  }
 
  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if (!permission || permission.name.toLowerCase() !== "admin") {
    return <Error403 />;
  }

  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className=" container-fluid pt-4">
          <div className="background-wrapper bg-white pt-4">
            <div className=''>
              <div className='row justify-content-end align-items-center row-std m-0'>
                <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                  <div>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Invoice</NavLink></li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                  <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                    <div className="search-full w-25 pr-0 hide-at-small-screen">
                      <div className="form-group mb-0">
                        <select className="form-control mb-0" id="client" name='data' value={client_id} onChange={clientChange} >
                          <option value=''>All</option>
                          {clientData.map((val) => {
                            return (
                              <option key={val._id} value={val._id}>{val.name}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="form-group mb-0 position-relative w-25 hide-at-small-screen">
                      <div className="form-group mb-0 position-relative">
                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback}>
                          <input className="form-control mb-0" />
                        </DateRangePicker>
                        <CalendarMonthIcon className="range_icon" />
                      </div>
                    </div>
                    <button className='btn btn-gradient-primary btn-rounded btn-fw text-center hide-at-small-screen' onClick={filterInvoice}>
                      <i className="fa-solid fa-plus" ></i>&nbsp;Generate
                    </button>
                    <div className="search-full pr-0">
                      <input type="search" className="input-search-full" autoComplete='off' name="txt" placeholder="Search" value={searchItem} onChange={handleSearch}/>
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="search-box mr-3">
                      <form name="search-inner">
                        <input type="search" className="input-search" autoComplete='off' name="txt" value={searchItem} onChange={handleSearch} />
                      </form>
                      <i className="fas fa-search"></i>
                    </div>
                    {permission && permission.permissions.create === 1 &&
                      <div className='btn btn-gradient-primary btn-rounded btn-fw text-center csv-button' onClick={() => navigate("create")} >
                        <i className="fa-solid fa-plus"></i>&nbsp;Add
                      </div>}
                  </div>
                </div>
              </div>
              <div className='container-fluid show-at-small-screen'>
                <div className='row'>
                  <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                    <div className="form-group mb-0">
                      <select className="form-control mt-3" id="client" name='data' value={client_id} onChange={clientChange} >
                        <option value=''>All</option>
                        {clientData.map((val) => {
                          return (
                            <option key={val._id} value={val._id}>{val.name}</option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                  <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 ml-auto'>
                    <div className="form-group mb-0 position-relative">
                      <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback}>
                        <input className="form-control mt-3" />
                      </DateRangePicker>
                      <CalendarMonthIcon className="range_icon" />
                    </div>
                  </div>
                  <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                    <button className='btn btn-gradient-primary btn-rounded btn-fw text-center mt-3' onClick={filterInvoice}>
                      <i className="fa-solid fa-plus" ></i>&nbsp;Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-4 pt-4">
              <TableContainer >
                <Table className="common-table-section expanted-table">
                  <TableHead className="common-header">
                    <TableRow>
                      <TableCell style={{ width: "10px", padding: "16px 0" }} />
                      <TableCell>
                        <TableSortLabel active={orderBy === "issue_date"} direction={orderBy === "issue_date" ? order : "asc"} onClick={() => handleRequestSort("issue_date")}>
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "invoiceId"} direction={orderBy === "invoiceId" ? order : "asc"} onClick={() => handleRequestSort("invoiceId")}>
                          Invoice Id
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "invoiceClient"} direction={orderBy === "invoiceClient" ? order : "asc"} onClick={() => handleRequestSort("invoiceClient")}>
                          Billed To
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "totalAmount"} direction={orderBy === "totalAmount" ? order : "asc"} onClick={() => handleRequestSort("totalAmount")}>
                          Amount
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        status
                      </TableCell>
                      <TableCell>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                      return (
                        <React.Fragment key={ind}>
                          <TableRow>
                            <TableCell style={{ width: "10px", padding: "16px 0" }}>
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => handleCollapse(val._id)}
                              >
                                {open === val._id ? <RemoveIcon /> : <AddIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>{moment(val.issue_date).format("DD MMM YYYY")}</TableCell>
                            <TableCell>{val.invoiceId}</TableCell>
                            <TableCell>{val.invoiceClient.name}</TableCell>
                            <TableCell>&#8377;{val.totalAmount}</TableCell>
                            <TableCell>
                              <div >
                                {val.status === "Draft" ? <span className={val.status + "-invoice invoice-status"}>{val.status}</span> : <MinimizeIcon/>}
                                <br />
                                {val.status === "Unpaid" && val.due_date && <label className="mb-0 mt-1" htmlFor="due-date">Due on {moment(val.due_date).format("DD MMM YYYY")}</label>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="d-flex invoice-action">
                                <div className='text-center text-orange' onClick={() => navigate(`/invoice/preview/${val._id}`)}>
                                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                  <span className="d-block">Open</span>
                                </div>
                                <div className='text-center text-green' onClick={() => navigate(`/invoice/edit/${val._id}`)}>
                                  <i className="fa-solid fa-pencil"></i>
                                  <span className="d-block">Edit</span>
                                </div>
                                <div className='text-center text-primary' onClick={() => navigate(`/invoice/duplicate/${val._id}`)}>
                                  <i className="fa-regular fa-copy"></i>
                                  <span className="d-block">Duplicate</span>
                                </div>
                                <div className='text-center text-red' onClick={() => deleteInvoice(val._id)}>
                                  <i className="fa-solid fa-trash-can"></i>
                                  <span className="d-block">Delete</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            {/* child table show */}
                            <TableCell colSpan={8} style={{ padding: 0, background: '#f2f2f287', borderBottom: "none" }}>
                              <Collapse in={open === val._id} timeout="auto" unmountOnExit>
                                <Table size="small" aria-label="purchases">
                                  <TableHead className="common-header">
                                    <TableRow>
                                      <TableCell>Item Name</TableCell>
                                      <TableCell>Rate</TableCell>
                                      <TableCell >Quantity</TableCell>
                                      <TableCell >Amount</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {val.productDetails.map((elem) => {
                                      return (
                                        <TableRow key={elem._id}>
                                          <TableCell component="th" scope="row">{elem.itemName}</TableCell>
                                          <TableCell>{elem.rate}</TableCell>
                                          <TableCell>{elem.quantity}</TableCell>
                                          <TableCell>&#8377;{elem.amount}</TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      )
                    }) :
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No Records Found
                        </TableCell>
                      </TableRow>
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
                component="div"
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
                rowsPerPage={count}
                count={recordsFilter.length}
                page={page}>

              </TablePagination>
            </div >
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default InvoiceComponent