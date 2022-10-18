/* eslint-disable @next/next/no-img-element */
// import Image from 'next/image'
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css'
import Slider from "react-slick";
//Components 
import Event from '../componets/Event';
//functionaltios
import axios from '../helper/axios';


export default function Home() {

  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState({
    ongoing: [],
    comingsoon: [],
    completed: []
  });

  const getUserData = async () => {
    setLoading(true)
    try {
      const eventsData = await axios.get(`/front/event/`);
      let comingsoon = [];
      let ongoing = [];
      let completed = [];
      // setEvent(eventsData?.data?.data);
      eventsData?.data?.data.map(itm => {
        if (itm?.status == "ongoing") {
          ongoing.push(itm);
        }
        if (itm?.status == "comingsoon") {
          comingsoon.push(itm);
        }
        //complted add later
      });

      setEvent({
        ongoing,
        comingsoon,
        completed
      })
      setLoading(false);
    } catch (error) {
      if (error?.response?.data) {
        alert(error?.response?.data?.data);
      } else {
        alert(error?.message);
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className={styles.container}>

      <Slider {...settings}>
        {
          event?.comingsoon?.map(itm => {
            return <div key={itm?._id} className="h-[25rem] relative w-full">
              <img src={itm?.image} alt="banner" className="object-cover w-full" />
              <div className="bg-black h-[26rem] w-full absolute top-0 bg-opacity-50 flex flex-col gap-3 justify-center items-center">
                {/* <h1 className='text-white font-bold text-4xl'>Coming Soon</h1> */}
                <h1 className='text-white text-4xl font-bold'>{itm?.title}</h1>
                <p className='text-white text-base w-[500px] text-center '>{itm?.description}</p>
                <button className="hover:bg-white hover:text-black transition-all border-2 border-white text-white md:text-base text-center px-6 py-2 cursor-pointer mt-4" >Coming Soon</button>
              </div>

            </div>
          })
        }
      </Slider>
      <div className={styles.events}>

        <div className='py-6 md:py-10 text-center md:w-1/2'>
          <h1 className={styles.eventstext}>ONGOING EVENTS</h1>
          <p className='m-0 mt-4 '>
            Contrary to popular belief, Lorem Ipsum is not simply random text.
            It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
            Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {
            !loading ?
              event?.ongoing?.map(itm => {
                if (itm?.status === "ongoing") {
                  return <Event key={itm?._id} data={itm} />
                }
              })
              : <h1>loading events</h1>
          }
        </div>
      </div>
    </div >
  )
}