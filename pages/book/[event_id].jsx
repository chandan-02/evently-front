/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from '../../styles/Book.module.css';
import axios from "../../helper/axios";
import useRazorpay from "react-razorpay";
import moment from 'moment';

const Book = () => {
    const Razorpay = useRazorpay(); // razorpay hook

    const [slide, setSlide] = useState(1); // 1. booking 2. Payment 3. Please complete your payment -> redirect 

    const router = useRouter();
    const { event_id } = router.query;
    // console.log(event_id, router.query);
    const [seats, setSeats] = useState([]);
    const [seatsSelected, setSeatsSelected] = useState([]);
    const [steps, setSteps] = useState(0);
    const [loading, setLoading] = useState(false);

    //booking person details;
    const [customer, setCustomer] = useState({ name: '', email: '', mobile: '', }) //before booking
    const [otp, setOTP] = useState({ otp: '', success: false }) //before booking
    const [trueCustomer, setTrueCustomer] = useState({});

    const [event, setEvent] = useState({});

    const getEventData = async () => {
        try {
            const getEvents = await axios.get(`front/event/${event_id}`);
            setEvent(getEvents?.data?.data);
            console.log(getEvents?.data?.data);
        } catch (error) {
            if (error?.response?.data) {
                alert('Error', error?.response?.data?.data, 'error');
            } else {
                alert('Error', error?.message, 'error');
            }
        }
    }

    const getUserData = async () => {
        // setDataLoading(true)
        try {
            const getSeats = await axios.get(`/front/seat/${event_id}`);
            // console.log(getSeats?.data?.data); //18 object arr <- sort
            // setSeats(getSeats?.data?.data);
            setSeats(getSeats.data?.data?.sort((a, b) => {
                return /[A-Za-z]/.test(a.seat) - /[A-Za-z]/.test(b.seat) || a.seat.charCodeAt(0) - b.seat.charCodeAt(0)
            }))

        } catch (error) {
            if (error?.response?.data) {
                alert('Error', error?.response?.data?.data, 'error');
            } else {
                alert('Error', error?.message, 'error');
            }
            // setDataLoading(false);
        }
    }

    useEffect(() => {
        if (event_id) {
            getEventData();
            getUserData();
        }
        // console.log("hijogi")
    }, [router.isReady, event_id])

    const renderSeats = () => {

        let initial = seats[0]?.seat?.charAt(0);
        let array2 = [];
        let a = 0

        let arr = []
        for (let i = 0; i <= seats.length; i++) {
            if (seats[i]?.seat?.charAt(0) != initial) {
                initial = seats[i]?.seat?.charAt(0)
                seats.slice(a, i).map((item) => {
                    arr.push(
                        <div className={`${seatsSelected.includes(item) && "bg-black"} border-2 p-1 px-2 rounded cursor-pointer items-center flex flex-col ${item?.booked === "yes" ? "border-red-300 cursor-not-allowed" : "null"}`}
                            onClick={() => {
                                if (item.booked !== "yes") {
                                    if (seatsSelected.includes(item)) {
                                        let index = seatsSelected.indexOf(item);
                                        let arr = seatsSelected;//[a,b,c]
                                        arr.splice(index, 1);
                                        // console.log(arr)
                                        setSeatsSelected(arr)
                                    } else {
                                        setSeatsSelected([...seatsSelected, item]);
                                    }
                                }

                            }
                            }>
                            <h1 className={` ${seatsSelected.includes(item) && "text-white"} ${item?.booked === "yes" ? "text-red-300" : "null"} text-sm`}>{item.seat}</h1>
                            {/* <h1 className={` ${seatsSelected.includes(item) && "text-white"} ${item?.booked === "yes" ? "text-red-300" : "null"} text-sm`}>{item.seat.substring(1,item.seat.length)}</h1> */}
                            {/* <p className={`${item?.booked === "yes" ? "text-red-300" : "text-gray-500"} text-sm`}>₹{item.price}</p> */}
                        </div>
                    )
                })
                array2.push(arr)
                a = i
                arr = []
            }
        }

        return array2;
    }

    useEffect(() => {
        console.log(seatsSelected)
    }, [seatsSelected]);

    const handleContinueOTP = async () => {
        setLoading(false)
        try {
            // let arr_ids = seatsSelected.map(itm => itm._id)
            const otpsend = await axios.post(`/front/book/customer-verify`, { ...customer, eventid: event_id });
            if (otpsend?.data?.success) {
                setTrueCustomer(otpsend?.data?.data)
                setSteps(1);
            }
            setLoading(false)
        } catch (error) {
            if (error?.response?.data) {
                alert(error?.response?.data?.data);
            } else {
                alert(error?.message,);
            }
            setLoading(false)
            // setDataLoading(false);
        }
    }

    const verifyOTP = async () => {
        setLoading(false)
        try {
            // let arr_ids = seatsSelected.map(itm => itm._id)
            const otpsend = await axios.post(`/front/book/customer-verify-otp`, { id: trueCustomer._id, otp: otp.otp });
            if (otpsend?.data?.success) {
                setOTP({ ...otp, success: true })
                setSteps(2);
            }
            setLoading(false)
        } catch (error) {
            if (error?.response?.data) {
                alert(error?.response?.data?.data);
            } else {
                alert(error?.message,);
            }
            setLoading(false)
            // setDataLoading(false);
        }
    }

    const handleBooking = async () => {
        setLoading(true)
        const order = await axios.post('/front/book/booking', { customerid: trueCustomer._id, seats: seatsSelected });
        if (order?.data?.success) {
            const options = {
                key: process.env.RZR_ID,
                amount: order?.data?.data?.order?.amount,
                currency: "INR",
                name: "Evently",
                prefill: {
                    name: trueCustomer.name,
                    email: trueCustomer.email,
                    contact: trueCustomer.mobile,
                },
                image: "https://cdn.logojoy.com/wp-content/uploads/2018/05/30163918/1241-768x591.png",
                order_id: order?.data?.data?.order?.id,
                handler: async (res) => {
                    const success = await axios.post('/front/book/booking-success', {
                        paymentid: res?.razorpay_payment_id,
                        eventid: event_id,
                        customerid: trueCustomer._id
                    });
                    console.log(success)
                    if (success?.data?.success) {
                        // alert("Thank you")
                        router.push(`/book/success/${success?.data?.data?.bookingid}`)
                    }
                },
                theme: {
                    color: "#f3f3f3",
                },
            };

            const rzp1 = new Razorpay(options);

            rzp1.on("payment.failed", async (res) => {
                // const failure = await fetcher.post('/donation/rzr/failure', {
                //     name: data.name,
                //     email: data.email,
                //     amount,
                //     paymentid: res?.error?.metadata?.payment_id,
                //     orderid: res?.error?.metadata?.order_id,
                //     status: "failure",
                //     reason: res?.error?.reason
                // });
                alert("Payment failed please try again");
            });

            rzp1.open();
        }
    }
    const priceRender = () => {
        let p = 0;
        seatsSelected.map(seat => p += seat.price);
        return (<h2>Total Amount: ₹{p}</h2>)
    }
    const priceRenderForButton = () => {
        let p = 0;
        seatsSelected.map(seat => p += seat.price);
        return (<h2>Pay: ₹ {p}</h2>)
    }

    const renderBlocks = () => {

        let row = event.row //1
        let col = event.col //1 2... 

        let index = 1;

        let arrView = [];
        let mainArr = []
        for (let i = 1; i <= row; i++) {
            for (let j = 1; j <= col; j++) {
                let seat = seats?.find(itm => itm.index == index);
                arrView.push(
                    <div style={{ justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} >
                        {
                            seat ?
                                <p dataindex={index} onClick={(e) => {
                                    let seat = seats?.find(itm => itm.index == e.target.getAttribute('dataindex'));
                                    if (seat.booked !== "yes") {
                                        if (seatsSelected.includes(seat)) {
                                            let index = seatsSelected.indexOf(seat);
                                            let arr = seatsSelected;//[a,b,c]
                                            arr.splice(index, 1);
                                            // console.log(arr)
                                            setSeatsSelected(arr)
                                        } else {
                                            setSeatsSelected([...seatsSelected, seat]);
                                        }
                                    }
                                }}
                                    className={`${seatsSelected.includes(seat) && "bg-blue-500 text-white border-blue-600"} text-sm border-2 h-10 w-10 rounded cursor-pointer flex justify-center items-center ${seat?.booked === "yes" ? "border-red-300 text-white bg-red-400 cursor-not-allowed" : "null"}`}
                                >{seat.seat}</p>
                                :
                                <div className="h-10 w-10 " style={{ background: '#CCCCCC', borderRadius: '5px' }} dataindex={index} >
                                </div>
                        }

                    </div>
                );
                index += 1;
            }
            mainArr.push(arrView);
            arrView = [];
        }
        // console.log(mainArr)
        return mainArr
    }


    return (
        <div className={styles.main}>

            <div className={styles.info}
            // style={{backgroundImage:`url('/eventbg.jpeg')`}}
            >
                <img src={event.image} className="h-72 w-96 object-cover rounded-md" alt="event-img" />
                <div className="ml-10">
                    <h1 className="text-white text-3xl font-bold m-0 mb-6">{event.title}</h1>
                    <h1 className={styles.texts} >{event.description}</h1>
                    <h1 className={styles.texts}>{event.venue}</h1>
                    <h1 className={styles.texts}>{moment(event.date).format('DD MMMM YYYY hh:mm A')}</h1>
                </div>
            </div>
            {/* Steppers */}
            <div className={styles.field}>
                <div className={styles.fieldElement}>
                    <h1 className={`${slide >= 1 ? "bg-[#0E2129] text-white" : "bg-gray-400"} h-14 w-14 flex justify-center items-center text-xl`} style={{ borderRadius: 1000 }}>1</h1>
                    <h1 className={`ml-2 ${slide >= 1 ? "text-[#0E2129] font-bold" : "text-black"}`}>Select Seat</h1>
                    <div className={`h-1 ${slide > 1 ? "w-20" : "w-40"} bg-gray-300 mx-4 rounded-lg`}></div>
                </div>
                <div className={styles.fieldElement}>
                    <h1 className={`${slide >= 2 ? "bg-[#0E2129] text-white" : "bg-gray-400"} h-14 w-14 flex justify-center items-center text-xl`} style={{ borderRadius: 1000 }}>2</h1>
                    <h1 className={`ml-2 ${slide >= 2 ? "text-[#0E2129] font-bold" : "text-black"}`}>Booking Details</h1>
                    <div className={`h-1 ${slide === 1 || slide === 3 ? "w-20" : "w-40"} bg-gray-300 mx-4 rounded-lg`}></div>
                </div>
                <div className={styles.fieldElement}>
                    <h1 className={`${slide >= 3 ? "bg-[#0E2129] text-white" : "bg-gray-400"} h-14 w-14 flex justify-center items-center text-xl`} style={{ borderRadius: 1000 }}>3</h1>
                    <h1 className={`ml-2 ${slide >= 3 ? "text-[#0E2129] font-bold" : "text-black"}`}>Payment</h1>

                </div>
            </div>

            <div className={styles.container}>
                {
                    slide == 1 &&

                    <div className={styles.left}>
                        {/* <img src={"/stage.svg"} alt="ddd" className="mb-20" /> */}
                        <div className="h-32 bg-[#0E2129] rounded mb-10 flex justify-center items-center">
                            <h1 className="text-white text-xl">Main Stage</h1>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }}>
                            {
                                renderBlocks().map((each, i) => {
                                    return <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                        {each}
                                    </div>
                                })
                            }
                        </div>
                    </div>
                }

                {
                    slide == 2 &&
                    <div className="flex">
                        <div className="">
                            <h2 style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexWrap: 'wrap' }}>
                                <table className="bg-green-100">
                                    <tr className="border-b-2 border-white ">
                                        <th className="pr-10 pl-2 bg-[#0E2129] text-white font-mono border-r-2 p-2">Seat Selected</th>
                                        <th className="pr-10 pl-2 bg-[#0E2129] text-white font-mono p-2">Seat Price</th>
                                    </tr>
                                    {seatsSelected?.length === 0 ?
                                        "Not Selected" :
                                        seatsSelected.map(seat => <tr key={seat._id} className="border-b-2 border-white">
                                            <td className="pr-10 pl-2 border-r-2 border-white p-2">{seat.seat}</td>
                                            <td className="pl-2 p-2">₹ {seat.price}</td>
                                        </tr>)}
                                </table>
                                <h1 className="font-bold">
                                    {/* {priceRender()} */}
                                </h1>

                            </h2>
                        </div>
                        <div>
                            <div className={styles.right}>

                                <h2 className="font-bold text-2xl mb-4">Booking Details</h2>
                                {

                                    <>
                                        <input placeholder="Full Name" className={styles.input} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                                        <input placeholder="Mobile Number" className={styles.input} onChange={e => setCustomer({ ...customer, mobile: e.target.value })} />

                                        <input placeholder="Email" className={styles.input} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                                        {otp.success ?
                                            <p className="text-sm text-green-600">Email Verified Successfully</p> :
                                            <p className="text-sm text-gray-700">
                                                We will send an OTP on this email for verification
                                            </p>
                                        }
                                    </>
                                }
                                {
                                    steps == 1 &&
                                    <>
                                        <input placeholder="OTP" className={styles.input} onChange={e => setOTP({ ...otp, otp: e.target.value })} />
                                    </>
                                }

                                {/* Buttons based on step */}
                                {
                                    steps == 0 &&
                                    <button className={styles.btn} onClick={handleContinueOTP}>{!loading ? priceRenderForButton() : "Please Wait"}</button>
                                }
                                {
                                    steps == 1 &&
                                    <button className={styles.btn} onClick={verifyOTP}>{!loading ? "Verify" : "Verifying"}</button>
                                }
                                {
                                    steps == 2 &&
                                    <button className={styles.btn} onClick={() => {
                                        if (seatsSelected.length === 0) {
                                            alert('Please select seats')
                                        } else {
                                            setSlide(3);
                                            handleBooking();
                                        }
                                    }}>{!loading ? "Proceed" : "Please Wait"}</button>
                                }

                            </div>
                        </div>
                    </div>
                }
                {
                    slide == 3 &&
                    <div className="w-full flex justify-center items-center flex-col">
                        <img src={'/pay.png'} className="h-80 object-cover rounded-md" alt="pay-img" />

                        <h1 className="text-center mt-10">
                            Please make your payment via Razorpay.<br></br>
                            We will redirect you to your ticket once payment is received.
                        </h1>
                    </div>
                }
            </div>

            {
                seatsSelected.length >= 1 && slide == 1 &&
                <div className="bg-white border-t-2  py-2 bottom-0 fixed w-full flex justify-center items-center">
                    <h1 className="flex mx-4 font-bold">{priceRender()}  </h1>
                    <button className={styles.btn} onClick={() => setSlide(2)}>Continue Booking </button>
                </div>
            }
            {/* empty div  */}
            <div className="h-32">
            </div>
        </div >
    )
}
export default Book;