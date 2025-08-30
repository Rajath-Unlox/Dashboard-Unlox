import { NextResponse } from "next/server";

// Dummy in-memory users array (only for demo)
const users = [
  { id: "1", name: "Rajath", email: "rajath@example.com", password: "password123" },
];

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if user exists
  const exists = users.find((u) => u.email === email);
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Normally hash password and store in DB
  users.push({ id: Date.now().toString(), name, email, password });

  return NextResponse.json({ message: "User created" });
}
