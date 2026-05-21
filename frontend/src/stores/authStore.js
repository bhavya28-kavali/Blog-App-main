import { create } from 'zustand'
import axios from 'axios'
import { API_BASE } from '../config/api'
import { logError } from '../utils/logger'

export const useAuth = create((set)=>({
    currentUser:null,
    loading:true,
    isAuthenticated :false,
    error:null,
    verifyAuth: async () =>{
          try {
            //set loading true and error null
            set({loading:true,error:null})
            //make api call
            let res = await axios.get(`${API_BASE}/common-api/check-auth`,{withCredentials:true})
            res=res.data
            // console.log(res)
            set({
                loading:false,
                isAuthenticated:true,
                currentUser:res.payload,
                error:null
            });

          } catch (err) {
            logError(err)
            set({
                loading:false,
                isAuthenticated:false,
                currentUser:null,
                error:err.response?.data?.error
            })
      }
    },
    login : async (userCredWithRole) => {
        const {role, ...userCredObj} = userCredWithRole;
        try {
            //set loading true and error null
            set({loading:true,error:null})
            //make api call
            let res = await axios.post(`${API_BASE}/common-api/login`,userCredObj,{withCredentials:true})
            res=res.data
            // console.log(res)
            //update state
            set({
                loading:false,
                isAuthenticated:true,
                currentUser:res.payload,
                error:null
            });

        } catch (err) {
            logError(err)
            set({
                loading:false,
                isAuthenticated:false,
                currentUser:null,
                error:err.response?.data?.error || "Login failed"
            })
        }
    },
    logout :async ()=>{
      try {
        set({loading:true,error:null})
        let res =await axios.get(`${API_BASE}/common-api/logout`,{withCredentials:true})
        res=res.data
        // success
        set({
            loading:false,
            isAuthenticated:false,
            currentUser:null
        });
      } 
			catch (err) {
        logError(err)
            set({
              loading:false,
              isAuthenticated:false,
              currentUser:null,
              error:err.response?.data?.error || "Logout failed"
            });
      }
    },
}));



// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import axios from 'axios'

// export const useAuth = create(
//   persist(
//     (set) => ({
//       currentUser: null,
//       loading: false,
//       error: null,
//       isAuthenticated: false,

//       login: async (userCredWithRole) => {
//         const { role, ...userCredObj } = userCredWithRole
//         try {
//           set({ loading: true, error: null })

//           let res = await axios.post(
//             `${import.meta.env.VITE_API_URL}/common-api/login`,
//             userCredObj,
//             { withCredentials: true }
//           )

//           set({
//             loading: false,
//             isAuthenticated: true,
//             currentUser: res.data.payload
//           })
//         } catch (err) {
//           set({
//             loading: false,
//             isAuthenticated: false,
//             currentUser: null,
//             error: err.response?.data?.error || "Login failed",
//           })
//         }
//       },

//       logout: async () => {
//         try {
//           set({ loading: true, error: null })

//           await axios.get(
//             `${import.meta.env.VITE_API_URL}/common-api/logout`,
//             { withCredentials: true }
//           )

//           set({
//             loading: false,
//             isAuthenticated: false,
//             currentUser: null
//           })
//         } catch (err) {
//           set({
//             loading: false,
//             isAuthenticated: false,
//             currentUser: null,
//             error: err.response?.data?.error || "Logout failed",
//           })
//         }
//       }
//     }),
//     {
//       name: "auth-storage", // 🔥 key in localStorage
//     }
//   )
// )