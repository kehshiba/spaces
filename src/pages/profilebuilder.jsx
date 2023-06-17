import React, {useEffect, useState} from "react";
import {auth, firestore} from "./firebase.config";
import {collection, addDoc, getDocs, query, where, doc as firestoreDoc, updateDoc} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useAuthState} from "react-firebase-hooks/auth";
import {useNavigate} from "react-router-dom";

const ProfileBuilder = () => {
    const [gradientClass, setGradientClass] = useState('');
    const [colorName, setColorName] = useState('');
    const [isAwait, setIsAwait] = useState('');

    const colorButtons = [
        {
            className: 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500',
            name: 'manchester by the sea',
        },
        {
            className: 'bg-gradient-to-r from-slate-500 to-yellow-100',
            name: 'coral reef',
        },
        {
            className: 'bg-gradient-to-r from-indigo-300 to-purple-400',
            name: 'lavender blush',
        },
        {
            className: 'bg-gradient-to-tr from-gray-900 via-purple-900 to-violet-600',
            name: 'retrowave',
        },
        {
            className:
                'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-500 to-red-800',
            name: 'bloodshot',
        },
        {
            className: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200',
            name: 'monotone',
        },
    ];

    const [person, setPerson] = useState({
        rollno: null,
        username:null,
        bio:null,
        theme:null
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if(event.target.name==='rollno'){
            const uppercaseValue = event.target.value.toUpperCase();
            setPerson((prev) => ({
                ...prev,
                [event.target.name]: uppercaseValue,

            }))
            }
            else if(event.target.name==='theme'){
                console.log("nothing")
            }
            else{
                setPerson((prev) => ({
                    ...prev,
                    [event.target.name]: event.target.value,

                }))
            }
        }

    const handleClick = (className, name) => {
        setGradientClass(className);
        setPerson((prev) => ({
            ...prev,
            theme: name,
        }));
        setColorName(name);
    };
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, "members"));
                const membersData = querySnapshot.docs.map((doc) => doc.data());
                setMembers(membersData);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchMembers();
    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {
            const usernameAvailable = members.every(
                (member) => member.username !== person.username
            );

            if(usernameAvailable) {
                console.log('sending')
                setIsAwait(true);
                const q = query(collection(firestore, 'members'), where('rollno', '==', person.rollno));
                const querySnapshot = await getDocs(q);
                if(querySnapshot) {
                    const updatePromises = querySnapshot.docs.map(async (doc) => {
                        const docRef = firestoreDoc(firestore, 'members', doc.id);
                        const fetchedData = querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        await updateDoc(docRef, {
                            username: person.username,
                            bio: person.bio,
                            theme: person.theme,
                        });

                    })
                    await Promise.all(updatePromises);
                    setIsAwait(false);
                    toast.success('Data submitted successfully!', {
                        position: 'bottom-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                }
                if(!querySnapshot){
                    toast.error('Does not exist')
                }

            }

        else if (!usernameAvailable) {
                toast.error("Username is not available. Please choose a different one.");
                return;
            }

        }
         catch (error) {
             toast.error('error')

             console.error('Error updating document:', error);
        }
    };

    useEffect(() => {
        if (isAwait) {
            // Show the toast notification
            toast.info('Awaiting response...', { position:'top-center' ,autoClose: false });
        } else {
            toast.dismiss();
        }
    }, [isAwait]);


    return (
        <div>
            <div className="flex border  shadow-lg p-5 rounded-lg justify-between m-10 md:flex-row md:space-y-0 space-x-0 md:space-x-2 mb-5">
                <p className="mb-3 text-lg font-bold text-black md:text-xl"><a href={"#/lost"}>space<sup>(beta)</sup></a></p>
                <div className="lg:flex lg:gap-x-12 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 space-x-0 md:space-x-2 mb-5 ">


                </div>
            </div>

            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <ToastContainer/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                       create your personal space 🖌️
                    </h2>
                    <p>your club achievements and logs live here 🏡</p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={ handleSubmit } >
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                Roll No ( AM.EN.U4 / AM.SC.U3... format )
                            </label>
                            <div className="mt-2">
                                <input
                                    id="rollno"
                                    name="rollno"
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
                                   username
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="rollno" className="block text-sm font-medium leading-6 text-gray-900">
                                    bio ( eg : front-end developer )
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="bio"
                                    name="bio"
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
                                    your theme
                                </label>
                            </div>
                            <div className="text-center">
                                <div className="flex flex-wrap justify-center items-center">
                                    {colorButtons.map((button, index) => (
                                        <input
                                            name="theme"
                                            id="theme"
                                            type='button'
                                            key={index}
                                            onClick={() => handleClick(button.className, button.name)}
                                            className={`w-10 h-10 rounded-full m-2 mx-auto ${button.className}`}

                                        />

                                    ))}

                                </div>
                                <p className="mt-2 block text-xs font-medium leading-6 text-gray-900">{colorName}</p>

                            </div>
                        </div>
                        <p className="text-gray-900 text-lg font-semibold mb-2">
                            Preview:
                        </p>
                        <div className="flex items-center rounded-md bg-gray-100 py-2 px-4 border border-gray-300">
                            <a
                                href={`https://labportal-acm.web.app/#/me/${person.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 hover:underline truncate"
                            >
                                https://labportal-acm.web.app/#/me/{person.username}
                            </a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                               create 🎨
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>

    )
}

export default ProfileBuilder