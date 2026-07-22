import React, { useState, useEffect } from "react";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export default function TaskModal({ isOpen, onClose, onSave, todo = null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || "");
      setDescription(todo.description || "");
      setDueDate(
        todo.due_date
          ? new Date(todo.due_date).toISOString().split("T")[0]
          : "",
      );
      setPriority(todo.priority || "Medium");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
    }
    setError("");
  }, [todo, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const todoData = {
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
    };

    onSave(todoData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={todo ? "Edit Task" : "Add New Task"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        {error && (
          <div className="p-sm bg-error-container/20 border border-error/30 text-error rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
        <Input
          label="Description"
          type="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex flex-col gap-xs w-full">
          <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md text-on-surface transition-all"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="flex justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {todo ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
