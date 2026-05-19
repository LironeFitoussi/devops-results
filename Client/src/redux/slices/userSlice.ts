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
      if (axiosError?.response?.data?.error === 'User not found') {
       try {
        const { userData } = payload;

        // Auth0 may not provide given_name/family_name (email signup, some socials).
        // Derive a sensible firstName/lastName so the server's zod min(1) passes.
        const fullName = (userData.name || userData.nickname || userData.email || '').trim();
        const nameParts = fullName.split(/\s+/).filter(Boolean);
        const firstName =
          userData.given_name || nameParts[0] || userData.email?.split('@')[0] || 'User';
        const lastName =
          userData.family_name || nameParts.slice(1).join(' ') || firstName;

        // create user — only send fields the server's createUserSchema accepts
        await createUser({
          email: userData.email,
          firstName,
          lastName,
          auth0Id: userData.sub,
          profilePicture: userData.picture,
        });

        // refetch user after creation using the JWT (not the email)
        const fetchResponse = await getCurrentUser(payload.token!);

        return fetchResponse.data;
       } catch (createError: unknown) {
        const ce = createError as AxiosError<{ error?: string; message?: string }>;
        return rejectWithValue(
          ce?.response?.data?.error ||
          ce?.response?.data?.message ||
          ce?.message ||
          'Failed to create user'
        );
       }
      }
      return rejectWithValue(
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        'Failed to fetch user'
      );
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
