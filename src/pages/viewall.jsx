import {auth, firestore} from './firebase.config'
import { useNavigate } from "react-router-dom";
import {collection, getDocs, updateDoc, doc as firestoreDoc ,deleteDoc,query, where} from "firebase/firestore";
import React, {useEffect, useRef, useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import {useAuthState} from "react-firebase-hooks/auth";
import loadingQuotes from "./loadingQuotes";

const ViewAll = () => {

    const [data, setData] = useState([]);
    const [searchedVal, setSearchedVal] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const [isLoading, setIsLoading] = useState(true);

    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * loadingQuotes.length);
        return loadingQuotes[randomIndex];
    };
    const handleEdit = (person) => {
        setSelectedPerson(person);
        setIsModalOpen(true);
    };
    const handleChart = (person) => {
        setSelectedPerson(person);
        setIsChartModalOpen(true);
        console.log(person.log)

    };

    const handleDownload = () => {
        const chartRef = document.getElementById('chart-container');

        domtoimage
            .toBlob(chartRef)
            .then((blob) => {
                saveAs(blob, 'my_chart.png');
            })
            .catch((error) => {
                console.error('Failed to convert chart to image:', error);
            });
    };



    const handleRemove = async (person) => {
        try {
            const q = query(collection(firestore, 'members'), where('rollno', '==', person.rollno));
            const querySnapshot = await getDocs(q);
            if (verificationCode === `${process.env.REACT_APP_VERIFICATION_CODE_2}`) {
                const removePromises = querySnapshot.docs.map(async (doc) => {
                    const docRef = firestoreDoc(firestore, 'members', doc.id);
                    await deleteDoc(docRef);
                    console.log('Document removed successfully');
                    toast.success(`Sad to see you go!`, {
                        position: 'top-right',
                        autoClose: 300,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    })
                });

            await Promise.all(removePromises);
            }
        } catch (error) {
            // Handle error
            console.error('Error removing document:', error);
        }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const q = query(collection(firestore, 'members'), where('rollno', '==', selectedPerson.rollno));
            const querySnapshot = await getDocs(q);
            const updatePromises = querySnapshot.docs.map(async (doc) => {
                if (verificationCode === `${process.env.REACT_APP_VERIFICATION_CODE_2}`) {
                    console.log(e.target)
                    const docRef = firestoreDoc(firestore, 'members', doc.id);
                    const fetchedData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    await updateDoc(docRef, {
                        name: e.target[0].value,
                        rollno: e.target[1].value,
                        phone_number:e.target[2].value,
                        email:e.target[3].value,
                        residence:e.target[4].value,
                    });
                }
            });

            await Promise.all(updatePromises);
            setIsModalOpen(false);
        } catch (error) {
            // Handle error
            console.error('Error updating document:', error);
        }
    };


    useEffect(() => {

        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'members'));
                const fetchedData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(fetchedData)
                setIsLoading(false)
            } catch (error) {
                console.error('Error fetching Firestore data:', error);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return  (<div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <div className="text-md italic text-gray-600 ">
                "{getRandomQuote()}"
            </div>
        </div>)
    }

    const handleClose = () => {
        setIsModalOpen(false)
        setSelectedPerson();

    }

    return (
        <div>
            <ToastContainer />
            <div className="bg-white transition ease-in duration-1000  flex border shadow-lg shadow-blue-800 p-5 m-10 rounded-lg justify-between md:flex-row md:space-y-0 space-x-0 md:space-x-2 mb-5">
                <p className="text-lg font-bold text-black md:text-xl"><a href="#/">punchly.<sup>(beta)</sup></a></p>
                <p className="text-md text-black md:text-xs sm:text-xs">❤️ web-sig &#183;  acm </p>
            </div>
            <div className="p-10">
            <div className="relative transition ease-in duration-1000 ">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                    {/*<input type="search" id="default-search"*/}
                    {/*       className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-lg dark:placeholder-gray-400 dark:text-gray-800"*/}
                    {/*       onChange={(e) => setSearchedVal(e.target.value)}*/}
                    {/*       placeholder="Search By Name,Batch or SIG" required />*/}

        </div>
            </div>
            <div className="relative overflow-x-auto px-10 transition ease-in duration-1000 ">
                <div className="inline-block min-w-full">
                    <div className="sm:hidden">
                        {/* Vertical Table for Small Screens */}
                        {data
                            .map((person) => (
                                <div
                                    key={person.name}
                                    className="bg-white mb-0.5 shadow-xl"
                                >
                                    <div className="p-5 justify-center">
                                        <div className="font-medium text-gray-900 whitespace-nowrap">
                                            <a onClick={() => handleChart(person)}>{person.name}</a>
                                        </div>
                                        <div className="text-xs text-white inline-block border bg-blue-500 px-2 rounded-xl">{person.role}</div>
                                        <div className="text-xs text-gray-400">{person.batch}</div>
                                        {user && (
                                            <div>
                                                <button
                                                    className="text-blue-800 background-transparent font-bold  text-sm outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
                                                    type="button"
                                                    onClick={() => handleEdit(person)}
                                                >
                                                    actions
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="hidden sm:block">
                        {/* Horizontal Table for Larger Screens */}
                        <table className="transition ease-in duration-1000  w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
                            <thead className="text-xs text-white uppercase dark:bg-blue-500 dark:text-white">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    NAME
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    ROLE
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    BATCH
                                </th>
                                {user && (
                                    <th scope="col" className="px-6 py-3">
                                        ACTIONS
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y shadow-lg">
                            {data
                                .map((person) => (
                                    <tr className="bg-white shadow-lg" key={person.name}>
                                        <th
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                        >
                                            <a onClick={() => handleChart(person)}>{person.name}</a>
                                        </th>
                                        <td className="px-6 py-4">{person.role}</td>
                                        <td className="px-6 py-4">{person.batch}</td>
                                        {user && (
                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-indigo-500 background-transparent font-bold uppercase text-sm outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
                                                    type="button"
                                                    onClick={() => handleEdit(person)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

        </div>
            {selectedPerson && (
                <div className={`fixed inset-0 flex items-center justify-center z-50 ${isModalOpen ? "" : "hidden"}`}>
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="relative bg-white w-1/2 md:w-1/3 mx-auto rounded-md shadow-lg z-50">
                        <div className="p-4">
                            <h2 className="text-lg font-medium mb-4">Edit Person</h2>
                            <form onSubmit={handleUpdate}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        defaultValue={selectedPerson.name}
                                        placeholder={selectedPerson.name}
                                        className="w-full bg-gray-100 border-gray-300 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
                                        Roll No
                                    </label>
                                    <input
                                        id="rollno"
                                        name="rollno"
                                        type="text"
                                        defaultValue={selectedPerson.rollno}
                                        placeholder={selectedPerson.rollno}
                                        className="w-full bg-gray-100 border-gray-300 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone_number"
                                        name="phone_number"
                                        type="text"
                                        defaultValue={selectedPerson.phone_number}
                                        placeholder={selectedPerson.phone_number}
                                        className="w-full bg-gray-100 border-gray-300 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="text"
                                        defaultValue={selectedPerson.email}
                                        placeholder={selectedPerson.email}
                                        className="w-full bg-gray-100 border-gray-300 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="residence" className="block text-sm font-medium text-gray-700">
                                        Residence
                                    </label>
                                    <select id='residence' defaultValue={selectedPerson.residence} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        >
                                        <option value="">Null</option>
                                        <option value="h">Hosteler</option>
                                        <option value="d">Day Scholar</option>

                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                                        Verification Code
                                    </label>
                                    <input
                                        id="verificationCode"
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full bg-white border-gray-300 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemove(selectedPerson)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Remove
                                </button>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        className="ml-2 bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                        onClick={
                                            handleClose
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {(selectedPerson) ? (
                <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-75 p-4 sm:p-6 ${isChartModalOpen ? "" : "hidden"}`}>
                    <div id="chart-container" className="bg-white rounded-lg p-4 sm:p-8 md:p-20">
                        <p className="text-lg font-semibold text-center mb-4 sm:mb-6 text-gray-500">
                            {selectedPerson.name}
                        </p>
                        <div className="w-full">
                            {/*<LineChart*/}
                            {/*    width={700}*/}
                            {/*    height={500}*/}
                            {/*    data={Object.entries(selectedPerson.log[0])*/}
                            {/*        .map(([date, value]) => ({*/}
                            {/*            date: new Date(date),*/}
                            {/*            hours: value,*/}
                            {/*        }))*/}
                            {/*        .sort((a, b) => a.date - b.date)*/}
                            {/*        .map(({ date, hours }) => ({*/}
                            {/*            date: date.toISOString().split("T")[0],*/}
                            {/*            hours: hours,*/}
                            {/*        }))}*/}
                            {/*    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}*/}
                            {/*>*/}
                            {/*    <CartesianGrid strokeDasharray="10 10" />*/}
                            {/*    <XAxis dataKey="date" />*/}
                            {/*    <YAxis />*/}
                            {/*    <Tooltip />*/}
                            {/*    <Legend />*/}
                            {/*    <Line*/}
                            {/*        type="monotone"*/}
                            {/*        dataKey="hours"*/}
                            {/*        strokeWidth={2}*/}
                            {/*        dot={{ r: 5, strokeWidth: 2 }}*/}
                            {/*        activeDot={{ r: 6 }}*/}
                            {/*    />*/}
                            {/*</LineChart>*/}
                        </div>
                    </div>

                    <div className="flex justify-center items-center mt-4 sm:mt-6">
                        <button
                            type="button"
                            className="ml-2 bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                            onClick={() => setIsChartModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="ml-2 bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    </div>
                </div>

            ):(null)}

        </div>
    )
}

export default ViewAll