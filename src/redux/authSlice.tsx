import {createSlice} from "@reduxjs/toolkit";

const saveAuth = JSON.parse(localStorage.getItem("authState") || "null");

const initialState = saveAuth || {
    userData:null,
    isLoggedIn:false,
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.userData = action.payload.userData;
            state.isLoggedIn = action.payload.isLoggedIn;

            localStorage.setItem("authState",
                JSON.stringify({
                    userData:state.userData,
                    isLoggedIn:true,
                })
            )
        },
        logOut: (state) => {
      state.userData = null;
      state.isLoggedIn = false;

      
      localStorage.removeItem("authState");
    },
    }
})
export const { login, logOut } = authSlice.actions;
export default authSlice.reducer;
