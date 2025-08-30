import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

const users = [
  { name: "John Doe", course: "Web Development", initials: "JD" },
  { name: "Jane Smith", course: "UI/UX Design", initials: "JS" },
  { name: "Mark Taylor", course: "Data Science", initials: "MT" },
  { name: "Alice Johnson", course: "Machine Learning", initials: "AJ" },
  { name: "Robert Brown", course: "Cybersecurity", initials: "RB" },
  { name: "Emma Davis", course: "Blockchain", initials: "ED" },
  { name: "Michael Lee", course: "Cloud Computing", initials: "ML" },
];

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
const getColorForUser = (name: any) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const UserRow = ({ initials, name, course }: any) => {
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
        {users.map((user, index) => (
          <UserRow key={index} {...user} />
        ))}
      </CardContent>
    </Card>
  );
};

export default UserTable;
