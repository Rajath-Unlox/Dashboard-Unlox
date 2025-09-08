"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PageLoaderWrapper from "@/components/PageLoaderWrapper";

type Person = {
  id: string;
  name: string;
  email: string;
  contact: string;
  course: string;
  batch: string;
};

export default function Page() {
  const [data, setData] = React.useState<Person[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch users
  React.useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((users) => {
        const mapped = users.map((person: any) => ({
          id: person._id,
          name: person.name,
          email: person.email,
          contact: person.contact,
          course: person.course,
          batch: person.batch,
        }));
        setData(mapped);
        console.log("Fetched users:", mapped);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(
    null
  );

  const [editingPerson, setEditingPerson] = React.useState<Person | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newPerson, setNewPerson] = React.useState<Omit<Person, 'id'>>({
    name: '',
    email: '',
    contact: '',
    course: '',
    batch: ''
  });

  const handleSave = () => {
    if (!editingPerson) return;
    fetch(`http://localhost:5000/api/users/${editingPerson.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPerson),
    })
      .then((res) => res.json())
      .then((updated) => {
        setData((prev) =>
          prev.map((p) =>
            p.id === updated._id ? { ...updated, id: updated._id } : p
          )
        );
        setIsEditDialogOpen(false);
      });
  };


  const handleAddUser = () => {

    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPerson),
    })
      .then((res) => res.json())
      .then((created) => {
        setData((prev) => [...prev, { ...created, id: created._id }]);
        setIsAddDialogOpen(false);
        setNewPerson({ name: '', email: '', contact: '', course: '', batch: '' });
      })
      .catch((err) => console.error('Error adding user:', err));
  };

  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" }).then(
      () => setData((prev) => prev.filter((p) => p.id !== id))
    );
  };

  const confirmDelete = () => {
    if (!selectedPersonId) return;
    handleDelete(selectedPersonId);
    setIsDeleteDialogOpen(false);
    setSelectedPersonId(null);
  };

  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize ml-2">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase ml-2">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("contact")}</div>,
    },
    {
      accessorKey: "course",
      header: "Course",
      cell: ({ row }) => <div>{row.getValue("course")}</div>,
    },
    {
      accessorKey: "batch",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Batch <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-2">{row.getValue("batch")}</div>,
      sortingFn: (a, b) => {
        const parseBatch = (batch: any) => {
          const [month, year] = batch.split(" ");
          return new Date(`${month} 1, ${year}`); // convert "August 2025" → Date
        };

        const dateA: any = parseBatch(a.getValue("batch"));
        const dateB: any = parseBatch(b.getValue("batch"));

        return dateA - dateB;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const person = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(person.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingPerson(person);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPersonId(person.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      Object.values(row.original).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      ),
  });

  return (
    <PageLoaderWrapper loading={loading}>
      <div className="w-full">
        {/* Search & Columns */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add User
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          {/* <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Person</DialogTitle>
            </DialogHeader>
            {editingPerson && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingPerson.name}
                    onChange={(e) =>
                      setEditingPerson({ ...editingPerson, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editingPerson.email}
                    onChange={(e) =>
                      setEditingPerson({
                        ...editingPerson,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingPerson.contact}
                    onChange={(e) =>
                      setEditingPerson({
                        ...editingPerson,
                        contact: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Input
                    value={editingPerson.course}
                    onChange={(e) =>
                      setEditingPerson({
                        ...editingPerson,
                        course: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Batch</Label>
                  <Input
                    value={editingPerson.batch}
                    onChange={(e) =>
                      setEditingPerson({
                        ...editingPerson,
                        batch: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete this person? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add user dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Name</Label>
                <Input
                  value={newPerson.name}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, name: e.target.value })
                  }
                  placeholder="Enter name"
                  required={true}
                />
              </div>
              <div>
                <Label className="mb-2 block">Email</Label>
                <Input
                  value={newPerson.email}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label className="mb-2 block">Phone</Label>
                <Input
                  value={newPerson.contact}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, contact: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label className="mb-2 block">Course</Label>
                <Input
                  value={newPerson.course}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, course: e.target.value })
                  }
                  placeholder="Enter course"
                />
              </div>
              <div>
                <Label className="mb-2 block">Batch</Label>
                <Input
                  value={newPerson.batch}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, batch: e.target.value })
                  }
                  placeholder="Enter batch (e.g., August 2025)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewPerson({ name: '', email: '', contact: '', course: '', batch: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser}
                disabled={
                  !newPerson.name.trim() ||
                  !newPerson.email.trim() ||
                  !newPerson.contact.trim() ||
                  !newPerson.course.trim() ||
                  !newPerson.batch.trim()
                }>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLoaderWrapper>
  );
}
