"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  SortingColumn,
  Row,
  Cell,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useAppSelector } from "@/state/redux";
import { CSVLink } from "react-csv";
import { useDeleteAllFlightLogsMutation, useDeleteFlightLogMutation, useGetSimpleFlightAggregatesQuery, useUpdateFlightLogMutation } from "@/state/api";
import { SimpleFlightAggregates } from "@/lib/interfaces/flightAggregates";
import { DateTime } from "luxon";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PAGINATION_DEFAULT_PAGE_SIZE, PAGINATION_PAGE_SIZE_OPTIONS } from "@/lib/utils";

// Memoized InputCell component
const InputCell = memo(
  ({
    value,
    onChange,
    disabled,
    className,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    className: string;
  }) => {
    const [inputValue, setInputValue] = useState(value);

    return (
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        className={className}
        disabled={disabled}
      />
    );
  }
);
InputCell.displayName = "InputCell";

interface FlightData {
  [key: string]: string;
}

function DeleteAllModal({ isOpen, setIsOpen, deleteFlightLog, refetchAggregates }: any) {
  const [loading, setLoading] = useState(false);
  const handleDeleteAll = () => {
    setLoading(true);
    deleteFlightLog({}).then(() => {
      refetchAggregates();
      toast.success(`All flight logs deleted!`);
      setLoading(false);
      setIsOpen(false);
    }).catch(() => {
      toast.error(`Error deleting flight logs`);
      setLoading(false);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white-50">
        <DialogTitle className="text-black font-bold text-2xl">Are you sure you want to <b>DELETE ALL</b> flight logs?</DialogTitle>
        <div className="text-black text-lg font-semibold mb-4">
          This action cannot be undone.
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleDeleteAll}
              disabled={loading}
              className={`bg-red-500 font-bold text-white-100 hover:bg-orange-800 flex items-center gap-2 px-10 py-2 rounded-full shrink-0 w-[10]`}
            >
              Delete All Flight Logs
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className={`bg-gray-500 font-bold text-white-100 hover:bg-orange-800 flex items-center gap-2 px-10 py-2 rounded-full shrink-0 w-[10]`}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function AllFlights({ isLoading, isMilitary }: { isLoading: boolean, isMilitary: boolean | undefined }) {
  const { flightData, columnMappings } = useAppSelector((state) => state.scorecard);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_DEFAULT_PAGE_SIZE);
  const [isEditing, setIsEditing] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<string | null>(null);
  const [openDeleteAllModal, setOpenDeleteAllModal] = useState(false);
  const [deleteAllFlightLogs] = useDeleteAllFlightLogsMutation();
  const originalFlightData = useMemo(() => {
    const dataMap = new Map<string, FlightData>();
    flightData.forEach((row: any) => {
      const rowId = row.id;
      const newRow: FlightData = row;
      dataMap.set(rowId, newRow);
    });
    return dataMap;
  }, [flightData]);
  const militaryOnly = isMilitary === true;
  const civilianOnly = isMilitary === false;
  const shouldGetAllFlights = isMilitary === undefined;
  const filteredFlightData = useMemo(() => {
    if (militaryOnly) {
      return flightData.filter((flight:   any) => parseFloat(flight.MILITARY ?? "0") > 0);
    } else if (civilianOnly) {
      return flightData.filter((flight: any) => parseFloat(flight.MILITARY ?? "0") === 0);
    } else {
      return flightData;
    }
  }, [flightData, shouldGetAllFlights, militaryOnly, civilianOnly]);
  useEffect(() => {
    setPage(0);
  }, [filteredFlightData]);
  const [updateFlightLog] = useUpdateFlightLogMutation();
  const [deleteFlightLog] = useDeleteFlightLogMutation();
  const { data: aggregatesData, isLoading: isAggregatesLoading, isFetching: isAggregatesFetching, refetch: refetchAggregates } =
    useGetSimpleFlightAggregatesQuery({ military: isMilitary });
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const aggregates: SimpleFlightAggregates | null = aggregatesData?.aggregates || null;
  const totals = useMemo(() => {
    if (isAggregatesLoading || isAggregatesFetching || !aggregates) {
      return {
        totalFlightHours: '...',
        pic: '...',
        sic: '...',
        xc: '...',
        night: '...',
        instrument: '...',
      };
    }
    return {
      totalFlightHours: (aggregates?.totalHours || 0).toFixed(1),
      pic: (aggregates?.totalPilotInCommandHours || 0).toFixed(1),
      sic: (aggregates?.totalSecondInCommandHours || 0).toFixed(1),
      xc: (aggregates?.totalCrossCountryHours || 0).toFixed(1),
      night: (aggregates?.totalNightHours || 0).toFixed(1),
      instrument: (aggregates?.totalInstrumentHours || 0).toFixed(1),
    };
  }, [aggregates, isAggregatesLoading, isAggregatesFetching, isMilitary]);

  const data = useMemo(() => {
    if (!filteredFlightData || !filteredFlightData.length) return [];
    const excludedKeys = new Set(["userId", "createdAt", "updatedAt"]);
    return filteredFlightData.map((row) => {
      const mappedRow: FlightData = {};
      Object.entries(row).forEach(([key, value]) => {
        if (!excludedKeys.has(key) && value !== null && value !== undefined && value !== "") {
          mappedRow[key] = String(value);
        }
      });
      return mappedRow;
    });
  }, [filteredFlightData]);

  const allKeys = useMemo(() => {
    const keySet = new Set<string>();
    data.forEach((row) => Object.keys(row).forEach((key) => keySet.add(key)));
    const columnsToHide = columnMappings.filter((mapping) => mapping.generated).map((mapping) => mapping.headerName);
    columnsToHide.forEach((key) => keySet.delete(key));
    return Array.from(keySet)
  }, [data, columnMappings]);

  const csvdata = useMemo(() => {
    return {
      data: data,
      headers: allKeys,
    };
  }, [filteredFlightData]);

  const formatHeader = (key: string) => {
    const header = columnMappings.find((mapping) => mapping.headerName === key);
    if (header) {
      return header.displayName;
    } else {
      return key;
    }
  };

  const formatFlightDate = (dateString: string) => {
    const date = DateTime.fromISO(dateString, { zone: "UTC" });
    return date.toFormat("MM/dd/yyyy");
  };

  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
  };

  const saveRow = (row: Row<FlightData>) => () => {
    updateFlightLog({
      flightId: row.original.id,
      updatedFlight: row.original
    }).then(refetchAggregates).then(() => {
      setRowToEdit(null);
      toast.success(`Log saved!`);
    }).catch((error) => {
      toast.error(`Error saving log`);
    });
  };

  const editRow = (row: Row<FlightData>) => () => {
    setRowToEdit(row.id);
  };

  const cancelEditRow = (row: Row<FlightData>) => {
    setRowToEdit(null);
    row.original = {...originalFlightData.get(row.original.id)};
  };

  const deleteRow = (row: Row<FlightData>) => () => {
    deleteFlightLog({
      flightId: row.original.id,
    });
    refetchAggregates();
    toast.success(`Log deleted!`);
  };

  const columns: ColumnDef<FlightData>[] = useMemo(() => {
    const actionsColumn: ColumnDef<FlightData> = {
      id: "actions",
      header: ({ column }: { column: SortingColumn<FlightData> }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-700 hover:text-white w-[10rem] justify-center transition-colors duration-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Actions
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const isRowEditing = row.id === rowToEdit;
        return (<div className="text-center no-wrap gap-2 w-full flex justify-center">
          <Button
            variant="outline"
            className="bg-green-500 text-white"
            disabled={!isRowEditing && rowToEdit !== null}
            onClick={isRowEditing ? saveRow(row) : editRow(row)}
          >
            {isRowEditing ? "Save" : "Edit"}
          </Button>
          <Button
            variant="outline"
            className="bg-red-500 text-white"
            disabled={!isRowEditing && rowToEdit !== null}
            onClick={isRowEditing ? () => cancelEditRow(row) : deleteRow(row)}
          >
            {isRowEditing ? "Cancel" : "Delete"}
          </Button>
        </div>
      )},
      size: 150,
    };
    const allColumns = allKeys.filter((key) => key !== "id").map((key: string): ColumnDef<FlightData> => ({
      accessorKey: key,
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-white hover:bg-gray-700 hover:text-white w-full justify-center transition-colors duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {formatHeader(key)}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {key === "DATE_TIME" ? formatFlightDate(row.original[key]) : row.original[key] || ''}
        </div>
      ),
      size: 180,
    }));
    return isEditing ? [actionsColumn, ...allColumns] : allColumns;
  }, [allKeys, isEditing, rowToEdit]);

  const renderCell = (cell: Cell<FlightData, any>) => {
    const rowId = cell.row.id;
    if (!isEditing || cell.column.id === "actions" || rowId !== rowToEdit) {
      return flexRender(cell.column.columnDef.cell, cell.getContext());
    }
    const columnId = cell.column.id;
    const cellValue = cell.row.original[columnId] || "";
    return (
      <InputCell
        value={cellValue}
        onChange={(value) => {
          cell.row.original[cell.column.id] = value;
        }}
        disabled={!isEditing}
        className="w-full h-full text-center"
      />
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
  });

  const LoadingState = () => (
    <div className="py-8 w-full h-full bg-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-black">Loading flight data...</p>
      </div>
    </div>
  );

  const NoDataState = () => (
    <div className="py-8 w-full h-full bg-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
      <p className="text-black">No flight data available. Please upload and save data first.</p>
    </div>
  );

  const Totals = () => (
    <div className="flex flex-row gap-4 mb-6 pt-10 w-1/2">
      <div className="bg-gray-200 p-4 flex-1 border border-black">
        <div className="flex justify-between mb-2">
          <span className="text-black font-semibold">Total Flight Hours</span>
          <span className="text-orange-600 font-bold">{totals.totalFlightHours}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-black font-semibold">PIC</span>
          <span className="text-orange-600 font-bold">{totals.pic}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black font-semibold">SIC</span>
          <span className="text-orange-600 font-bold">{totals.sic}</span>
        </div>
      </div>
      <div className="bg-gray-200 p-4 flex-1 border border-black">
        <div className="flex justify-between mb-2">
          <span className="text-black font-semibold">Cross Country</span>
          <span className="text-orange-600 font-bold">{totals.xc}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-black font-semibold">Night Time</span>
          <span className="text-orange-600 font-bold">{totals.night}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black font-semibold">Instrument</span>
          <span className="text-orange-600 font-bold">{totals.instrument}</span>
        </div>
      </div>
    </div>
  );

  const TableState = () => (
    <div className="py-8 px-8 w-full h-full bg-white flex flex-col">
      <DeleteAllModal
        isOpen={openDeleteAllModal}
        setIsOpen={setOpenDeleteAllModal}
        deleteFlightLog={deleteAllFlightLogs}
        refetchAggregates={refetchAggregates}
      />
      {/* Sticky Header with Full Width */}
      <div className="sticky top-0 z-10 bg-white pb-4 flex items-center justify-between w-4/5">
        <h1 className="text-3xl font-bold text-black">LOGBOOK</h1>
        <div className="flex items-center justify-end gap-4">
          {isEditing && (
            <Button
              variant="outline"
              onClick={() => setOpenDeleteAllModal(true)}
              className={`bg-red-500 font-bold text-white-100 hover:bg-orange-800 flex items-center gap-2 px-10 py-2 rounded-full shrink-0 w-[10]`}
            >
              Delete All Flight Logs
            </Button>
          )}
          <Button
            variant="outline"
            onClick={toggleEditing}
            className={`${isEditing ? "bg-red-500" : "bg-orange-500"} font-bold text-white-100 hover:bg-orange-800 flex items-center gap-2 px-10 py-2 rounded-full shrink-0 w-[10]`}
          >
            {isEditing ? "Disable Editing" : "Enable Editing"}
          </Button>
          <CSVLink
            data={csvdata.data}
            headers={csvdata.headers}
            filename="all_flights_scorecards.csv"
            className="bg-orange-500 font-bold text-white-100 hover:bg-orange-800 flex items-center gap-2 px-10 py-2 rounded-full shrink-0"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col w-full h-full">
        <Totals />

        {/* Table with Horizontal Scroll */}
        <div className="h-4/5 max-w-[80%] overflow-y-auto overflow-x-auto pb-8 pr-5" style={{ marginLeft: "-4.75px" }}>
          <Table className="min-w-full border-separate border-spacing-2">
            <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-black rounded-md">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12 align-middle min-w-40">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id} className="bg-gray-200 text-black rounded-md">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-1 h-12 align-middle" style={{ width: `${180}px` }}>
                      {renderCell(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-start px-5 space-x-2 py-10 shrink-0">
          <div className="flex items-center space-x-2">
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-blue-500 text-white hover:bg-blue-800 rounded text-white"
              style={{ padding: "0.35rem", width: "4rem" }}
            >
              {PAGINATION_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <label htmlFor="rowsPerPage" className="text-black">
              Rows per page
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(table.getState().pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            className="bg-blue-500 text-white hover:bg-blue-800"
          >
            Previous
          </Button>
          <span className="text-black">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-800"
            variant="outline"
            size="sm"
            onClick={() => setPage(table.getState().pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <LoadingState />;
  if (!data?.length) return <NoDataState />;
  return <TableState />;
}
