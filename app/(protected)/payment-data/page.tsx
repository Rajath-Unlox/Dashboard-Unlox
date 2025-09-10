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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";

type Person = {
  id: string;
  [key: string]: any; // make dynamic
};

export default function Page() {
  const [data, setData] = React.useState<Person[]>([
    
  ]);
  const [columns, setColumns] = React.useState<ColumnDef<any>[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(
    null
  );

  const [editingPerson, setEditingPerson] = React.useState<Person | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Filter states
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    course_type: 'all',
    pay_option: 'all',
    payment_status: 'all',
    batch: 'all',
    college: 'all',
    department: 'all',
    year: 'all',
    city: 'all',
    state: 'all',
    minAmount: '',
    maxAmount: '',
  });

  // Filter options (will be populated from data)
  const [filterOptions, setFilterOptions] = React.useState({
    course_types: [] as string[],
    pay_options: [] as string[],
    payment_statuses: [] as string[],
    batches: [] as string[],
    colleges: [] as string[],
    departments: [] as string[],
    years: [] as string[],
    cities: [] as string[],
    states: [] as string[],
  });

  // Fetch users & generate dynamic columns
  React.useEffect(() => {
    fetch("http://localhost:5000/api/payment")
      .then((res) => res.json())
      .then((users) => {
        if (!users.length) return;

        // Generate column defs from keys
        const dynamicColumns: ColumnDef<any>[] = Object.keys(users[0])
          .filter((key) => key !== "_id" && key !== "__v")
          .map((key) => ({
            accessorKey: key,
            header: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            cell: ({ row }: any) => (
              <div className="ml-2">{row.getValue(key)}</div>
            ),
          }));

        // Add actions column
        dynamicColumns.push({
          id: "actions",
          header: "Actions",
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
        });

        setColumns(dynamicColumns);

        // Map users into rows
        const mapped = users.map((person: any) => ({
          ...person,
          id: person._id,
        }));

        setData(mapped);

        // Extract unique values for filter options
        const uniqueValues: {
          course_types: string[];
          pay_options: string[];
          payment_statuses: string[];
          batches: string[];
          colleges: string[];
          departments: string[];
          years: string[];
          cities: string[];
          states: string[];
        } = {
          course_types: [...new Set(users.map((u: any) => u.course_type).filter(Boolean))] as string[],
          pay_options: [...new Set(users.map((u: any) => u.pay_option).filter(Boolean))] as string[],
          payment_statuses: [...new Set(users.map((u: any) => u.payment_status).filter(Boolean))] as string[],
          batches: [...new Set(users.map((u: any) => u.batch).filter(Boolean))] as string[],
          colleges: [...new Set(users.map((u: any) => u.college).filter(Boolean))] as string[],
          departments: [...new Set(users.map((u: any) => u.department).filter(Boolean))] as string[],
          years: [...new Set(users.map((u: any) => u.year).filter(Boolean))] as string[],
          cities: [...new Set(users.map((u: any) => u.city).filter(Boolean))] as string[],
          states: [...new Set(users.map((u: any) => u.state).filter(Boolean))] as string[],
        };
        setFilterOptions(uniqueValues);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter functions
  const applyFilters = React.useMemo(() => {
    return data.filter((item) => {
      // Text filters
      if (filters.course_type !== 'all' && item.course_type !== filters.course_type) return false;
      if (filters.pay_option !== 'all' && item.pay_option !== filters.pay_option) return false;
      if (filters.payment_status !== 'all' && item.payment_status !== filters.payment_status) return false;
      if (filters.batch !== 'all' && item.batch !== filters.batch) return false;
      if (filters.college !== 'all' && item.college !== filters.college) return false;
      if (filters.department !== 'all' && item.department !== filters.department) return false;
      if (filters.year !== 'all' && item.year !== filters.year) return false;
      if (filters.city !== 'all' && item.city !== filters.city) return false;
      if (filters.state !== 'all' && item.state !== filters.state) return false;
      
      // Amount range filters
      if (filters.minAmount && item.amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && item.amount > parseFloat(filters.maxAmount)) return false;
      
      return true;
    });
  }, [data, filters]);

  const clearFilters = () => {
    setFilters({
      course_type: 'all',
      pay_option: 'all',
      payment_status: 'all',
      batch: 'all',
      college: 'all',
      department: 'all',
      year: 'all',
      city: 'all',
      state: 'all',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Save edited record
  const handleSave = () => {
    if (!editingPerson) return;
    fetch(`http://localhost:5000/api/payments/${editingPerson.id}`, {
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

  // Delete record
  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/payments/${id}`, {
      method: "DELETE",
    }).then(() => setData((prev) => prev.filter((p) => p.id !== id)));
  };

  const confirmDelete = () => {
    if (!selectedPersonId) return;
    handleDelete(selectedPersonId);
    setIsDeleteDialogOpen(false);
    setSelectedPersonId(null);
  };

  const table = useReactTable({
    data: applyFilters,
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
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      Object.values(row.original).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      ),
  });

  return (
    <div className="w-full">
      {/* Search & Controls */}
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Course Type Filter */}
              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select
                  value={filters.course_type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, course_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.course_types.map((type) => (
                       <SelectItem key={type} value={type}>{type}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>

              {/* Payment Option Filter */}
              <div className="space-y-2">
                <Label>Payment Option</Label>
                <Select
                  value={filters.pay_option}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, pay_option: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment option" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.pay_options.map((option) => (
                       <SelectItem key={option} value={option}>{option}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={filters.payment_status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, payment_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.payment_statuses.map((status) => (
                       <SelectItem key={status} value={status}>{status}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>

              {/* Batch Filter */}
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select
                  value={filters.batch}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, batch: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.batches.map((batch) => (
                       <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* College Filter */}
               <div className="space-y-2">
                 <Label>College</Label>
                 <Select
                   value={filters.college}
                   onValueChange={(value) => setFilters(prev => ({ ...prev, college: value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select college" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.colleges.map((college) => (
                       <SelectItem key={college} value={college}>{college}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Department Filter */}
               <div className="space-y-2">
                 <Label>Department</Label>
                 <Select
                   value={filters.department}
                   onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select department" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.departments.map((dept) => (
                       <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Year Filter */}
               <div className="space-y-2">
                 <Label>Year</Label>
                 <Select
                   value={filters.year}
                   onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select year" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.years.map((year) => (
                       <SelectItem key={year} value={year}>{year}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* City Filter */}
               <div className="space-y-2">
                 <Label>City</Label>
                 <Select
                   value={filters.city}
                   onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select city" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.cities.map((city) => (
                       <SelectItem key={city} value={city}>{city}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* State Filter */}
               <div className="space-y-2">
                 <Label>State</Label>
                 <Select
                   value={filters.state}
                   onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select state" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     {filterOptions.states.map((state) => (
                       <SelectItem key={state} value={state}>{state}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>

              {/* Amount Range Filters */}
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="table-fixed w-[200%]">
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="whitespace-normal break-words"
                      key={cell.id}
                    >
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
                  No payments found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          {/* <span>
            Page{" "}
            <em>
              {pageIndex + 1} of {table.getPageCount()}
            </em>
          </span> */}
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

      {/* Edit Dialog (dynamic fields) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingPerson && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.keys(editingPerson)
                .filter((key) => key !== "id" && key !== "_id" && key !== "__v")
                .map((key) => (
                  <div key={key}>
                    <Label>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    <Input
                      value={editingPerson[key] ?? ""}
                      onChange={(e) =>
                        setEditingPerson({
                          ...editingPerson,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
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
            Are you sure you want to delete this record? This action cannot be
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
    </div>
  );
}
