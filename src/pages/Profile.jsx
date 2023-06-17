import {useState} from "react";
import { useParams } from 'react-router-dom';
import {collection, getDocs, updateDoc, doc as firestoreDoc ,deleteDoc,query, where} from "firebase/firestore";
import React, {useEffect} from "react";
import {firestore} from "./firebase.config";
import { FaStar } from 'react-icons/fa';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const Profile = () => {

    const [bgColor, setBgColor] = useState('bg-white');
    const { username } = useParams();
    const [data, setData] = useState([]);
    const [colorTheme, setColorTheme] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isError,setIsError]=useState(false);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);

    const handleClick = (color) => {
        setBgColor(color);
        console.log(bgColor)
    };

    const colors = [
        {
            className: 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500',
            btnClassName:'bg-blue-400',
            theme: 'manchester by the sea',
        },
        {
            className: 'bg-gradient-to-r from-slate-500 to-yellow-100',
            btnClassName:'bg-emerald-400',

            theme: 'coral reef',
        },
        {
            className: 'bg-gradient-to-r from-indigo-300 to-purple-400',
            btnClassName:'bg-pink-300',
            theme: 'lavender blush',
        },
        {
            className: 'bg-gradient-to-tr from-gray-900 via-purple-900 to-violet-600',
            btnClassName:'bg-indigo-500',
            theme: 'retrowave',
        },
        {
            className:
                'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-500 to-red-800',
              btnClassName:'bg-red-400',
            theme: 'bloodshot',
        },
        {
            className: 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gray-400 via-gray-700 to-gray-900',
            btnClassName:'bg-black',
            theme: 'monotone',
        },
    ];

    const getClassNameByTheme  = (themeName) => {
        console.log('serching')
        for(const color of colors){
            if(themeName===color.theme){
                setBgColor(color.className)
                setColorTheme(color.btnClassName)
            }
        }
    };

    const totalHours = data.reduce((total, person) => {
        if (person.log && Array.isArray(person.log)) {
            const personTotalHours = person.log.reduce((sum, logItem) => {
                return sum + parseFloat(logItem.hours);
            }, 0);
            return total + personTotalHours;
        }
        return total;
    }, 0);


    useEffect(()=>{
        const fetchData = async () => {
            try {
                const q = query(collection(firestore, 'members'), where('username', '==', username));
                const querySnapshot = await getDocs(q);
                const fetchedData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(fetchedData)
                getClassNameByTheme(fetchedData[0].theme);
                setIsLoading(false)


            } catch (error) {
                setIsLoading(false);
                console.error('Error fetching Firestore data:', error);
                setIsError(true);

            }
        };
        fetchData()

    },[])

    if(isError){
        return(
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-4xl text-gray-600">
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
            </div>
            <div className="text-md italic text-gray-600">
                {username} does not exist in this space 🪐
            </div>
        </div>
        )}
    if (isLoading) {
        return  (<div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <div className="text-md italic text-gray-600 ">
                loading...
            </div>
        </div>)

    }


    return  (
        <div className={`main ${bgColor} grid place-items-center h-screen flex flex-col gap-5`}>

            {data

                .map((person) => (
        <div className="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64 rounded-md ">
            {/*<div className="image mx-auto rounded-full py-2 w-16 ">*/}
            {/*<img src="#" alt="profile" />*/}
            {/*    </div>*/}
            <div className="name text-gray-800 text-xl font-medium mt-2 rounded-lg">
            <p>{person.name}</p>
                </div>
            <div className="username text-gray-500">
            <p>@{person.username}</p>
                </div>

            <div className="work text-gray-700 mt-4 text-xs">
            <p>{person.bio} at acm-{(person.role).toLowerCase()}</p>
                </div>

            </div>

                    ))}
            <div className="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64">
                <div className="name text-gray-800 text-xxl font-medium mt-2 ">
                    <p>Club Achievements</p>
                </div>
                <div className="username text-gray-500">
                    <p>to be updated</p>
                </div>
            </div>
            {data[0].projects && (
            <div className="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64">

                <div className="name text-gray-800 text-xxl font-medium mt-2 flex flex-col justify-center items-center">
                    <p>Projects Undertaken</p>

                        <div className={`card ${colorTheme} text-white flex flex-col items-center justify-center shadow-lg rounded-xl p-2`}>
                            <div className="name text-white text-md font-medium mt-2">
                                <p>{data[0].projects.title}</p>
                            </div>
                            <div className="username text-sm  text-white-500 mt-2">
                                <p>{data[0].projects.progress}</p>
                            </div>
                        </div>

                </div>
            </div>
            )}
            <div className="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64">
                <div className="name text-gray-800 text-xxl font-medium mt-2 flex flex-col justify-center items-center">
                    <p>Club Stats</p>
                    <div className="text-gray-800 mt-2 flex flex-col justify-center items-center">
                        <p className="text-md font-medium">total hours of experience 🚀</p>
                        <p className="text-4xl font-bold mt-2">{totalHours.toFixed(2)} ⚡️ </p>
                        <div className="mt-4">
                            {(totalHours>0) &&(
                            <button
                                onClick={() => setIsChartModalOpen(true)}
                                className={`inline-block ${colorTheme} text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                            >
                                View Chart
                            </button>
                            )}
                        </div>
                    </div>

                </div>




                {isChartModalOpen && (
                        <div  onClick={()=>setIsChartModalOpen(false)} className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-75 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex flex-col items-center justify-center">
                    {data.map((person) => {
                        const chartData = person.log
                        .map((logItem) => ({
                        date: logItem.date,
                        hours: parseFloat(logItem.hours),
                    }))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(({ date, hours }) => ({
                        date: date,
                        hours: hours.toFixed(2),
                    }));

                        return (
                        <div key={person.id}>
                        <div>
                        <div className="aspect-w-3 aspect-h-2 sm:aspect-w-4 sm:aspect-h-3"  style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top:250,
                    }}>
                        <ResponsiveContainer width="99%" aspect={3}>
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
                                <XAxis dataKey="date" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #ccc",
                                    }}
                                    labelStyle={{
                                        color: "#555",
                                    }}
                                    itemStyle={{
                                        color: "#555",
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        </div>
                        </div>
                        </div>

                        );

                    })}
                        </div>

                        </div>
                   )}

            </div>

            {/*<div className="text-center mb-2">x hours of experience</div>*/}
                {/*<p  className="text-xs max-w-full text-gray-800" >your log record and hour stats goes herer</p>*/}
                {/*<span>🔨</span>*/}





            <div className="bg-white transition ease-in duration-1000 flex border shadow-lg shadow-gray-800 p-5 rounded-lg justify-between md:flex-row md:space-y-0 space-x-0 md:space-x-2 mb-5">
                <p className="text-lg font-bold text-black md:text-xl"><a href={"#/lost"}>spaces<sup>(beta)</sup></a></p>
                <p className="text-xs text-black md:text-xs sm:text-xs">&nbsp;❤️ web-sig &#183; acm</p>
            </div>

        </div>

    )
}
export default Profile;
