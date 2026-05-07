import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import axios from "axios";

//Get all products with pagination
export const getAllProducts = createAsyncThunk(
  "products/getAll",
  async ({ page = 1, limit = 10 } = {}) => {
    const res = await axios.get(`/api/products?page=${page}&limit=${limit}`);
    return res.data;
  }
);

//Get single product
export const getProduct = createAsyncThunk("products/getOne", fetchProductById);

//Create product
export const addProduct = createAsyncThunk("products/create", createProduct);

//Update product
export const editProduct = createAsyncThunk(
  "products/update",
  ({ id, updates }) => updateProduct(id, updates)
);

//Delete product
export const removeProduct = createAsyncThunk("products/delete", deleteProduct);

//Filtered products with pagination
export const getFilteredProducts = createAsyncThunk(
  "products/getFiltered",
  async (filters = {}) => {
    const {
      specials,
      categories,
      features,
      availability,
      minPrice,
      maxPrice,
      minRating,
      sort,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const params = new URLSearchParams();

    if (specials && specials.length)
      params.append("specials", specials.join(","));
    if (categories && categories.length)
      params.append("categories", categories.join(","));
    if (features && features.length)
      params.append("features", features.join(","));

    if (availability) params.append("availability", availability);
    if (minPrice != null) params.append("minPrice", minPrice);
    if (maxPrice != null) params.append("maxPrice", maxPrice);
    if (minRating) params.append("minRating", minRating);
    if (sort) params.append("sort", sort);
    if (search) params.append("search", search);

    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await axios.get(`/api/products?${params.toString()}`);
    return res.data;
  }
);

const initialState = {
  items: [],
  single: null,
  loading: false,
  filters: {
    categories: [],
    specials: [],
    features: [],
    availability: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: "default",
    search: "",
  },
  error: null,
  pagination: { total: 0, page: 1, limit: 12, totalPages: 1 },
};

const productSlice = createSlice({
  name: "products",
  initialState,

  reducers: {
    clearSingleProduct(state) {
      state.single = null;
    },
    setSort(state, action) {
      state.filters.sort = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    removeFilterTag(state, action) {
      const { type, value } = action.payload;
      if (Array.isArray(state.filters[type])) {
        state.filters[type] = state.filters[type].filter(
          (item) => item !== value
        );
      } else {
        state.filters[type] = initialState.filters[type];
      }
    },
    clearFilters(state) {
      state.filters = {
        ...initialState.filters,
        sort: state.filters.sort,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      //Cases for getAllProducts
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      //Cases for getFilteredProducts (with the loop fix)
      .addCase(getFilteredProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFilteredProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(getFilteredProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      //Cases for getProduct
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.single = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      //Cases for CUD operations
      .addCase(addProduct.fulfilled, (state, action) => {
        if (!state.items.find((p) => p._id === action.payload._id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;
        if (state.single && state.single._id === action.payload._id) {
          state.single = action.payload;
        }
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.meta.arg);
      });
  },
});

export const {
  clearSingleProduct,
  setSort,
  setFilters,
  removeFilterTag,
  clearFilters,
} = productSlice.actions;

export default productSlice.reducer;
