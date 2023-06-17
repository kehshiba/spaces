import React, {useEffect, useState} from "react";
import {auth, firestore} from "./firebase.config";
import {collection, addDoc, getDocs, query, where} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useAuthState} from "react-firebase-hooks/auth";
import {useNavigate} from "react-router-dom";

const AddNew = () => {

    const [person, setPerson] = useState({
        name: null,
        rollno: null,
        role: null,
        batch:null,
        residence:null,
        phone_number:null,
        email:null,
        gender:null,
    });

    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        auth.signOut().then(() => navigate('/'));
    };

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(person)
        try {
            const q = query(collection(firestore, 'members'), where('rollno', '==', person.rollno));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty){
            await addDoc(collection(firestore, 'members'), person);
            toast.success(`Wohoo! 🎉`, {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
                }
            else{
                toast.warning(`Already Exists ⚠️`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
            }

        } catch (err)
        {
            toast.error(`Uh Oh! 😔`, {
                position: 'top-right',
                autoClose: 12000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.name==='email'||event.target.name==='residence'||event.target.name==='phone_number'){
            console.log(event.target.name)
            setPerson((prev) => ({
                ...prev,
                [event.target.name]: event.target.value,

            }))
        }
        else
        {
            const uppercaseValue = event.target.value.toUpperCase();
            setPerson((prev) => ({
                ...prev,
                [event.target.name]: uppercaseValue,

            }))
        }
    }


    return (
        <div>
        <div className="flex border  shadow-lg p-5 rounded-lg justify-between m-10 md:flex-row md:space-y-0 space-x-0 md:space-x-2 mb-5">
            <p className="mb-3 text-lg font-bold text-black md:text-xl"><a href="#/">punchly.<sup>(beta)</sup></a></p>
            <div className="lg:flex lg:gap-x-12 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 space-x-0 md:space-x-2 mb-5 ">
                <button
                    className="text-blue-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none md:mr-1 md:mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleSignOut}
                >Log Out
                </button>

            </div>
        </div>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <ToastContainer/>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    add a new member
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="rollno" className="block text-sm font-medium leading-6 text-gray-900">
                              Roll No (AM.EN.U4 / AM.SC.U3 format)
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="rollno"
                                name="rollno"
                                type="text"
                                required
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                                Role
                            </label>
                        </div>
                        <div className="mt-2">
                            <select id="batch" name="role" defaultValue=""
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option  value="">Select Role</option>
                            <option value="web">Web</option>
                            <option value="cp">CP</option>
                            <option value="ai">AI</option>
                            <option value="glitch">Glitch</option>
                            <option value="cyber-sec">Cyber Security</option>
                            <option value="nil">Nil</option>
                            </select>

                        </div>
                    </div>
                    <div className={"flex  gap-5"}>
                    <div className={"flex items-center justify-between"}>
                        <div className="mb-4">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                id="phone_number"
                                name="phone_number"
                                type="text"
                                onChange={handleChange}

                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <div className={"flex items-center justify-between"}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                onChange={handleChange}

                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    </div>
                    <div className={"flex  gap-5"}>

                    <div className={"flex items-center justify-between"}>
                        <div>
                            <label htmlFor="residence" className="block text-sm font-medium leading-6 text-gray-700">
                                Residence
                            </label>
                            <select id="residence"
                                    name="residence"
                                    onChange={handleChange}
                                    defaultValue={""}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                >
                                <option value="">Select</option>
                                <option value="h">Hosteler</option>
                                <option value="d">Day Scholar</option>

                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="batch" className="block text-sm font-medium leading-6 text-gray-900">
                                Batch
                            </label>
                        </div>
                        <div >
                            <select id="batch" defaultValue={""}
                                    name="batch"
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value={""}>Select Batch</option>
                                <option value="CSE">CSE</option>
                                <option value="ELC">ELC</option>
                                <option value="EAC">EAC</option>
                                <option value="ECE">ECE</option>
                                <option value="ME">ME</option>
                                <option value="AI">AI</option>
                                <option value="BCA">BCA</option>
                                <option value="nil">Nil</option>

                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">
                                Gender
                            </label>
                        </div>
                        <div>
                            <select id="gender" defaultValue={""}
                                    name="gender"
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value={""}>Select Gender</option>
                                <option value="m">Male</option>
                                <option value="f">Female</option>
                            </select>
                        </div>
                    </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            add member
                        </button>
                    </div>
                </form>

            </div>
        </div>
        </div>

    )
}

export default AddNew