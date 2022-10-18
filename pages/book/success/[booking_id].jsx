import { useState, useEffect, useRef } from "react";


import QRCode from "react-qr-code";
import { useRouter } from "next/router";
import moment from "moment";

import axios from "../../../helper/axios";


const Success = () => {
    const [loading, setLoading] = useState(false);
    const componentRef = useRef();
    const router = useRouter();
    const { booking_id } = router.query;
    const [details, setDetails] = useState({});

    const getData = async () => {
        setLoading(true)
        try {
            const booking = await axios.get(`/front/book/${booking_id}`);
            // console.log(booking?.data?.data)
            setDetails(booking?.data?.data)
            setLoading(false)
        } catch (error) {
            if (error?.response?.data) {
                alert('Error', error?.response?.data?.data, 'error');
            } else {
                alert('Error', error?.message, 'error');
            }
            setLoading(false)
            // setDataLoading(false);
        }
    }

    useEffect(() => {
        if (booking_id) {
            getData();
        }
        // console.log("hijogi")
    }, [router.isReady, booking_id])



    if (!loading) {
        return <div className="flex justify-center items-center flex-col">

            <h1 className="text-xl font-bold my-5">Thank You!</h1>

            <div className="border-2 rounded p-0 flex  flex-col pb-5" ref={componentRef} >
                <div className="p-6">
                    <div className="flex justify-between gap-14 mb-6">
                        <div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Name : </h3>
                                <p>{details?.customerid?.name ?? 'null'}</p>
                            </div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Contact : </h3>
                                <p>{details?.customerid?.mobile ?? 'null'}</p>
                            </div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Email : </h3>
                                <p>{details?.customerid?.email ?? 'null'}</p>
                            </div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Booking ID : </h3>
                                <p>{details?.bookingid ?? 'null'}</p>
                            </div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Booking Date : </h3>
                                <p>{moment(details?.createdAt).format('DD-MM-YYYY hh:mm A') ?? 'null'}</p>
                            </div>
                            <div className="flex gap-2">
                                <h3 className="font-bold">Payment ID: </h3>
                                <p>{details?.paymentid ?? 'null'}</p>
                            </div>

                        </div>

                        <div className="flex gap-2">
                            <QRCode value={details?.bookingid ?? 'null'} size={128} />
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">

                        {/* <div className="flex flex-col  w-1/2">

                        <h3 className="font-bold">Billed to:</h3>
                        <p className="m-0 text-sm"> Jhon Doe</p>
                        <p className="m-0 text-sm">example@gmail.com</p>
                        <p className="m-0 text-sm">9920622446</p>
                    </div> */}
                        <div className="flex flex-col w-1/2">
                            <h3 className="font-bold">Venue - {details?.eventid?.title ?? 'null'} :</h3>
                            <p className="m-0 text-sm flex-wrap w-52">{details?.eventid?.venue ?? 'null'}</p>
                            <p className="m-0 text-sm flex-wrap w-52">{moment(details?.eventid?.date).format('DD-MM-YYYY hh:mm A') ?? 'null'}</p>
                        </div>
                    </div>


                </div>
                <div className="flex justify-center w-full">
                    <div className="  w-full" >
                        <table className="w-11/12 mx-5">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-xs text-gray-500 " style={{ textAlign: 'left' }}>
                                        #
                                    </th>
                                    <th className="px-4 py-2 text-xs text-gray-500 " style={{ textAlign: 'left' }}>
                                        Seats Selected
                                    </th>
                                    <th className="px-4 py-2 text-xs text-gray-500 " style={{ textAlign: 'left' }}>
                                        Total
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr className="whitespace-nowrap">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        1
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {details?.seats ?? 'null'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">₹{details?.amountpaid ?? 'null'}</div>
                                    </td>
                                </tr>

                                <tr className="text-white bg-gray-800">
                                    <th ></th>
                                    <td className="text-sm font-bold"><b>Total</b></td>
                                    <td className="text-sm font-bold"><b>₹{details?.amountpaid ?? 'null'}</b></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="pl-4 mt-4">
                    <h3 className="text font-bold">Terms And Condition :</h3>
                    <ul className="text-xs list-disc list-inside">
                        <li>All accounts are to be paid within 7 days from receipt of invoice.</li>
                        <li>To be paid by cheque or credit card or direct payment online.</li>
                    </ul>
                </div>
            </div>

            <div className="flex justify-start items-center my-5 ">
                <button className="px-4 py-2 bg-green-300 rounded text-green-700 hover:bg-green-400"
                    onClick={async () => {
                        const { exportComponentAsPNG } = await import('react-component-export-image')
                        exportComponentAsPNG(componentRef, { fileName: `Ticket` })
                    }}>Download Ticket
                </button>
            </div>
        </div>
    }
    else {
        <div className="flex justify-center items-center flex-col">
            <h1>loading</h1>
        </div>
    }
}
export default Success
