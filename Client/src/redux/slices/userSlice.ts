import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getCurrentUser, createUser } from '../../services/users';
import type { AxiosError } from 'axios';
import type { Auth0Payload } from '../../types';

import type { IUser } from '../../types';

interface UserState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk to fetch user
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (payload: Auth0Payload, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser(payload.token!);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    //   console.log(axiosError?.response?.data?.error);
      if (axiosError?.response?.data?.error === 'User not found') {
       try {
        const {userData} = payload;
         // create user
         await createUser({
            email: userData.email,
            email_verified: userData.email_verified,
            lastName: userData.family_name,
            firstName: userData.given_name,
            name: userData.name,
            nickname: userData.nickname,
            picture: userData.picture,
            auth0Id: userData.sub,
            profilePicture: userData.picture,
         });
         
         // refetch user after creation to get complete user data
         const fetchResponse = await getCurrentUser(userData.email);

         return fetchResponse.data;
       } catch (error) {
        return rejectWithValue(error as string);
       }
      }
      return rejectWithValue(axiosError?.response?.data?.message || 'Failed to fetch user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      });
  },
});

export const { setUser, setLoading, setError, clearError } = userSlice.actions;

export default userSlice.reducer;
