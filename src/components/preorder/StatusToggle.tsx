"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface StatusToggleProps {
  id: string;
  status: "active" | "inactive";
  onToggle: (id: string, newStatus: "active" | "inactive") => void;
}

export const StatusToggle = ({ id, status, onToggle }: StatusToggleProps) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = status === "active" ? "inactive" : "active";
    try {
      await axios.patch(`/api/preorders/${id}/status`, {
        status: newStatus,
      });
      onToggle(id, newStatus);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update preorder status"
        : "Network error. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isActive = status === "active";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-8 items-center rounded-md transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive ? "bg-[#1f1f1f]" : "bg-[#e5e7eb]"
      }`}
      title={isActive ? "Set Inactive" : "Set Active"}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-sm bg-white transition-transform duration-150 ${
          isActive ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
};
