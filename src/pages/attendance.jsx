import React from 'react';
import {useEffect, useState} from "react";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import {auth, firestore} from "./firebase.config";
import {useAuthState} from "react-firebase-hooks/auth";
import {Link, useNavigate} from "react-router-dom";
import {
    collection,
    query,
    where,
    writeBatch,
    getDocs,
    addDoc,
    updateDoc,
    doc as firestoreDoc
} from "firebase/firestore";
import {toast, ToastContainer} from "react-toastify";
import {Bars3Icon, XMarkIcon} from "@heroicons/react/20/solid";
import {Dialog} from "@headlessui/react";
import { JsonToExcel } from "react-json-to-excel";
import moment from 'moment';
import quotes from "./quotes";
import loadingQuotes from "./loadingQuotes";

const Attendance = () => {

    const [person, setPerson] = useState({
        name: null,
        rollNo: null,
        role: null,
        gender:null,
        checkInTime: null,
        checkOutTime: null,
        log:null,
    });

    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isAwait, setIsAwait] = useState('');
    const [searchedVal,setSearchedVal] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCount: null,
        maleCount: null,
        femaleCount: null,
    });
    const [user, loading, error] = useAuthState(auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate();
    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        auth.signOut().then(() => navigate('/'));
    };
    useEffect(() => {
        if (isAwait) {
            // Show the toast notification
            toast.info('Awaiting response...', { position:'top-center' ,autoClose: false });
        } else {
            toast.dismiss();
        }
    }, [isAwait]);

    useEffect(() => {
        if (user) {
            auth.currentUser.getIdToken().then((token) => {
                localStorage.setItem('authToken', token);
            });
        }
    }, [user]);
    if(!user){
        navigate("/login")
    }
    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * loadingQuotes.length);
        return loadingQuotes[randomIndex];
    };
    const countByGender = data.reduce(
        (count, person) => {
            if (person.gender === 'M') {
                count.male++;
            } else if (person.gender === 'F') {
                count.female++;
            }
            count.total++;
            return count;
        },
        { male: 0, female: 0, total: 0 }
    );

    const handleInputChange = (event) => {
        const uppercaseValue = event.target.value.toUpperCase();
        setInputValue(uppercaseValue);
    };
    const handleClear = (event) =>{
        setInputValue('');
    }
    const handleSubmit = async (event) => {

        event.preventDefault();
        let personExists = false;
        for (let i = 0; i < data.length; i++) {
            const personData = getPersonName(event.target[0].value)
            if (data[i].rollNo === event.target[0].value) {
                personExists = true;
                if (data[i].checkOutTime === null && data[i].checkInTime !== null) {
                    console.log('Updating checkOutTime for existing person...');
                    toast.warn('Processing..Wait', {
                        position: 'top-right',
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,


                    })
                    await updatePersonDetails(event.target[0].value, Date.now(), 'checkOutTime');

                    // console.log(Date(data[i].checkOutTime).getHours-data[i].checkInTime)
                } else if( data[i].checkOutTime === null && data[i].checkInTime == null) {
                    console.log('Updating checkInTime for existing person...');
                    toast.warn('Processing..Wait', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    })
                    await updatePersonDetails(event.target[0].value, Date.now(), 'checkInTime');
                }
                break;
            }
        }

        if (!personExists) {
            console.log('Adding new person...');
            const personData = await getPersonName(event.target[0].value);

            try {
                await updatePersonDetails(event.target[0].value, Date.now(), 'checkInTime');
                await addDoc(collection(firestore, 'daily'), {
                    name: personData.name,
                    rollNo: event.target[0].value,
                    role: personData.role,
                    gender:personData.gender,
                    residence:personData.residence,
                    checkInTime: Date.now(),
                    checkOutTime:null,
                });
                setData((prevData) => [
                    ...prevData,
                    {
                        name: personData.name,
                        rollNo: event.target[0].value,
                        residence:personData.residence,
                        role: personData.role,
                        gender: personData.gender,
                        checkInTime: Date.now(),
                        checkOutTime: null,
                    },
                ]);
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                toast.success(randomQuote, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
            } catch (err)
            {
                toast.error(`Uh Oh! 😔`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
            }
        }
        }
    const resetPersonDetails = async (rollNo) => {
        console.log('Resetting person details...');
        const personData = await getPersonName(rollNo);
        if (personData) {
            console.log('Person data found:', personData);
            try {
                const dailyQuerySnapshot = await getDocs(collection(firestore, 'daily'));
                const dailyDocs = dailyQuerySnapshot.docs;

                for (const doc of dailyDocs) {
                    const dailyData = doc.data();
                    if (dailyData.rollNo === rollNo) {
                        console.log(`Updating document with rollNo: ${rollNo}`);
                        await updateDoc(doc.ref, {
                            checkInTime: Date.now(),
                            checkOutTime: null,
                        });
                        break;
                    }
                }
                const updatedData = data.map((person) => {
                    if (person.rollNo === rollNo) {
                        return {
                            ...person,
                            checkInTime: Date.now(),
                            checkOutTime: null,
                        };
                    }
                    return person;
                });


                setData(updatedData);

            } catch (error) {
                console.error('Error updating document:', error);
            }
        } else {
            console.log('Person data not found.');
        }
    };



    const updatePersonDetails = async (rollno, time, property) => {
        console.log('Updating person details...');
        const personData = await getPersonName(rollno);

        if (personData) {
            console.log('Person data found:', personData.rollno);
            setIsAwait(true);
            try {
                const dailyQuerySnapshot = await getDocs(collection(firestore, 'daily'));
                const dailyDocs = dailyQuerySnapshot.docs;
                for (const doc of dailyDocs) {
                    const dailyData = doc.data();
                    if (dailyData.rollNo === rollno) {
                        console.log(`Updating document with rollNo: ${rollno}`);
                        await updateDoc(doc.ref, {
                            [property]: time,
                        });
                        break;
                    }
                }
                setData((prevData) =>
                    prevData.map((person) => {
                        if (person.rollno === rollno) {
                            return {
                                ...person,
                                [property]: time,
                            };
                        }
                        return person;
                    })
                );
                setIsAwait(false)
                setInputValue('');
                console.log('exiting and clearing data')

            } catch (error) {
                console.error('Error updating document:', error);
            }
        } else {
            console.log('Person data not found.');
        }
    };

    const getPersonName = async (rollNo) => {
        try {
            console.log('Retrieving person name...');
            const q = query(collection(firestore, 'members'), where('rollno', '==', rollNo));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const personDoc = querySnapshot.docs[0];
                const personData = personDoc.data();
                const name = personData.name;
                const residence = personData.residence;
                const role = personData.role;
                const rollno = personData.rollno;
                const gender = personData.gender;
                console.log('Person name retrieved:', name,rollno);
                return { name, role ,gender,rollno,residence};
            } else {
                console.log('Person not found with rollNo:', rollNo);
                return null;
            }
        } catch (error) {
            console.error('Error retrieving person name:', error);
            return null;
        }
    };

    const sortedData = [...data].sort((a, b) => b.checkInTime - a.checkInTime);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'daily'));
                const fetchedData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setData(fetchedData);
            } catch (error) {
                console.error('Error fetching Firestore data:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const convertTimestampsToReadable=(data)=>{
        const convertedData = sortedData.map((obj) => {
            const NAME=obj.name;
            const ROLLNO=obj.rollNo;
            const GENDER=obj.gender;
            const PURPOSE="ACM";
            const RESIDENCE=obj.residence;
            const CHECKIN=moment(obj.checkInTime).format('hh:mm:ss');
            const CHECKOUT=moment(obj.checkOutTime).format('hh:mm:ss')
            return {NAME,ROLLNO,GENDER,PURPOSE,RESIDENCE,CHECKIN,CHECKOUT};

        });

        return convertedData;
    }
    const convertedData = convertTimestampsToReadable(data);

    const modifiedData = convertedData.map((obj, index) => {
        return { 'NO': index + 1, ...obj };
    });
    const getHourDifference = (checkinTime, checkoutTime) => {
        const MS_PER_HOUR = 1000 * 60 * 60; // milliseconds per hour

        if (checkoutTime === null) {
            const checkinTimestamp = new Date(checkinTime).getTime();
            const now = new Date();
            const checkoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 30, 0);
            const checkoutTimestamp = checkoutTime.getTime();
            const hourDifference = (Math.abs(checkoutTimestamp - checkinTimestamp) / MS_PER_HOUR).toFixed(2);
            return hourDifference;
        }

        const checkinTimestamp = new Date(checkinTime).getTime();
        const checkoutTimestamp = new Date(checkoutTime).getTime();

        const hourDifference = (Math.abs(checkoutTimestamp - checkinTimestamp) / MS_PER_HOUR).toFixed(2);
        return hourDifference;
    };


    const handleWrite = async () =>{
            console.log(data)
            const dateString = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
                .toISOString()
                .split("T")[0];

            data.map(async (item) => {
                const log = []
                const hours = (getHourDifference(item.checkInTime, item.checkOutTime))
                const logEntry = {
                    date: dateString,
                    hours: hours
                };

                log.push(logEntry);
                try {
                    const q = query(collection(firestore, 'members'), where('rollno', '==', item.rollNo));
                    const querySnapshot = await getDocs(q);
                    const updatePromises = querySnapshot.docs.map(async (doc) => {
                        const docRef = firestoreDoc(firestore, 'members', doc.id);
                        const fetchedData = querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        const existingLog = fetchedData[0].log;
                        const shouldUpdate = !existingLog.some((entry) => entry.date === logEntry.date);
                        console.log(logEntry)
                        if (shouldUpdate) {
                            const updatedLog = existingLog.concat(logEntry);
                            await updateDoc(docRef, {
                                log: updatedLog,
                            });
                            console.log("Updated log for item:", item.rollNo);
                        } else {
                            console.log("Log already exists for item:", item.rollNo);
                        }
                    });

                    await Promise.all(updatePromises);
                } catch (error) {
                    console.error('Error updating document:', error);
                }
            })

    }

    const handleClearData = async () => {

        if (verificationCode === `${process.env.REACT_APP_VERIFICATION_CODE_1}`) {

            try {
                const querySnapshot = await getDocs(collection(firestore, 'daily'));
                const batch = writeBatch(firestore);
                setVerificationCode("")
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                await batch.commit();

                setData([]);

                toast.success(`Data cleared successfully! 🗑️`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } catch (error) {
                console.error('Error clearing Firestore data:', error);
                toast.error(`Failed to clear data. Please try again. 😔`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } else {
            toast.error(`Incorrect verification code. Deletion canceled. ❌`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    return (
        <>
     <div>
         <div className="flex shadow-lg p-2 rounded-lg justify-between m-10 md:flex-row md:space-y-0 space-x-0 md:space-x-2 mb-5">
             <p className="m-2 text-lg font-bold text-blue-800 md:text-xl ">punchly. <sup>(beta)</sup></p>
             <div className="flex">

                 <button
                     type="button"
                     className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                     onClick={() => setMobileMenuOpen(true)}
                 >
                     <span className="sr-only">Open main menu</span>
                     <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                 </button>

             </div>
         </div>

         <Dialog as="div" className={"transition-all"} open={mobileMenuOpen} onClose={setMobileMenuOpen}>
             <div className="fixed inset-0 z-50" />
             <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                 <div className="flex items-center justify-between">
                     <a href="#" className="-m-1.5 p-1.5">
                         <p className="mb-3 text-lg font-bold text-black md:text-xl">punchly.<sup>(beta)</sup></p>
                     </a>
                     <button
                         type="button"
                         className="-m-2.5 rounded-md p-2.5 text-gray-700"
                         onClick={() => setMobileMenuOpen(false)}
                     >
                         <span className="sr-only">Close menu</span>
                         <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                     </button>
                 </div>
                 <div className="mt-6 flow-root">
                     <div className="-my-6 divide-y divide-gray-500/10">
                         <div className="space-y-2 py-6">

                             <button
                                 className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                 type="button"
                             >
                                 <Link to="/add">
                                     <span role="img" aria-label="Add">➕</span> add member
                                 </Link>
                             </button>
                             <button
                                 className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                 type="button"
                                 onClick={handleWrite}
                                 disabled
                             >
                                 <span role="img" aria-label="Write" >🌐</span>&nbsp;write
                             </button>
                             <button
                                 className="-mx-3 block rounded-lg px-3 py-2 flex text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                 type="button"
                                 onClick={() => setShowStats(true)}
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                 </svg>
                                 &nbsp;stats

                             </button>
                             <button
                                 className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                 type="button"
                                 onClick={() => setShowModal(true)}
                             >
                                 <span role="img" aria-label="Clean Slate">🗑️ </span>&nbsp;clean slate
                             </button>
                         </div>
                         <JsonToExcel
                             title="Download as Excel"
                             data={modifiedData}
                             fileName={`Attendance-${ moment(Date.now()).format('YYYY-MM-DD')}`}
                         />
                         <div className="py-6">
                             <a
                                 onClick={handleSignOut}
                                 className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                             >
                                 log out
                             </a>
                         </div>
                     </div>

                 </div>
             </Dialog.Panel>
         </Dialog>

         <ToastContainer />
         {showStats && (
             <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                 <div className="relative w-auto my-6 mx-auto max-w-3xl">
                         <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                             <div className="flex items-start flex-col p-20 border-b border-solid border-slate-200 rounded-t">
                                 <h3 className="text-3xl font-semibold">
                                     Club Statistics
                                 </h3>
                                 <button
                                     className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                     onClick={() => setShowStats(false)}
                                 >
                                 <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                     ×
                                 </span>
                                 </button>
                                 <div className="flex flex-col p-6 space-y-6">
                                     <p className=" text-gray-500 dark:text-gray-400">
                                         Total Count: {countByGender.total}        </p>
                                     <p className="text-gray-500 dark:text-gray-400">
                                         Male Count : {countByGender.male}
                                     </p>
                                     <p className="text-gray-500 dark:text-gray-400">
                                         Female Count : {countByGender.female}
                                     </p>
                                 </div>
                             </div>
                             <div>
                             </div>
                             <div className="flex items-center justify- enter p-6 border-t border-solid border-slate-200 rounded-b">
                                 <button
                                     className="text-blue-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                     type="button"
                                     onClick={() => setShowStats(false)}
                                 >
                                     Close
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
                 )}
         {showModal && (
             <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                 <div className="bg-white p-8 flex-col rounded-md shadow-md">
                     <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                         <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                     </div>
                     <h2 className="text-lg font-bold mb-4">Enter Verification Code</h2>
                     <input
                         type="password"
                         className="border border-gray-300 rounded-md px-4 py-2 mb-4 shadow"
                         value={verificationCode}
                         onChange={(e) => setVerificationCode(e.target.value)}
                     />
                     <div className="flex justify-center">
                         <button
                             className="mr-10 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
                             onClick={() => setShowModal(false)}
                         >
                             Cancel
                         </button>
                         <button
                             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
                             onClick={handleClearData}
                         >
                             Confirm
                         </button>
                     </div>
                 </div>
             </div>
         )}
         <div className="mt-10 mb-10 mx-auto max-w-xs">
             <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                 <div>
                     <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                         Roll Number
                     </label>
                     <div className="mt-2">
                         <input
                             value={inputValue}
                             onChange={handleInputChange}
                             id="email"
                             name="email"
                             type="text"
                             required
                             className="block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                         />
                     </div>
                 </div>
                 <button
                     type="submit"
                     className="px-4 py-2  flex justify-center items-center rounded-md bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                 >
                     Log
                 </button>
             </form>
         </div>

     </div>
            {isLoading ? (
                // Display loader while data is being fetched
                <div className=" flex flex-col gap-5 justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <div className="block text-sm font-medium leading-6 items-center text-indigo-900">{getRandomQuote()}</div>
                </div>
            ) : (
         <ul role="list" className="px-10">
             <li className="flex justify-between gap-x-6 p-5 rounded-lg  border border-blue-50 shadow-xl">
                 <div className="flex-none gap-x-4  w-1/3">
                     <div className="max-w-4 flex-auto">
                         <p className="text-sm font-semibold leading-6 text-gray-900">Name</p>
                     </div>
                 </div>
                 <div className="flex-grow hidden sm:flex sm:flex-col">
                     <div className="max-w-4 flex-auto">
                         <p className="text-sm font-semibold leading-6 text-gray-900">Residence</p>
                     </div>
                 </div>

                 <div className="flex-grow hidden sm:flex sm:flex-col">
                     <div className="max-w-4 flex-auto">
                         <p className="text-sm font-semibold leading-6 text-gray-900">Time</p>
                     </div>
                 </div>

                 <div className="flex-none w-1/3 sm:flex sm:flex-col sm:items-end">
                     <p className="text-sm font-semibold leading-6 text-gray-900">Status</p>
                 </div>
             </li>

             {/*<input type="search" id="default-search"*/}
             {/*       className="block w-full p-4 mt-10 pl-10 text-sm text-gray-900 border border-white rounded-lg shadow-lg shadow-blue-100 dark:placeholder-gray-400 dark:text-gray-800"*/}
             {/*        onChange={(e) => setSearchedVal(e.target.value)}*/}
             {/*       placeholder="Search" required />*/}

             {sortedData.map((person) => (
                 <li key={person.rollNo} className="flex justify-between gap-x-6 p-5 shadow-sm">
                     <div className="flex-none gap-x-4  w-1/3">
                         <div className="max-w-4 flex-auto">
                             <p className="text-sm font-regular leading-6 text-gray-900">{person.name} </p>
                             <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.rollNo}</p>
                         </div>
                     </div>
                     <div className="flex-grow  gap-x-4  w-1/3 hidden sm:flex">
                         <div className="max-w-4 flex-auto gap-2">
                     {person.residence === 'h' ? <p className="text-xs text-white inline-block border bg-blue-500 px-2 rounded-xl">Hosteler</p> : person.residence === 'd' ? <p className="text-xs text-white inline-block border bg-orange-400 px-2 rounded-xl">Day Scholar</p> : <p className="text-xs text-white inline-block border bg-red-500 px-2 rounded-xl">Not Updated</p>}
                             <p className="text-xs text-white inline-block border bg-blue-500 px-2 rounded-xl">{(person.role)}</p>

                         </div>
                     </div>
                     <div className="flex-grow hidden sm:flex sm:flex-col">
                         <div className="max-w-4 flex-auto">
                             <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                 Checked In: {person.checkInTime ? new Date(person.checkInTime).toLocaleTimeString() : ""}
                             </p>
                             {person.checkOutTime ?(
                             <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                 Checked Out: {person.checkOutTime ? new Date(person.checkOutTime).toLocaleTimeString() : ""}
                             </p> ):
                                 (
                                     <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                         Not Checked Out
                                     </p>
                                 )}
                     </div>
                                 </div>

                     <div className="flex-none w-1/3 sm:flex sm:flex-col sm:items-end">
                         <p className="text-sm leading-6 text-gray-900">{person.role}</p>
                         {person.checkOutTime ? (
                             <div className="mt-1 flex items-center gap-x-1.5">
                                 <div className="flex-none rounded-full bg-red-500/20 p-1">
                                     <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                 </div>
                                 <p className="text-xs leading-5 text-gray-500">Offline</p>
                             </div>
                         ) : (
                             <div className="mt-1 flex items-center gap-x-1.5">
                                 <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                 </div>
                                 <p className="text-xs leading-5 text-gray-500">Online</p>
                             </div>
                         )}
                         {person.checkOutTime ? (
                             <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                 Checked Out: {person.checkOutTime ? new Date(person.checkOutTime).toLocaleTimeString() : ""}
                             </p>
                         ) : (
                             <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                 Checked In: {person.checkInTime ? new Date(person.checkInTime).toLocaleTimeString() : ""}
                             </p>
                         )}
                     </div>

                 </li>
                 ))}
         </ul>
                )}

</>
  );
};

export default Attendance;