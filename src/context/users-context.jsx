// import React, { createContext, useContext, useState } from "react";
// import { initialUsers } from "../data/users-data";

// const UsersContext = createContext();

// export function UsersProvider({ children }) {
//   const [users, setUsers] = useState(initialUsers);

//   const addUser = (user) => {
//     const newUser = { ...user, id: "U" + Math.floor(100000 + Math.random() * 900000).toString(), status: "active" };
//     setUsers((prev) => [newUser, ...prev]);
//   };

//   const deleteUser = (id) => {
//     setUsers((prev) => prev.filter((user) => user.id !== id));
//   };

//   const toggleStatus = (id) => {
//     setUsers((prev) => prev.map((user) => 
//         user.id === id 
//             ? { ...user, status: user.status === "active" ? "inactive" : "active" } 
//             : user
//     ));
//   };

//   const updateUser = (id, updates) => {
//     setUsers((prev) => prev.map((user) => 
//         user.id === id ? { ...user, ...updates } : user
//     ));
//   };

//   return (
//     <UsersContext.Provider value={{ users, addUser, deleteUser, toggleStatus, updateUser }}>
//       {children}
//     </UsersContext.Provider>
//   );
// }

// export function useUsers() {
//   const context = useContext(UsersContext);
//   if (!context) {
//     throw new Error("useUsers must be used within a UsersProvider");
//   }
//   return context;
// }
