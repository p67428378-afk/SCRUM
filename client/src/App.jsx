import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";
import AddTaskForm from "./components/todos/AddTaskForm.jsx";
import TaskTable from "./components/todos/TaskTable.jsx";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./services/api.js";
import { ListTodo, Clock, CheckCircle2 } from "lucide-react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTodos, setTotalTodos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchTodos = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const skip = (page - 1) * limit;
      const data = await getTodos(skip, limit);
      setTodos(data.todos || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotalTodos(data.totalTodos || 0);
    } catch (err) {
      setError(
        "Failed to fetch tasks. Please make sure the backend is running.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos(currentPage);
  }, [currentPage]);

  const handleAddTask = async (title, description) => {
    try {
      await createTodo(title, description);
      // Refresh current page
      fetchTodos(currentPage);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateTodo(id, { completed });
      // Refresh current page
      fetchTodos(currentPage);
    } catch (err) {
      console.error(err);
      setError("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTodo(id);
      // Refresh current page
      fetchTodos(currentPage);
    } catch (err) {
      console.error(err);
      setError("Failed to delete task.");
    }
  };

  // Filter todos locally based on search query
  const filteredTodos = todos.filter((todo) => {
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    );
  });

  // Calculate KPIs
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="flex bg-background text-on-surface font-sans min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="flex flex-col h-screen md:ml-[260px] w-full md:w-[calc(100%-260px)]">
        {/* Header */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-lg lg:p-margin-desktop">
          <div className="max-w-6xl mx-auto space-y-xl">
            {/* Page Header */}
            <div className="mb-gutter">
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Overview
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                Track your progress and manage your day.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className="text-error text-sm bg-error/10 p-sm rounded-lg border border-error/20"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Row 1: KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Total Tasks */}
              <div className="bg-surface rounded-lg p-md border border-outline-variant card-elevation interactive-card flex flex-col justify-between h-[140px]">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Total Tasks
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <ListTodo className="w-4 h-4 text-on-surface-variant" />
                  </div>
                </div>
                <div className="mt-auto">
                  <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    {totalTodos}
                  </span>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-surface rounded-lg p-md border border-outline-variant card-elevation interactive-card flex flex-col justify-between h-[140px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-semibold">
                    Pending
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="mt-auto relative z-10 flex items-baseline gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    {pendingCount}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary">
                    Needs attention
                  </span>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="bg-surface rounded-lg p-md border border-outline-variant card-elevation interactive-card flex flex-col justify-between h-[140px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-success/5 group-hover:bg-success/10 transition-colors"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="font-label-md text-label-md text-success uppercase tracking-wider font-semibold">
                    Completed
                  </span>
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                </div>
                <div className="mt-auto relative z-10 flex items-baseline gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    {completedCount}
                  </span>
                  <span className="font-label-sm text-label-sm text-success">
                    Great job!
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Add New Task Form */}
            <AddTaskForm onAddTask={handleAddTask} />

            {/* Row 3: To-Do List Table */}
            {loading ? (
              <div className="text-center py-lg text-on-surface-variant">
                Loading tasks...
              </div>
            ) : (
              <TaskTable
                todos={filteredTodos}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
