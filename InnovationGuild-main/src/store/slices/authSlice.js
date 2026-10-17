import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  userRole: null, // 'vle' | 'general_user' | 'innovator' | 'ao' | 'no' | null
  user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user } = action.payload;
      state.isLoggedIn = true;
      // NOTE: Two role formats coexist intentionally:
      // • state.userRole  = lowercase normalized ('vle', 'ao', 'admin', 'super_admin') — used by route guards
      // • state.user.role = uppercase backend format ('VLE', 'AO', 'ADMIN') — used for display/API calls
      state.userRole = user.role?.toLowerCase() ?? null;
      state.user = user;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userRole = null;
      state.user = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  }
})

export const { login, logout, updateUser } = authSlice.actions

// Selectors
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn
export const selectUserRole = (state) => state.auth.userRole
export const selectUser = (state) => state.auth.user
export const selectRegistrationComplete = (state) => state.auth.user?.registrationComplete ?? null

export default authSlice.reducer
