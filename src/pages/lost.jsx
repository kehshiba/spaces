import React from 'react';

const Lost = () => {
    return (
        <div
            className="
    flex
    items-center
    justify-center
    w-screen
    h-screen
    bg-gradient-to-r
    from-indigo-600
    to-blue-400
  "
        >
            <div className="px-40 py-20 bg-white rounded-md shadow-xl">
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-blue-600 text-9xl">Hey there 👋</h1>

                    <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-xl">
                        <span className="text-red-500">Uh Oh!&nbsp;</span>Looks like you're lost 🏜️
                    </h6>

                    <p className="mb-8 text-center text-gray-500 md:text-md">
                        Liked spaces ❤️ ? Or Maybe want to help us out 🔨 ?
                        acm.web @amritapuri is open for recruits, contact the team for more !
                    </p>
                </div>
            </div>
        </div>

    );
};

export default Lost;
