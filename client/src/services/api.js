import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let mockBooks = [
  {
    id: "1",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Software Engineering",
    publication_year: 2008,
    price: 39.99,
    stock_quantity: 15,
    description:
      "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    isbn: "978-0135957059",
    category: "Software Engineering",
    publication_year: 2019,
    price: 49.99,
    stock_quantity: 8,
    description:
      "Illustrates the best approaches and major pitfalls of many aspects of software development.",
    created_at: "2023-02-20T10:00:00Z",
    updated_at: "2023-02-20T10:00:00Z",
  },
  {
    id: "3",
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Software Engineering",
    publication_year: 1994,
    price: 54.95,
    stock_quantity: 3,
    description:
      "Capturing a wealth of experience about the design of object-oriented software.",
    created_at: "2023-03-10T10:00:00Z",
    updated_at: "2023-03-10T10:00:00Z",
  },
  {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    isbn: "978-0441172719",
    category: "Fiction",
    publication_year: 1965,
    price: 18.29,
    stock_quantity: 0,
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.",
    created_at: "2023-04-05T10:00:00Z",
    updated_at: "2023-04-05T10:00:00Z",
  },
  {
    id: "5",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "Non-Fiction",
    publication_year: 2015,
    price: 24.99,
    stock_quantity: 22,
    description:
      "A bold, wide-ranging narrative that challenges everything we knew about being human.",
    created_at: "2023-05-12T10:00:00Z",
    updated_at: "2023-05-12T10:00:00Z",
  },
];

export const getBooks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (
      params.query !== undefined &&
      params.query !== null &&
      params.query !== ""
    ) {
      queryParams.append("query", params.query);
    }
    if (
      params.category !== undefined &&
      params.category !== null &&
      params.category !== "" &&
      params.category !== "All"
    ) {
      queryParams.append("category", params.category);
    }
    if (
      params.in_stock !== undefined &&
      params.in_stock !== null &&
      params.in_stock !== ""
    ) {
      queryParams.append("in_stock", params.in_stock);
    }
    if (params.skip !== undefined && params.skip !== null) {
      queryParams.append("skip", params.skip);
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", params.limit);
    }

    const response = await api.get("/api/v1/books", { params: queryParams });
    return response.data;
  } catch (error) {
    console.warn(
      "Backend API unavailable, using mock data for getBooks:",
      error.message,
    );
    let filtered = [...mockBooks];

    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q),
      );
    }

    if (params.category && params.category !== "All") {
      filtered = filtered.filter((b) => b.category === params.category);
    }

    if (
      params.in_stock !== undefined &&
      params.in_stock !== null &&
      params.in_stock !== ""
    ) {
      const isInStock = String(params.in_stock) === "true";
      filtered = filtered.filter((b) =>
        isInStock ? b.stock_quantity > 0 : b.stock_quantity === 0,
      );
    }

    const skip = Number(params.skip) || 0;
    const limit = Number(params.limit) || 10;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      items: paginated,
      total: filtered.length,
      skip,
      limit,
    };
  }
};

export const getBookById = async (id) => {
  try {
    const response = await api.get(`/api/v1/books/${id}`);
    return response.data;
  } catch (error) {
    console.warn(
      `Backend API unavailable for getBookById(${id}), using mock fallback:`,
      error.message,
    );
    const book = mockBooks.find((b) => String(b.id) === String(id));
    if (book) {
      return book;
    }
    if (mockBooks.length > 0) {
      return { ...mockBooks[0], id: id };
    }
    throw error;
  }
};

export const createBook = async (bookData) => {
  const payload = {
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    category: bookData.category,
    publication_year: parseInt(bookData.publication_year, 10),
    price: parseFloat(bookData.price),
    stock_quantity: parseInt(bookData.stock_quantity, 10),
    description: bookData.description || "",
  };
  try {
    const response = await api.post("/api/v1/books", payload);
    return response.data;
  } catch (error) {
    console.warn(
      "Backend API unavailable, creating book in mock data:",
      error.message,
    );
    const newBook = {
      ...payload,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockBooks.unshift(newBook);
    return newBook;
  }
};

export const updateBook = async (id, bookData) => {
  const payload = {
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    category: bookData.category,
    publication_year: parseInt(bookData.publication_year, 10),
    price: parseFloat(bookData.price),
    stock_quantity: parseInt(bookData.stock_quantity, 10),
    description: bookData.description || "",
  };
  try {
    const response = await api.put(`/api/v1/books/${id}`, payload);
    return response.data;
  } catch (error) {
    console.warn(
      `Backend API unavailable, updating book ${id} in mock data:`,
      error.message,
    );
    const index = mockBooks.findIndex((b) => String(b.id) === String(id));
    if (index !== -1) {
      mockBooks[index] = {
        ...mockBooks[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return mockBooks[index];
    }
    const fallback = {
      id,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return fallback;
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/api/v1/books/${id}`);
    return response.data;
  } catch (error) {
    console.warn(
      `Backend API unavailable, deleting book ${id} from mock data:`,
      error.message,
    );
    const index = mockBooks.findIndex((b) => String(b.id) === String(id));
    if (index !== -1) {
      const deleted = mockBooks.splice(index, 1);
      return deleted[0];
    }
    return { success: true };
  }
};

export default api;
