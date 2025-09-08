"use client";

import * as React from "react";
import {
  ColumnDef,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PageLoaderWrapper from "@/components/PageLoaderWrapper";

export type Report = {
  id: string;
  name: string;
  status: "resolved" | "pending";
  email: string;
  report: string;
};

export default function Page() {
  const [data, setData] = React.useState<Report[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [editingReport, setEditingReport] = React.useState<Report | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newReport, setNewReport] = React.useState<Omit<Report, 'id'>>({
    name: '',
    status: 'pending',
    email: '',
    report: ''
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(
    null
  );

  const confirmDelete = () => {
    if (!selectedPersonId) return;
    handleDelete(selectedPersonId);
    setIsDeleteDialogOpen(false);
    setSelectedPersonId(null);
  };

  React.useEffect(() => {
    fetch("http://localhost:5000/api/reports")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching reports:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = () => {
    if (!editingReport) return;
    fetch(`http://localhost:5000/api/reports/${editingReport.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingReport),
    })
      .then((res) => res.json())
      .then((updated) => {
        setData((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setIsEditDialogOpen(false);
      });
  };

  const handleAddReport = () => {
    fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    })
      .then((res) => res.json())
      .then((created) => {
        setData((prev) => [...prev, created]);
        setIsAddDialogOpen(false);
        setNewReport({ name: '', status: 'pending', email: '', report: '' });
      })
      .catch((err) => console.error('Error adding report:', err));
  };

  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/reports/${id}`, { method: "DELETE" }).then(
      () => setData((prev) => prev.filter((r) => r.id !== id))
    );
  };

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div
          className={`capitalize font-medium rounded-full flex items-center justify-center py-1 ${row.getValue("status") === "resolved"
            ? "text-green-600 bg-green-100"
            : "text-yellow-600 bg-yellow-100"
            }`}
        >
          {row.getValue("status")}
        </div>
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
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "report",
      header: "Report",
      cell: ({ row }) => <div className="italic">{row.getValue("report")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const report = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(report.id)}
              >
                Copy report ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingReport(report);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPersonId(report.id);
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
    state: { sorting, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      ["status", "name", "email", "report"].some((key) =>
        String(row.original[key as keyof typeof row.original])
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      ),
  });

  return (
    <PageLoaderWrapper loading={isLoading}>
      <div className="w-full">
        {/* Filters & Column Toggle */}
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
              Add Report
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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
              <DialogTitle>Edit Report</DialogTitle>
            </DialogHeader>
            {editingReport && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingReport.name}
                    onChange={(e) =>
                      setEditingReport({ ...editingReport, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editingReport.email}
                    onChange={(e) =>
                      setEditingReport({
                        ...editingReport,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-1">
                    {["resolved", "pending"].map((statusOption) => {
                      const isSelected = editingReport.status === statusOption;
                      return (
                        <Button
                          key={statusOption}
                          variant={isSelected ? "default" : "outline"}
                          className={`capitalize ${isSelected
                            ? statusOption === "resolved"
                              ? "text-green-600 bg-green-100"
                              : "text-yellow-600 bg-yellow-100"
                            : "text-gray-800 bg-white border"
                            }`}
                          onClick={() =>
                            setEditingReport({
                              ...editingReport,
                              status: statusOption as "resolved" | "pending",
                            })
                          }
                        >
                          {statusOption}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Report</Label>
                  <Input
                    value={editingReport.report}
                    onChange={(e) =>
                      setEditingReport({
                        ...editingReport,
                        report: e.target.value,
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

        {/*delete dialogue*/}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete this Report? This action cannot be
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

        {/* Add Report Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Name</Label>
                <Input
                  value={newReport.name}
                  onChange={(e) =>
                    setNewReport({ ...newReport, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label className="mb-2 block">Email</Label>
                <Input
                  value={newReport.email}
                  onChange={(e) =>
                    setNewReport({ ...newReport, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label className="mb-2 block">Status</Label>
                <div className="flex gap-2 mt-1">
                  {["resolved", "pending"].map((statusOption) => {
                    const isSelected = newReport.status === statusOption;
                    return (
                      <Button
                        key={statusOption}
                        variant={isSelected ? "default" : "outline"}
                        className={`capitalize ${isSelected
                          ? statusOption === "resolved"
                            ? "text-green-600 bg-green-100"
                            : "text-yellow-600 bg-yellow-100"
                          : "text-gray-800 bg-white border"
                          }`}
                        onClick={() =>
                          setNewReport({
                            ...newReport,
                            status: statusOption as "resolved" | "pending",
                          })
                        }
                      >
                        {statusOption}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Report</Label>
                <Input
                  value={newReport.report}
                  onChange={(e) =>
                    setNewReport({ ...newReport, report: e.target.value })
                  }
                  placeholder="Enter report description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewReport({ name: '', status: 'pending', email: '', report: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddReport}
                disabled={
                  !newReport.name.trim() ||
                  !newReport.email.trim() ||
                  !newReport.report.trim()
                }>
                Add Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLoaderWrapper>
  );
}
