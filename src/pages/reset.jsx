import React, {useEffect, useState} from "react";
import {auth, firestore} from "./firebase.config";
import {collection, getDocs, query, where, updateDoc} from 'firebase/firestore';
import 'react-toastify/dist/ReactToastify.css';
import {useAuthState} from "react-firebase-hooks/auth";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

const Reset = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState([]);
    const [isAwait, setIsAwait] = useState('');

    const [user] = useAuthState(auth);
    const handleInputChange = (event) => {
        const uppercaseValue = event.target.value.toUpperCase();
        setInputValue(uppercaseValue);
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
    const getPersonName = async (rollNo) => {
        try {
            console.log('Retrieving person name...');
            const q = query(collection(firestore, 'members'), where('rollno', '==', rollNo));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const personDoc = querySnapshot.docs[0];
                const personData = personDoc.data();
                const name = personData.name;
                const role = personData.role;
                const rollno = personData.rollno;
                const gender = personData.gender;
                console.log('Person name retrieved:', name,rollno);
                return { name, role ,gender,rollno};

            } else {
                console.log('Person not found with rollNo:', rollNo);
                return null;
            }
        } catch (error) {
            console.error('Error retrieving person name:', error);
            return null;
        }
    };


    const handleSubmit = async (event) => {
        console.log('Resetting person details...');
        const personData = await getPersonName(event.target[0].value);
        if (personData) {
            console.log('Person data found:', personData);
            try {
                setIsAwait(true);
                const dailyQuerySnapshot = await getDocs(collection(firestore, 'daily'));
                const dailyDocs = dailyQuerySnapshot.docs;

                for (const doc of dailyDocs) {
                    const dailyData = doc.data();
                    if (dailyData.rollNo === event.target[0].value) {
                        console.log(`Updating document with rollNo: ${event.target[0].value}`);
                        await updateDoc(doc.ref, {
                            checkInTime: Date.now(),
                            checkOutTime: null,
                        });
                        break;
                    }
                }
                setIsAwait(false);
                const updatedData = data.map((person) => {
                    if (person.rollNo === event.target[0].value) {
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
    useEffect(() => {
        if (isAwait) {
            // Show the toast notification
            toast.info('Awaiting response...', { position:'top-center' ,autoClose: false });
        } else {
            toast.dismiss();
        }
    }, [isAwait]);
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
        };
        fetchData();
    }, []);



    return (
        <div>
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
                        Reset
                    </button>
                </form>
            </div>
        </div>

    )
}

export default Reset