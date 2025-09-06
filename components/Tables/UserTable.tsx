"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

// Tailwind background colors
const avatarColors = [
  "bg-orange-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-red-400",
  "bg-teal-400",
  "bg-indigo-400",
];

// Hash function to always pick the same color for same name
const getColorForUser = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

interface User {
  name: string;
  course: string;
  createdAt: string;
}

const UserRow = ({ name, course }: User) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colorClass = getColorForUser(name);
  return (
    <div className="flex items-center justify-between border p-4 rounded-lg transition">
      <div className="flex gap-4 items-center">
        <div
          className={`w-12 h-12 rounded-full flex text-lg font-medium text-white items-center justify-center ${colorClass}`}
        >
          {initials}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-medium">{name}</h1>
          <p className="text-sm text-gray-500">{course}</p>
        </div>
      </div>
    </div>
  );
};

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        // Sort by createdAt descending and take last 5 users
        const sorted = data
          .sort(
            (a: User, b: User) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setUsers(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>List of recent users</CardDescription>
        </div>
        <CardAction>
          <MoreVertical className="text-gray-500 cursor-pointer" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-[300px] overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div>Loading...</div>
        ) : users.length === 0 ? (
          <div>No users found.</div>
        ) : (
          users.map((user, index) => <UserRow key={index} {...user} />)
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;