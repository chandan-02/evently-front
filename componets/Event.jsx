/* eslint-disable @next/next/no-img-element */
import styles from '../styles/Event.module.css';
import { LocationMarkerIcon, ClockIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router';
import moment from 'moment';

const Event = ({ data }) => {

    const router = useRouter();
    const { image, title, description, venue, date, status, _id } = data;
    const handleEventBooking = (id) => {
        router.push(`/book/${id}`)
    }

    return (
        <div className={styles.container}>
            <img src={image} className={styles.img} alt="event-Imgae" />
            <div className={styles.textContainer}>
                <h2 className={styles.title}>{title}</h2>
                <div className='flex gap-2 items-center mt-3'>
                    {/* <LocationMarkerIcon  style={{
                        height: '21px'
                    }} /> */}
                    <p className={styles.venue}>{description.substring(0,90)}</p>
                </div>
            </div>
            <button className={styles.btn} onClick={() =>handleEventBooking(_id)}>Book Now</button>
        </div>
    )
}

export default Event;