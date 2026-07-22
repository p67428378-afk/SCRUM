import React, { useState, useEffect } from "react";
import StatGrid from "../components/todo/StatGrid.jsx";
import FilterBar from "../components/todo/FilterBar.jsx";
import TaskGrid from "../components/todo/TaskGrid.jsx";
import TaskModal from "../components/todo/TaskModal.jsx";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../services/api.js";

export default function DashboardPage({ searchQuery, onSearchChange }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("due_date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError(
        "Failed to load tasks. Please check your connection or try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTaskClick = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEditTaskClick = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (todoData) => {
    setError("");
    try {
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, todoData);
        setTodos((prev) =>
          prev.map((t) => (t.id === editingTodo.id ? updated : t)),
        );
      } else {
        const created = await createTodo(todoData);
        setTodos((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingTodo(null);
    } catch (err) {
      console.error("Failed to save todo:", err);
      setError("Failed to save task. Please check your inputs and try again.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setError("");
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  // Filter and sort todos
  const filteredTodos = todos
    .filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description &&
          todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter
        ? todo.priority === priorityFilter
        : true;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "due_date") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === "priority") {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      }
      if (sortBy === "created_at") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  return (
    <main className="p-margin max-w-[1600px] mx-auto min-h-screen">
      {error && (
        <div className="mb-lg p-md bg-error-container/20 border border-error/30 text-error rounded-xl font-semibold flex items-center gap-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <StatGrid todos={todos} />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onAddTaskClick={handleAddTaskClick}
      />

      {loading ? (
        <div className="flex justify-center items-center py-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TaskGrid
          todos={filteredTodos}
          onEdit={handleEditTaskClick}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        todo={editingTodo}
      />
    </main>
  );
}
