"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {  setActivePage } from "@/state/reducers/ScoreCardReducer";
import { useCreateFlightLogsMutation } from "@/state/api";
import { Old_Standard_TT } from "next/font/google";
import ReplaceAllModal from "./ReplaceAllModal";
import { PAGINATION_DEFAULT_PAGE_SIZE, PAGINATION_PAGE_SIZE_OPTIONS } from "@/lib/utils";

// Memoized InputCell component
const InputCell = memo(
  ({
    value,
    onBlur,
    disabled,
    className,
  }: {
    value: string;
    onBlur: (value: string) => void;
    disabled: boolean;
    className: string;
  }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    return (
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => onBlur(inputValue)}
        className={className}
        disabled={disabled}
      />
    );
  }
);
InputCell.displayName = "InputCell";

interface FlightData {
  [key: string]: string | undefined;
}

export function Review({ apiData }: { apiData: any }) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_DEFAULT_PAGE_SIZE);
  const [createFlightLogs, { isLoading }] = useCreateFlightLogsMutation();
  const { columnMappings } = useAppSelector((state) => state.scorecard);
  const [showReplaceAllDialog, setShowReplaceAllDialog] = useState(false);
  const [replaceAllDialogData, setReplaceAllDialogData] = useState({ oldValue: "", newValue: "" });
  const columnDataTypes = new Map<string, string>(columnMappings.map((col: any) => [col.headerName, col.dataType]));

  // Use useState instead of useRef for draftData
  const [draftData, setDraftData] = useState<FlightData[]>(
    apiData.rows.map((row: string[]) => {
      const obj: FlightData = {};
      apiData.headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || "";
      });
      return obj;
    })
  );

  const initialMappings = useMemo(() => {
    const mappings: Record<string, string> = {};
    apiData.headers.forEach((header: string) => {
      mappings[header] = header;
    });
    apiData.columnMappingSuggestions.renameSuggestions.forEach((suggestion: { original: string; rename: string }) => {
      mappings[suggestion.original] = suggestion.rename;
    });
    return mappings;
  }, [apiData]);

  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [enabledColumns, setEnabledColumns] = useState<Set<string>>(
    new Set(
      apiData.headers.filter((header: string) => !apiData.columnMappingSuggestions.removalSuggestions.includes(header))
    )
  );

  const removalSuggestions = useMemo(() => new Set(apiData.columnMappingSuggestions.removalSuggestions), [apiData]);

  const handleInputChange = useCallback((index: number, field: string, value: string) => {
    setDraftData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
    console.log(`Updated row ${index}, field ${field} to ${value}`);
  }, []);

  const handleColumnMappingChange = useCallback((original: string, newValue: string) => {
    setMappings((prev) => ({
      ...prev,
      [original]: newValue,
    }));
  }, []);

  const toggleColumn = useCallback((header: string) => {
    setEnabledColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(header)) {
        newSet.delete(header);
      } else {
        newSet.add(header);
      }
      return newSet;
    });
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    const previousRow = draftData[rowIndex];
    setDraftData((prev) => prev.filter((_, idx) => idx !== rowIndex));

    toast.success(`Row ${rowIndex + 1} deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          setDraftData((prev) => {
            const newData = [...prev];
            newData.splice(rowIndex, 0, previousRow); // Restore row at original index
            return newData;
          });
          toast.success(`Row ${rowIndex + 1} restored`);
        },
      },
      duration: 5000,
    });
  }, [draftData]);

  const handleSave = useCallback(async () => {
    console.log("Draft data before filtering:", draftData);

    const filteredData = draftData.map((row) => {
      const newRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        if (enabledColumns.has(key)) {
          const mappedKey = mappings[key] || key;
          let convertedValue: string | undefined | number = value;

          const dataType = columnDataTypes.get(mappedKey);

          switch (dataType) {
            case "number":
              convertedValue = value ? parseFloat(value) : 0;
              if (isNaN(convertedValue)) {
                console.warn(`Invalid number for ${mappedKey} in row: ${value}`);
                convertedValue = 0;
              }
              break;
            case "ISO-8601":
              const date = new Date(value || "");
              convertedValue = date && !isNaN(date.getTime()) ? date.toISOString() : value;
              break;
            case "string":
              convertedValue = value || "";
              break;
            default:
              console.warn(`Unknown data type for ${mappedKey}: ${dataType}`);
              convertedValue = value;
          }

          newRow[mappedKey] = convertedValue;
        }
      });
      return newRow;
    });

    console.log("Filtered and converted data to save:", filteredData);

    if (filteredData.length === 0 || Object.keys(filteredData[0]).length === 0) {
      toast.error("No data to save! Check enabled columns and mappings.");
      return;
    }

    try {
      const response = await createFlightLogs({ logs: filteredData }).unwrap();
      console.log("API response:", response);
      toast.success("Flight logs saved successfully!");
      dispatch(setActivePage("allFlights"));
    } catch (err) {
      console.error("Error saving flight logs:", err);
      toast.error("Failed to save flight logs. Please try again.");
    }
  }, [draftData, mappings, enabledColumns, createFlightLogs, dispatch]);

  const formatHeader = (key: string) => {
    const header = columnMappings.find((mapping) => mapping.headerName === key);
    if (header) {
      return header.displayName;
    } else {
      return key;
    }
  };

  const columns: ColumnDef<FlightData>[] = useMemo(() => {
    return apiData.headers.map((header: string) => {
      const isEnabled = enabledColumns.has(header);
      const mappedName = mappings[header];

      return {
        accessorKey: header,
        header: ({ column }: any) => (
          <div className="flex flex-col gap-2 p-0">
            <Select
              value={mappedName}
              onValueChange={(value) => handleColumnMappingChange(header, value)}
              disabled={!isEnabled}
            >
              <SelectTrigger
                className={`w-full text-black border border-black rounded-none ${
                  !isEnabled ? "bg-gray-300" : "bg-white-50"
                }`}
              >
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent className="bg-white-50 text-black">
                {apiData.availableColumns.filter((col: any) => !col.generated).map((col: any) => (
                  <SelectItem key={col.headerName} value={col.headerName}>
                    {col.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className={`flex-1 hover:bg-gray-700 hover:text-white rounded-none ${
                  !isEnabled ? "bg-gray-400 text-gray-600" : "bg-black text-white"
                }`}
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                disabled={!isEnabled}
              >
                {formatHeader(header)}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className={`w-20 rounded-none transition-colors duration-200 ${
                  isEnabled ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                onClick={() => toggleColumn(header)}
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        ),
        cell: ({ row }: any) => {
          const value = draftData[row.index][header] || "";
          return (
            <InputCell
              value={value}
              onBlur={(newValue) => {
                if (header === "AIRCRAFT_TYPE" && value !== newValue) {
                  setShowReplaceAllDialog(true);
                  setReplaceAllDialogData({ oldValue: value, newValue });
                }
                setDraftData((prev) => {
                  prev[row.index] = { ...prev[row.index], [header]: newValue };
                  return prev;
                });
              }}
              disabled={!isEnabled}
              className={`border-none w-full text-center p-2 ${
                !isEnabled ? "bg-gray-300 text-gray-600" : "bg-gray-200 text-black"
              }`}
            />
          );
        },
        size: 180,
      };
    });
  }, [apiData.headers, enabledColumns, mappings, handleInputChange, handleColumnMappingChange, toggleColumn, draftData]);

  const table = useReactTable({
    data: draftData,
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

  return (
    <div className="py-8 px-8 w-full h-full bg-white">
      <ReplaceAllModal
        isOpen={showReplaceAllDialog}
        title={`Confirm Aircraft Type Change`}
        message={`Would you like to replace all occurances of "${replaceAllDialogData.oldValue}" to "${replaceAllDialogData.newValue}" ?`}
        onClose={() => setShowReplaceAllDialog(false)}
        onConfirm={() => {
          const header = "AIRCRAFT_TYPE";
          setDraftData((prev) => {
            return prev.map((row) => {
              if (row[header] === replaceAllDialogData.oldValue) {
                row[header] = replaceAllDialogData.newValue;
              }
              return row;
            });
          });
          setShowReplaceAllDialog(false);
        }}
      />
      <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
      <div className="h-4/5 max-w-[80%] w-full overflow-x-auto">
        <Table className="w-full border-separate border-spacing-2">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="h-20 align-middle min-w-12 p-0"></TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-20 align-middle min-w-40 p-0">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="bg-gray-200 text-black rounded-md">
                <TableCell className="p-1 h-12 align-middle">
                  <Button
                    variant="ghost"
                    className="w-12 rounded-none bg-red-600 text-white hover:bg-red-700"
                    onClick={() => deleteRow(row.index)}
                    title="Delete row"
                  >
                    <Trash2 className="h-4 w-4" color="white" />
                  </Button>
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-1 h-12 align-middle" style={{ width: `${180}px` }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
          className="bg-blue-500 text-white-100 hover:bg-blue-800"
        >
          Previous
        </Button>
        <span className="text-black">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button
          className="bg-blue-500 text-white-100 hover:bg-blue-800"
          variant="outline"
          size="sm"
          onClick={() => setPage(table.getState().pagination.pageIndex + 1)}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <div className="pt-10 flex justify-center">
        <Button
          onClick={handleSave}
          className="bg-orange-500 text-white-100 hover:bg-orange-700 rounded-full text-lg px-8 py-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save And Finish"
          )}
        </Button>
      </div>
    </div>
  );
}