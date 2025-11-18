import { createSlice } from "@reduxjs/toolkit";

type TRegisterState = {
  name: null | string;
  email: null | string;
  password: null | string;
};

const initialState: TRegisterState = {
  name: null,
  email: null,
  password: null,
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setRegister: (state, action) => {
      const { name, email, password } = action.payload;
      state.name = name;
      state.email = email;
      state.password = password;
    },
    clearRegister: (state) => {
      state.name = null;
      state.email = null;
      state.password = null;
    },
  },
});

export const { setRegister, clearRegister } = registerSlice.actions;
export default registerSlice.reducer;